/* =============================================================================
 * api.js — 데이터 접근 계층 (Data Access Layer)
 *
 * UI(app.js)는 오직 window.TeamDocsStore 만 사용합니다.
 * 저장소 구현을 교체해도 UI 코드는 그대로 동작합니다.
 *
 *   ┌─────────────┐        ┌──────────────────┐
 *   │   app.js    │ ─────▶ │  TeamDocsStore    │
 *   └─────────────┘        └──────────────────┘
 *                                  │
 *                 ┌────────────────┴─────────────────┐
 *                 ▼                                   ▼
 *          LocalStore (기본)                    ApiStore (MS-SQL)
 *       브라우저 localStorage                REST → 백엔드 → MS-SQL DB
 *
 * ▶ MS-SQL 연동 방법:
 *   맨 아래 STORE 선택 부분에서 LocalStore → ApiStore 로 바꾸고,
 *   ApiStore 의 baseUrl 을 백엔드 주소로 지정하세요.
 *   백엔드가 아래 REST 계약(엔드포인트)을 구현하면 됩니다.
 * ===========================================================================*/

/* ------------------------------------------------------------------ *
 * 데이터 모델
 *   Category { id, name, icon, order }
 *   Doc      { id, title, categoryId, content(markdown), author,
 *              createdAt(ISO), updatedAt(ISO), order }
 * ------------------------------------------------------------------ */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const nowISO = () => new Date().toISOString();

/* ================================================================== *
 * 1) LocalStore — 백엔드 없이 즉시 동작 (브라우저 localStorage)
 * ================================================================== */
class LocalStore {
    constructor() {
        this.KEY = 'teamdocs.v1';
        this._seedIfEmpty();
    }

    _read() {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || { categories: [], docs: [] }; }
        catch { return { categories: [], docs: [] }; }
    }
    _write(data) { localStorage.setItem(this.KEY, JSON.stringify(data)); }

    _seedIfEmpty() {
        const cur = this._read();
        if (cur.categories.length || cur.docs.length) return;
        this._write(SEED_DATA);
    }

    // --- 조회 ---
    async getCategories() {
        return this._read().categories.sort((a, b) => a.order - b.order);
    }
    async getDocs() {
        return this._read().docs.sort((a, b) => a.order - b.order);
    }
    async getDoc(id) {
        return this._read().docs.find(d => d.id === id) || null;
    }

    // --- 카테고리 ---
    async createCategory({ name, icon = 'folder' }) {
        const data = this._read();
        const cat = { id: uid(), name, icon, order: data.categories.length };
        data.categories.push(cat);
        this._write(data);
        return cat;
    }
    async updateCategory(id, patch) {
        const data = this._read();
        const c = data.categories.find(x => x.id === id);
        if (c) Object.assign(c, patch);
        this._write(data);
        return c;
    }
    async deleteCategory(id) {
        const data = this._read();
        data.categories = data.categories.filter(c => c.id !== id);
        data.docs = data.docs.filter(d => d.categoryId !== id); // 하위 문서도 삭제
        this._write(data);
    }

    // --- 문서 ---
    async createDoc({ title, categoryId, content, author }) {
        const data = this._read();
        const doc = {
            id: uid(), title, categoryId, content, author,
            createdAt: nowISO(), updatedAt: nowISO(),
            order: data.docs.filter(d => d.categoryId === categoryId).length,
        };
        data.docs.push(doc);
        this._write(data);
        return doc;
    }
    async updateDoc(id, patch) {
        const data = this._read();
        const d = data.docs.find(x => x.id === id);
        if (d) Object.assign(d, patch, { updatedAt: nowISO() });
        this._write(data);
        return d;
    }
    async deleteDoc(id) {
        const data = this._read();
        data.docs = data.docs.filter(d => d.id !== id);
        this._write(data);
    }

    // --- 백업 ---
    async exportAll() { return this._read(); }
    async importAll(data) { this._write(data); }
}

/* ================================================================== *
 * 2) ApiStore — MS-SQL 백엔드 연동용 REST 어댑터
 *
 *   백엔드가 구현해야 할 엔드포인트(REST 계약):
 *     GET    {base}/categories            → Category[]
 *     POST   {base}/categories            → Category      body: {name, icon}
 *     PUT    {base}/categories/:id        → Category      body: patch
 *     DELETE {base}/categories/:id        → 204
 *     GET    {base}/docs                  → Doc[] (content 제외 목록 가능)
 *     GET    {base}/docs/:id              → Doc
 *     POST   {base}/docs                  → Doc           body: {title,categoryId,content,author}
 *     PUT    {base}/docs/:id              → Doc           body: patch
 *     DELETE {base}/docs/:id              → 204
 *
 *   ※ 서버는 MS-SQL 테이블(Categories, Docs)에 매핑해 주세요.
 *     예) createdAt/updatedAt 은 DATETIME2, content 는 NVARCHAR(MAX).
 * ================================================================== */
