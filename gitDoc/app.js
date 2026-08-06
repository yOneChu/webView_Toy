/* =============================================================================
 * app.js — TeamDocs UI 로직
 * 데이터는 window.TeamDocsStore (api.js) 만 통해 접근합니다.
 * ===========================================================================*/
(() => {
    const store = window.TeamDocsStore;
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];

    // 상태
    let categories = [];
    let docs = [];
    let currentDocId = null;
    let editingId = null;      // null=신규, id=기존 편집
    let searchTerm = '';

    /* --------------------- 마크다운 렌더 --------------------- */
    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight(code, lang) {
            try {
                if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
                return hljs.highlightAuto(code).value;
            } catch { return code; }
        },
    });
    const renderMarkdown = (md) => DOMPurify.sanitize(marked.parse(md || ''));

    /* --------------------- 아이콘 새로고침 --------------------- */
    const icons = () => window.lucide && lucide.createIcons();

    /* --------------------- 토스트 --------------------- */
    let toastTimer;
    function toast(msg, icon = 'check-circle') {
        const el = $('#toast');
        el.firstElementChild.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i><span>${msg}</span>`;
        el.classList.remove('hidden');
        icons();
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
    }

    /* --------------------- 데이터 로드 --------------------- */
    async function loadData() {
        [categories, docs] = await Promise.all([store.getCategories(), store.getDocs()]);
    }

    /* --------------------- 사이드바 트리 렌더 --------------------- */
    function renderTree() {
        const tree = $('#docTree');
        const term = searchTerm.trim().toLowerCase();

        const matches = (d) => !term ||
            d.title.toLowerCase().includes(term) ||
            (d.content || '').toLowerCase().includes(term);

        let html = '';
        for (const cat of categories) {
            const catDocs = docs.filter(d => d.categoryId === cat.id && matches(d));
            if (term && catDocs.length === 0) continue;

            html += `
            <div class="mb-1" data-cat="${cat.id}">
                <div class="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide text-apple-gray">
                    <i data-lucide="${escapeAttr(cat.icon || 'folder')}" class="w-3.5 h-3.5"></i>
                    <span class="flex-1 truncate normal-case tracking-normal text-[13px]">${escapeHtml(cat.name)}</span>
                    <button data-delcat="${cat.id}" title="카테고리 삭제" class="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="mt-0.5 space-y-0.5">`;

            if (catDocs.length === 0) {
                html += `<div class="pl-8 pr-2 py-1 text-xs text-apple-gray/60 italic">문서 없음</div>`;
            }
            for (const d of catDocs) {
                const active = d.id === currentDocId;
                html += `
                    <a href="#" data-doc="${d.id}"
                       class="flex items-center gap-2 pl-8 pr-2 py-1.5 rounded-lg text-[13.5px] transition ${
                        active ? 'bg-apple-blue/10 text-apple-blue font-medium' : 'text-apple-ink dark:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'}">
                        <span class="truncate">${escapeHtml(d.title)}</span>
                    </a>`;
            }
            html += `</div></div>`;
        }

        if (!html) {
            html = `<div class="px-4 py-8 text-center text-sm text-apple-gray">${term ? '검색 결과가 없습니다.' : '문서가 없습니다.'}</div>`;
        }
        tree.innerHTML = html;
        icons();
    }

    /* --------------------- 문서 뷰어 --------------------- */
    async function openDoc(id) {
        const doc = await store.getDoc(id);
        if (!doc) return;
        currentDocId = id;
        editingId = null;

        showView('viewer');
        const cat = categories.find(c => c.id === doc.categoryId);

        // 브레드크럼
        $('#breadcrumb').innerHTML = `
            <span class="inline-flex items-center gap-1.5">
                <i data-lucide="${escapeAttr(cat?.icon || 'folder')}" class="w-3.5 h-3.5"></i>
                ${escapeHtml(cat?.name || '미분류')}
                <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-50"></i>
                <span class="text-apple-ink dark:text-gray-200 font-medium">${escapeHtml(doc.title)}</span>
            </span>`;

        // 액션 버튼
        $('#viewActions').innerHTML = `
            <button id="editDocBtn" class="h-9 px-3.5 text-sm rounded-lg border border-apple-line dark:border-neutral-700 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition flex items-center gap-1.5">
                <i data-lucide="pencil" class="w-4 h-4"></i> 편집
            </button>
            <button id="delDocBtn" class="h-9 w-9 flex items-center justify-center text-sm rounded-lg border border-apple-line dark:border-neutral-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/40 transition">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>`;

        // 본문
        const meta = `
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-apple-gray mb-8 pb-6 border-b border-apple-line dark:border-neutral-800">
                <span class="inline-flex items-center gap-1.5"><i data-lucide="user" class="w-4 h-4"></i> ${escapeHtml(doc.author || '미상')}</span>
                <span class="inline-flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4"></i> ${formatDate(doc.updatedAt)} 수정</span>
            </div>`;
        $('#viewer').innerHTML = meta + renderMarkdown(doc.content);
        $('#viewer').classList.remove('fade-up'); void $('#viewer').offsetWidth; $('#viewer').classList.add('fade-up');

        buildTOC();
        icons();
        renderTree();
        $('#scrollArea').scrollTop = 0;

        $('#editDocBtn').onclick = () => startEdit(doc.id);
        $('#delDocBtn').onclick = () => deleteDoc(doc.id);
    }

    /* --------------------- 목차(TOC) --------------------- */
    function buildTOC() {
        const heads = $$('#viewer h1, #viewer h2, #viewer h3');
        const toc = $('#toc');
        if (heads.length < 2) { $('#tocPanel').classList.add('hidden'); toc.innerHTML = ''; return; }
        $('#tocPanel').classList.remove('hidden');
        toc.innerHTML = heads.map((h, i) => {
            const id = 'h-' + i;
            h.id = id;
            const pad = h.tagName === 'H1' ? 'pl-3' : h.tagName === 'H2' ? 'pl-3' : 'pl-6';
            return `<li><a href="#${id}" data-toc="${id}" class="block ${pad} -ml-px border-l border-transparent hover:border-apple-blue hover:text-apple-blue text-apple-gray transition py-0.5 leading-snug">${escapeHtml(h.textContent)}</a></li>`;
        }).join('');
        toc.onclick = (e) => {
            const a = e.target.closest('[data-toc]');
            if (!a) return;
            e.preventDefault();
            $('#' + a.dataset.toc)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
    }

    /* --------------------- 편집기 --------------------- */
    function fillCategorySelect(selectedId) {
        $('#editCategory').innerHTML = categories.map(c =>
            `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
        ).join('');
    }

    async function startEdit(id) {
        editingId = id;
        const doc = id ? await store.getDoc(id) : null;
        showView('editor');

        $('#editTitle').value = doc?.title || '';
        fillCategorySelect(doc?.categoryId || categories[0]?.id);
        $('#editAuthor').value = doc?.author || '';
        $('#editContent').value = doc?.content || '';
        updatePreview();

        $('#breadcrumb').innerHTML = `<span class="inline-flex items-center gap-1.5"><i data-lucide="${id ? 'pencil' : 'file-plus'}" class="w-3.5 h-3.5"></i> ${id ? '문서 편집' : '새 문서 작성'}</span>`;
        $('#viewActions').innerHTML = '';
        icons();
        $('#editTitle').focus();
    }

    function updatePreview() {
        $('#editPreview').innerHTML = renderMarkdown($('#editContent').value);
    }

    async function saveDoc() {
        const title = $('#editTitle').value.trim();
        const categoryId = $('#editCategory').value;
        const author = $('#editAuthor').value.trim() || '미상';
        const content = $('#editContent').value;

        if (!title) { toast('제목을 입력하세요.', 'alert-circle'); $('#editTitle').focus(); return; }
        if (!categoryId) { toast('먼저 카테고리를 만들어 주세요.', 'alert-circle'); return; }

        let saved;
        if (editingId) saved = await store.updateDoc(editingId, { title, categoryId, author, content });
        else saved = await store.createDoc({ title, categoryId, author, content });

        await loadData();
        toast('저장되었습니다.');
        openDoc(saved.id);
    }

    async function deleteDoc(id) {
        const doc = await store.getDoc(id);
        if (!confirm(`"${doc?.title}" 문서를 삭제할까요?`)) return;
        await store.deleteDoc(id);
        await loadData();
        currentDocId = null;
        toast('삭제되었습니다.', 'trash-2');
        const first = docs[0];
        if (first) openDoc(first.id); else showEmpty();
    }

    /* --------------------- 카테고리 --------------------- */
    async function newCategory() {
        const name = prompt('새 카테고리 이름:');
        if (!name || !name.trim()) return;
        await store.createCategory({ name: name.trim() });
        await loadData();
        renderTree();
        toast('카테고리가 추가되었습니다.', 'folder-plus');
    }
    async function deleteCategory(id) {
        const cat = categories.find(c => c.id === id);
        const n = docs.filter(d => d.categoryId === id).length;
        if (!confirm(`"${cat?.name}" 카테고리${n ? ` 및 하위 문서 ${n}개` : ''}를 삭제할까요?`)) return;
        await store.deleteCategory(id);
        await loadData();
        if (!docs.find(d => d.id === currentDocId)) { currentDocId = null; showEmpty(); }
        renderTree();
        toast('삭제되었습니다.', 'trash-2');
    }

    /* --------------------- 백업 (내보내기/가져오기) --------------------- */
    async function exportJSON() {
        const data = await store.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `teamdocs-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast('JSON으로 내보냈습니다.', 'download');
    }
    function importJSON() { $('#importFile').click(); }
    async function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = JSON.parse(await file.text());
            if (!data.categories || !data.docs) throw new Error('형식 오류');
            if (!confirm('현재 데이터를 가져온 파일로 덮어쓸까요?')) return;
            await store.importAll(data);
            await loadData();
            currentDocId = null;
            renderTree();
            showEmpty();
            toast('가져오기 완료.', 'upload');
        } catch (err) {
            toast('가져오기 실패: ' + err.message, 'alert-circle');
        } finally { e.target.value = ''; }
    }

    /* --------------------- 뷰 전환 --------------------- */
    function showView(which) {
        $('#viewerRoot').classList.toggle('hidden', which !== 'viewer');
        $('#editorRoot').classList.toggle('hidden', which !== 'editor');
        $('#emptyState').classList.add('hidden');
        $('#emptyState').classList.toggle('flex', false);
    }
    function showEmpty() {
        $('#viewerRoot').classList.add('hidden');
        $('#editorRoot').classList.add('hidden');
        $('#emptyState').classList.remove('hidden');
        $('#emptyState').classList.add('flex');
        $('#breadcrumb').innerHTML = '';
        $('#viewActions').innerHTML = '';
    }

    /* --------------------- 테마 --------------------- */
    function initTheme() {
        const saved = localStorage.getItem('teamdocs.theme');
        const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', dark);
        updateThemeIcon(dark);
    }
    function toggleTheme() {
        const dark = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('teamdocs.theme', dark ? 'dark' : 'light');
        updateThemeIcon(dark);
    }
    function updateThemeIcon(dark) {
        $('#themeBtn').innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}" class="w-3.5 h-3.5"></i>`;
        icons();
    }

    /* --------------------- 유틸 --------------------- */
    function escapeHtml(s = '') { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function escapeAttr(s = '') { return String(s).replace(/[^a-z0-9-]/gi, ''); }
    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }

    /* --------------------- 이벤트 바인딩 --------------------- */
    function bindEvents() {
        $('#docTree').addEventListener('click', (e) => {
            const del = e.target.closest('[data-delcat]');
            if (del) { e.preventDefault(); deleteCategory(del.dataset.delcat); return; }
            const link = e.target.closest('[data-doc]');
            if (link) { e.preventDefault(); openDoc(link.dataset.doc); }
        });

        $('#searchInput').addEventListener('input', (e) => { searchTerm = e.target.value; renderTree(); });
        $('#newDocBtn').addEventListener('click', () => {
            if (!categories.length) { toast('먼저 카테고리를 만들어 주세요.', 'alert-circle'); return; }
            startEdit(null);
        });
        $('#newCatBtn').addEventListener('click', newCategory);
        $('#saveDoc').addEventListener('click', saveDoc);
        $('#cancelEdit').addEventListener('click', () => currentDocId ? openDoc(currentDocId) : showEmpty());
        $('#editContent').addEventListener('input', updatePreview);
        $('#exportBtn').addEventListener('click', exportJSON);
        $('#importBtn').addEventListener('click', importJSON);
        $('#importFile').addEventListener('change', handleImport);
        $('#themeBtn').addEventListener('click', toggleTheme);

        // 모바일 사이드바 토글
        $('#toggleSidebar').addEventListener('click', () => {
            $('#sidebar').classList.toggle('hidden');
        });

        // 단축키: Ctrl/Cmd+S 저장
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                if (!$('#editorRoot').classList.contains('hidden')) { e.preventDefault(); saveDoc(); }
            }
        });
    }

    /* --------------------- 시작 --------------------- */
    async function init() {
        initTheme();
        bindEvents();
        try {
            await loadData();
        } catch (err) {
            toast('데이터 로드 실패: ' + err.message, 'alert-circle');
            console.error(err);
        }
        renderTree();
        const first = docs[0];
        if (first) openDoc(first.id); else showEmpty();
        icons();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
