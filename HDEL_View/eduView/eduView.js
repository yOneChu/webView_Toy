/*  $(document).ready(function() {
          // 사용 예시: filename을 "28000317"로 변경 후 새로고침
          changeFilename("28000317");

          alert('kk');

      });*/

// ===== Left/Right resizable splitter =====
(function() {
    const sidebar = document.querySelector('.sidebar');
    const resizer = document.getElementById('resizer');
    let isDown = false;
    resizer.addEventListener('mousedown', (e) => { isDown = true; document.body.style.cursor = 'col-resize'; });
    window.addEventListener('mouseup', () => { isDown = false; document.body.style.cursor = ''; });
    window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const min = 220, max = 600;
        const w = Math.min(max, Math.max(min, e.clientX));
        sidebar.style.width = w + 'px';
    });

    //alert('22');
    //changeFilename("28000317");
})();

// ===== Tree expand/collapse & search =====
const expandAll = () => document.querySelectorAll('details.tree').forEach(d => d.open = true);
const collapseAll = () => document.querySelectorAll('details.tree').forEach(d => d.open = false);
//document.getElementById('btnExpand').addEventListener('click', expandAll);
//document.getElementById('btnCollapse').addEventListener('click', collapseAll);

const scopeSelect = document.getElementById('treeScope');
const searchInput = document.getElementById('treeSearch');

function buildScopeOptions() {
    // 대표 카테고리 = 재구성된 트리의 1차 그룹(summary 텍스트)
    const tree = document.querySelector('details.tree');
    if (!tree) return;
    const container = tree.querySelector(':scope > ul > li > ul');
    if (!container) return;
    // reorganizeListByPurpose() 이후 구조: container > li > details.tree > summary(그룹명)
    const summaries = Array.from(container.querySelectorAll(':scope > li > details.tree > summary'));
    if (!summaries.length) return;
    const names = summaries.map(s => (s.textContent || '').trim()).sort((a,b)=>a.localeCompare(b));
    scopeSelect.innerHTML = '<option value="__ALL__">전체</option>' +
        names.map(n => `<option value="${n}">${n}</option>`).join('');
}

function applyFilter() {
    const q = searchInput.value.trim().toLowerCase();
    const scope = scopeSelect.value;
    // 기본 모두 보이기
    document.querySelectorAll('details.tree').forEach(d => d.style.display = '');
    document.querySelectorAll('.tree li').forEach(li => li.style.display = '');

    if (!q && scope === '__ALL__') return;

    // 펼치기
    document.querySelectorAll('details.tree').forEach(d => d.open = true);

    // 스코프 필터: 대표 카테고리 summary 텍스트가 scope와 일치하는 그룹만
    if (scope !== '__ALL__') {
        // 상위 그룹(details.tree)의 summary 텍스트와 비교
        document.querySelectorAll('details.tree').forEach(d => {
            const summaryText = (d.querySelector(':scope > summary')?.textContent || '').trim();
            // 최상단 Elevator 그룹은 항상 보이게 유지
            const isRoot = d.closest('details.tree') === d && summaryText.includes('Elevator');
            if (isRoot) return;
            // 대표 카테고리 그룹만 남기고 나머지는 숨김
            if (!summaryText.includes(scope)) {
                // 그룹 통째로 숨기기
                d.parentElement && (d.parentElement.style.display = 'none');
            } else {
                d.parentElement && (d.parentElement.style.display = '');
            }
        });
    }

    // 텍스트 검색: 현재 보이는 항목들만 대상으로 수행
    if (q) {
        document.querySelectorAll('.tree li').forEach(li => {
            // li가 숨겨진 그룹에 속하면 skip
            if (li.closest('li') && li.closest('li').style.display === 'none') return;
            const text = li.textContent.toLowerCase();
            li.style.display = text.includes(q) ? '' : 'none';
        });
    }
}

searchInput.addEventListener('input', applyFilter);
scopeSelect.addEventListener('change', applyFilter);


// ===== Group and sort LI items (lines 246~14365) by purpose =====
function extractPurpose(li) {
    try {
        const clone = li.cloneNode(true);
        clone.querySelectorAll('.badge-muted').forEach(el => el.remove());
        const t = (clone.textContent || '').trim();
        const idx = t.indexOf('::');
        if (idx >= 0) {
            return t.substring(idx + 2).trim();
        }
    } catch (e) { /* ignore */ }
    return '기타';
}
function compareByDataValue(a, b) {
    const av = a.getAttribute('data-value') || '';
    const bv = b.getAttribute('data-value') || '';
    const an = Number(av);
    const bn = Number(bv);
    const aIsNum = !isNaN(an);
    const bIsNum = !isNaN(bn);
    if (aIsNum && bIsNum) return an - bn;
    if (aIsNum && !bIsNum) return -1;
    if (!aIsNum && bIsNum) return 1;
    return av.localeCompare(bv);
}
function reorganizeListByPurpose() {
    const tree = document.querySelector('details.tree');
    if (!tree) return;
    const container = tree.querySelector(':scope > ul > li > ul');
    if (!container) return;
    const items = Array.from(container.querySelectorAll(':scope > li[data-value]'));
    if (!items.length) return;

    const groups = new Map();
    for (const li of items) {
        const purpose = extractPurpose(li);
        if (!groups.has(purpose)) groups.set(purpose, []);
        groups.get(purpose).push(li);
    }
    const purposeNames = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));
    const frag = document.createDocumentFragment();
    for (const name of purposeNames) {
        const groupLis = groups.get(name).sort(compareByDataValue);
        const outerLi = document.createElement('li');
        const det = document.createElement('details');
        det.className = 'tree';
        det.open = true;
        const sum = document.createElement('summary');
        const tw = document.createElement('span');
        tw.className = 'twisty';
        sum.appendChild(tw);
        sum.appendChild(document.createTextNode(name));
        det.appendChild(sum);
        const ul = document.createElement('ul');
        for (const li of groupLis) ul.appendChild(li);
        det.appendChild(ul);
        outerLi.appendChild(det);
        frag.appendChild(outerLi);
    }
    container.innerHTML = '';
    container.appendChild(frag);
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('li[data-value]').forEach(function (li) {
        li.addEventListener('click', function () {
            const filename = this.getAttribute('data-value');
            console.log('filename ---- ', filename);
            //alert(filename);
            // 화면 자체를 새로고침하면서 filename 파라미터 포함
            //window.location.href = `/vault/eduView?filename=${filename}`;
            //window.location.href = "http://localhost:8070/vault/eduView?filename=" + filename;
            //window.location.href = "http://10.225.80.35/vaultview/viewdesign.html?filename=" + filename;

            changeFilename(filename);

        });
    });
    // 분류 및 정렬 실행
    reorganizeListByPurpose();
    // 대표 카테고리 옵션 구성
    buildScopeOptions();
});

function changeFilename(newFilename) {
    const iframe = document.getElementById('viewerFrame');
    iframe.src = "http://10.225.80.35/vaultview/viewdesign.html?filename=" + encodeURIComponent(newFilename);
    //iframe.src = "http://10.225.80.35/vaultview/eduView-mod.html?filename=" + encodeURIComponent(newFilename);
}