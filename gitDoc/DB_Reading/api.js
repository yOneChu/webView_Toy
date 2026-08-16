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

/* =============================================================================
 * ★ DB 명세서(Spec) 계층
 *
 * UI(app.js)는 오직 window.DbSpecStore 만 사용합니다.
 * 명세서마다 조회 URL / 저장 URL 을 따로 지정할 수 있습니다.
 *
 *   명세서에 readUrl 이 있으면  → 실제 API 호출
 *   readUrl 이 없으면(null)      → localStorage 목업 (API 만들기 전까지)
 *
 *   saveUrl 이 없으면            → 읽기 전용(편집 버튼 비활성)
 * ===========================================================================*/

/* ------------------------------------------------------------------ *
 * ▼▼▼ 명세서 3종 설정 — API가 준비되는 대로 여기만 채우면 됩니다 ▼▼▼
 *
 *   readUrl    : 마크다운 본문을 가져올 GET URL (전체 주소)
 *   saveUrl    : 수정 내용을 저장할 URL. null 이면 읽기 전용으로 동작
 *   saveMethod : 저장 시 HTTP 메서드 (기본 'POST')
 * ------------------------------------------------------------------ */
const DB_SPEC_TYPES = [
    {
        id: 'ECO_VERIFY', name: 'ECO 검증', icon: 'shield-check',
        readUrl: null,   // TODO: 예) 'http://localhost:8070/apiv2/getEcoMetaInfo?key=subae'
        saveUrl: null,   // TODO: 저장 API 주소
        saveMethod: 'POST',
    },
    {
        id: 'LOGIC_WRITE', name: '로직 작성', icon: 'pen-tool',
        readUrl: 'http://localhost:8070/apiv2/getLogicWriteAsDB?key=subae',   // TODO: 조회 API 주소
        saveUrl: null,   // TODO: 저장 API 주소
        saveMethod: 'POST',
    },
    {
        id: 'LOGIC_VERIFY', name: '로직 검증', icon: 'check-check',
        // ★ 연결 완료 — text/plain 마크다운 원문을 그대로 반환하는 API
        readUrl: 'http://localhost:8070/apiv2/getPIDMetaInfo?key=subae',
        saveUrl: null,   // TODO: 저장 API를 만들면 여기에 주소를 넣으세요 (그 순간 편집 가능해집니다)
        saveMethod: 'POST',
    },
];

/* ------------------------------------------------------------------ *
 * Spec 데이터 모델 (app.js 가 기대하는 형태)
 *   Spec { id, name, icon, content(markdown), author, updatedAt(ISO), readOnly }
 * ------------------------------------------------------------------ */

/* ================================================================== *
 * 3) SpecStore — 명세서 조회/저장 통합 저장소
 *
 *   [조회]  GET  readUrl
 *           · Content-Type 이 text/* 이면  → 응답 본문 전체가 마크다운
 *           · application/json 이면        → content / CONTENT / data / result
 *                                            필드에서 마크다운을 꺼냅니다
 *
 *   [저장]  saveMethod saveUrl
 *           → body: { "id":"LOGIC_VERIFY", "content":"마크다운", "author":"홍길동" }
 *           ← 아무 응답이나 OK (200/204 모두 정상 처리)
 *
 *   ※ 서버 응답 필드명이 다르면 _pickContent() / _buildSaveBody() 만 고치세요.
 * ================================================================== */
class SpecStore {
    constructor({ headers = {}, mockKey = 'teamdocs.specs.v1' } = {}) {
        this.headers = headers;                 // 필요 시 { Authorization: 'Bearer ...' }
        this.KEY = mockKey;
        if (!localStorage.getItem(this.KEY)) localStorage.setItem(this.KEY, JSON.stringify(SPEC_SEED));
    }

    _type(id) { return DB_SPEC_TYPES.find(t => t.id === id); }
    _readMock()      { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch { return {}; } }
    _writeMock(data) { localStorage.setItem(this.KEY, JSON.stringify(data)); }

    /** 응답에서 마크다운 본문만 추출 */
    _pickContent(raw, contentType) {
        if (!contentType.includes('json')) return raw;          // text/plain, text/markdown …
        try {
            const j = JSON.parse(raw);
            if (typeof j === 'string') return j;
            return j.content ?? j.CONTENT ?? j.data ?? j.result ?? j.text ?? raw;
        } catch { return raw; }                                 // JSON 이라 했지만 아닌 경우
    }

    /** 저장 요청 body 구성 (서버 스펙에 맞춰 수정하세요) */
    _buildSaveBody(id, content, author) {
        return JSON.stringify({ id, content, author });
    }

    async getSpecTypes() {
        return DB_SPEC_TYPES.map(t => ({
            id: t.id, name: t.name, icon: t.icon,
            live: !!t.readUrl,                    // 실 API 연결 여부 (사이드바 표시용)
            readOnly: !!t.readUrl && !t.saveUrl,  // 조회만 가능한 상태
        }));
    }