class ApiStore {
    constructor(baseUrl, { headers = {} } = {}) {
        this.base = baseUrl.replace(/\/$/, '');
        this.headers = { 'Content-Type': 'application/json', ...headers };
    }
    async _req(path, opts = {}) {
        const res = await fetch(this.base + path, { headers: this.headers, ...opts });
        if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
        return res.status === 204 ? null : res.json();
    }

    getCategories() { return this._req('/categories'); }
    getDocs()       { return this._req('/docs'); }
    getDoc(id)      { return this._req('/docs/' + id); }

    createCategory(body)     { return this._req('/categories', { method: 'POST', body: JSON.stringify(body) }); }
    updateCategory(id, body) { return this._req('/categories/' + id, { method: 'PUT', body: JSON.stringify(body) }); }
    deleteCategory(id)       { return this._req('/categories/' + id, { method: 'DELETE' }); }

    createDoc(body)     { return this._req('/docs', { method: 'POST', body: JSON.stringify(body) }); }
    updateDoc(id, body) { return this._req('/docs/' + id, { method: 'PUT', body: JSON.stringify(body) }); }
    deleteDoc(id)       { return this._req('/docs/' + id, { method: 'DELETE' }); }

    // 서버 연동 시 백업은 백엔드에서 처리 권장. 프론트 폴백:
    async exportAll() { return { categories: await this.getCategories(), docs: await this.getDocs() }; }
    async importAll() { throw new Error('서버 모드에서는 백엔드 마이그레이션을 사용하세요.'); }
}

/* ================================================================== *
 * 초기 시드 데이터 (첫 실행 시 예시 매뉴얼)
 * ================================================================== */
const SEED_DATA = {
    categories: [
        { id: 'c-guide', name: '시작 가이드', icon: 'rocket', order: 0 },
        { id: 'c-dev',   name: '개발 매뉴얼', icon: 'code',   order: 1 },
        { id: 'c-ops',   name: '운영 / 업무', icon: 'settings', order: 2 },
    ],
    docs: [
        {
            id: 'd-welcome', title: 'TeamDocs 사용법', categoryId: 'c-guide', author: '관리자',
            createdAt: nowISO(), updatedAt: nowISO(), order: 0,
            content: `# TeamDocs에 오신 것을 환영합니다 👋

**TeamDocs**는 팀원 누구나 업무 매뉴얼을 작성하고 공유하는 사내 문서 시스템입니다.

## 주요 기능

- 📝 **마크다운 작성** — 왼쪽에 작성하면 오른쪽에 실시간 미리보기
- 🗂 **카테고리 정리** — 매뉴얼을 주제별 폴더로 구성
- 🔍 **빠른 검색** — 제목·본문 전체에서 즉시 검색
- 🌙 **다크 모드** — 눈이 편한 야간 테마

## 시작하기

1. 왼쪽 아래 **새 문서 작성** 버튼을 누릅니다.
2. 제목과 카테고리를 정하고 마크다운으로 내용을 씁니다.
3. **저장**하면 팀원 모두가 볼 수 있습니다.

> 💡 이 문서도 편집할 수 있어요. 상단의 편집 버튼을 눌러보세요.`,
        },
        {
            id: 'd-md', title: '마크다운 문법 치트시트', categoryId: 'c-guide', author: '관리자',
            createdAt: nowISO(), updatedAt: nowISO(), order: 1,
            content: `# 마크다운 문법

## 텍스트 강조
**굵게**, *기울임*, \`인라인 코드\`

## 목록
- 순서 없는 항목
1. 순서 있는 항목

## 코드 블록
\`\`\`javascript
function hello() {
  console.log("TeamDocs");
}
\`\`\`

## 표
| 항목 | 설명 |
|------|------|
| 제목 | 문서 제목 |
| 작성자 | 담당 팀원 |

## 인용
> 중요한 참고 사항은 이렇게 표시합니다.`,
        },
        {
            id: 'd-deploy', title: '배포 프로세스', categoryId: 'c-dev', author: '개발팀',
            createdAt: nowISO(), updatedAt: nowISO(), order: 0,
            content: `# 배포 프로세스

## 1. 사전 점검
- [ ] 테스트 통과 확인
- [ ] 리뷰 승인 확인

## 2. 배포 절차
\`\`\`bash
git pull origin master
npm run build
npm run deploy
\`\`\`

## 3. 배포 후 확인
서비스 상태를 모니터링하고 로그를 확인합니다.`,
        },
    ],
};

/* ================================================================== *
 * ▶ STORE 선택 (여기서 저장소를 교체하세요)
 * ================================================================== */

// [기본] 백엔드 없이 브라우저에 저장 — 지금 바로 동작
window.TeamDocsStore = new LocalStore();

// [MS-SQL 연동 시] 위 줄을 주석 처리하고 아래 줄을 사용하세요:
// window.TeamDocsStore = new ApiStore('https://your-backend/api', {
//     headers: { Authorization: 'Bearer <token>' }   // 필요 시 인증 헤더
// });