    async getSpec(id) {
        const t = this._type(id);
        if (!t) throw new Error('알 수 없는 명세서: ' + id);

        const base = {
            id, name: t.name, icon: t.icon,
            live: !!t.readUrl,
            readOnly: !!t.readUrl && !t.saveUrl,
        };

        /* --- 목업 모드 (readUrl 미설정) --- */
        if (!t.readUrl) {
            const row = this._readMock()[id] || {};
            return { ...base, content: row.content || '', author: row.author || '', updatedAt: row.updatedAt || nowISO() };
        }

        /* --- 실 API 모드 --- */
        const res = await fetch(t.readUrl, { headers: this.headers });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        const raw = await res.text();
        const content = this._pickContent(raw, ct);

        return {
            ...base,
            content: typeof content === 'string' ? content : String(content ?? ''),
            author: t.author || 'DB',
            updatedAt: res.headers.get('last-modified') || nowISO(),
        };
    }

    async saveSpec(id, { content, author }) {
        const t = this._type(id);
        if (!t) throw new Error('알 수 없는 명세서: ' + id);

        /* --- 목업 모드 --- */
        if (!t.readUrl) {
            const data = this._readMock();
            data[id] = { content, author, updatedAt: nowISO() };
            this._writeMock(data);
            return this.getSpec(id);
        }

        /* --- 실 API 인데 저장 주소가 없는 경우 --- */
        if (!t.saveUrl) {
            throw new Error(`'${t.name}' 저장 API가 아직 없습니다. api.js 의 DB_SPEC_TYPES 에서 saveUrl 을 지정하세요.`);
        }

        /* --- 실 API 저장 --- */
        const res = await fetch(t.saveUrl, {
            method: t.saveMethod || 'POST',
            headers: { 'Content-Type': 'application/json', ...this.headers },
            body: this._buildSaveBody(id, content, author),
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return this.getSpec(id);   // 저장 후 DB 기준으로 다시 읽어옴
    }
}
/* 목업 초기 데이터 ---------------------------------------------------
 * readUrl 이 지정된 명세서(현재 '로직 검증')는 이 시드를 사용하지 않고
 * 항상 실제 API 에서 내용을 가져옵니다.
 * ------------------------------------------------------------------ */
const SPEC_SEED = {
    ECO_VERIFY: {
        author: '관리자', updatedAt: nowISO(),
        content: `# ECO 검증 명세서

> 이 문서는 **목업 데이터**입니다. 실제 API 연결 후 DB 내용으로 대체됩니다.

## 1. 개요
ECO(Engineering Change Order) 반영 결과가 PLM 데이터에 정확히 적용되었는지 검증하는 절차를 정의한다.

## 2. 검증 항목
| 구분 | 검증 내용 | 판정 기준 |
|---|---|---|
| 헤더 | ECO 번호 / 승인 상태 | 승인(Approved) 상태만 반영 |
| 대상 | 변경 대상 품번 존재 여부 | 마스터에 존재해야 함 |
| 이력 | 변경 전/후 값 이력 기록 | 누락 시 오류 |

## 3. 판정
- **정상**: 전체 항목 통과
- **오류**: 1건 이상 미통과 → 담당자 통보`,
    },
    LOGIC_WRITE: {
        author: '관리자', updatedAt: nowISO(),
        content: `# 로직 작성 명세서

> 이 문서는 **목업 데이터**입니다. 실제 API 연결 후 DB 내용으로 대체됩니다.

## 1. 목적
PID(Variant) 로직 작성 시 지켜야 할 표준 규칙을 정의한다.

## 2. 작성 규칙
1. 조건은 \`SPEC1~20\` / \`CON1~20\` 쌍으로 작성한다.
2. 결과는 \`KEY1~20\` / \`VAL1~20\` 쌍으로 작성한다.
3. 분기는 \`ADDR\`, \`GOTO\` 를 사용하며 순환 참조를 금지한다.
4. 변경 사유는 반드시 \`REMARKS\` 에 남긴다.

## 3. 예시
\`\`\`text
NO   SPEC1   CON1   KEY1   VAL1   GOTO
10   MODEL   =A     TYPE   STD    -
20   MODEL   =B     TYPE   OPT    100
\`\`\``,
    },
    LOGIC_VERIFY: {
        author: '관리자', updatedAt: nowISO(),
        content: `# PID 버전 비교 분석 업무수행 워크플로우 (Workflow)

## 1. 개요 및 목적
본 워크플로우는 PLM PID(Variant) 로직의 버전 간 차이점(조건, 결과, 분기, 비고 등)을 표준화된 절차로 비교 분석하고, 결과를 CSV, Excel 및 텍스트 보고서 형태로 자동 추출·보고하는 업무 가이드이다.

---

## 2. 사용자 요청 패턴

사용자가 다음과 같은 형태의 질문이나 지시를 내렸을 때 본 워크플로우를 가동한다.

1. **특정 버전 지정 비교**:
   - 예시: \`B181A01 pid 28, 29버전 비교해서 분석 보고해줘\`
   - 예시: \`EL_PA103A pid 10버전이랑 12버전 차이점 분석해줘\`
2. **버전 미지정 (최신/직전 자동 비교)**:
   - 예시: \`B181A01 pid 최신 버전이랑 직전 버전 비교해줘\`
   - 예시: \`EL_PA103A pid 변경사항 비교 분석 보고서 만들어줘\`

---

## 3. 단계별 워크플로우 (Step-by-Step Workflow)

### 1단계: 파라미터 추출 및 비교 버전 결정
1. 사용자의 요청에서 **PID명**과 **비교 버전(v1, v2)**을 확인한다.
2. 버전을 입력받지 않은 경우:
   - DB 테이블 \`HDEL_DEFAULT.VARIANT_H\`에서 해당 PID의 버전 목록을 조회한다.
   - 가장 최신 정수 버전(\`v_latest\`)과 직전 정수 버전(\`v_prev\`)을 비교 대상으로 자동 선택한다.

### 2단계: DB SELECT 쿼리 수행 및 CSV/Excel 추출
1. \`HDEL_DEFAULT.VARIANT_D\`와 \`HDEL_DEFAULT.VARIANT_H\` 테이블을 조인하여 선택된 두 버전의 전체 행(\`NO\`) 데이터를 조회한다.
2. 사내 규칙에 맞춰 \`scripts/db_query\` 스크립트를 호출한다:
   - **CSV 저장**: \`uv run python scripts/db_query/query_to_csv.py\`
     - 저장 경로: \`output_csv/[PID명]_v[v1]_v[v2]_comparison.csv\`
   - **Excel 저장**: \`uv run python scripts/db_query/query_to_excel.py\`
     - 저장 경로: \`output_excel/[PID명]_v[v1]_v[v2]_comparison.xlsx\`

### 3단계: 범용 파이썬 스크립트로 버전 데이터 정밀 비교
1. 범용 파이썬 비교 모듈 \`src/compare_pid_versions.py\`를 실행한다:
   \`\`\`bash
   uv run python src/compare_pid_versions.py --pid [PID명] --v1 [v1] --v2 [v2]
   \`\`\`
2. 라인 순서(\`NO\`)를 기준으로 행 단위 매칭을 진행하고 다음 차이점을 분류한다:
   - **삭제 라인**: v1에만 존재하는 행
   - **추가 라인**: v2에만 새로 추가된 행
   - **수정 라인**: 조건(\`SPEC1~20\`, \`CON1~20\`), 결과(\`KEY1~20\`, \`VAL1~20\`), 분기(\`ADDR\`, \`GOTO\`), 비고(\`REMARKS\`) 중 변경된 속성 추출

### 4단계: 보고서 작성 및 사용자 결과 보고
1. 차이점 분석 결과를 \`docs/[PID명]_v[v1]_v[v2]_diff_report.txt\` 문서로 저장한다.
2. 사용자 응답으로 다음 항목을 정리하여 전달한다:
   - **기본 정보**: PID명, 비교 버전, HOUID, 등록일자
   - **전체 행 수 및 변경 라인 수**
   - **라인별 변경 세부 내역**: 변경된 특성/컬럼 및 기존값 → 변경값 명시
   - **산출물 링크**: CSV, Excel, 파이썬 코드, 보고서 파일의 절대/상대 링크 제공

---

## 4. 관련 산출물 및 디렉터리 구조

| 산출물 종류 | 경로 | 설명 |
|---|---|---|
| **SQL 쿼리** | \`scripts/db_query/\` | PID 버전 조회용 SQL 스크립트 |
| **CSV 파일** | \`output_csv/\` | 쿼리 수행 결과 CSV |
| **Excel 파일** | \`output_excel/\` | 쿼리 수행 결과 Excel (xlsx) |
| **실행 코드** | \`src/\` | \`compare_pid_versions.py\` (범용 비교 스크립트) |
| **문서 보고서** | \`docs/\` | \`[PID명]_v[v1]_v[v2]_diff_report.txt\` |

---

## 5. 원칙 및 금지사항
1. **DB SELECT 전용**: 데이터 변경(\`INSERT\`, \`UPDATE\`, \`DELETE\`, \`ALTER\` 등) SQL은 일절 금지하며 \`SELECT\` 문만 사용한다.
2. **uv 가상환경**: 패키지 실행 및 스크립트 동작은 워크스페이스 최상위의 \`.venv\` 가상환경 및 \`uv\` 도구를 사용한다.
3. **인코딩 표준**: 모든 파일 입출력 시 \`utf-8-sig\` 또는 \`utf-8\` 인코딩을 적용하여 한글 깨짐을 방지한다.`,
    },
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

/* ---------------- DB 명세서 저장소 ----------------
 * 저장소는 하나뿐입니다. 명세서별 API 주소는 위쪽 DB_SPEC_TYPES 에서 지정하세요.
 *   · readUrl 있음 → 실제 API 조회
 *   · readUrl 없음 → localStorage 목업
 * -------------------------------------------------- */
window.DbSpecStore = new SpecStore({
    // headers: { Authorization: 'Bearer <token>' }   // 필요 시 공통 인증 헤더
});
