

let pidVal;
let sampleData;

$(document).ready(async function() {


    //let rr = searchPID("EL_PD162A06");

    console.log("1111111");
    //initHandsontable(rr);AUTO_EL_ZERR_M3

}); // END JQUERY


function hideEmptyColumns() {
    if (!hot) return;

    const data = hot.getData();
    const colCount = hot.countCols();
    const hiddenCols = [];

    for (let col = 0; col < colCount; col++) {
        let hasValue = false;
        for (let row = 0; row < data.length; row++) {
            const cellValue = data[row][col];
            if (cellValue !== null && cellValue !== undefined && cellValue.toString().trim() !== '') {
                hasValue = true;
                break;
            }
        }
        if (!hasValue) {
            hiddenCols.push(col);
        }
    }

    // hiddenColumns 플러그인 사용해서 숨기기
    hot.updateSettings({
        hiddenColumns: {
            columns: hiddenCols,
            indicators: true // 숨겨진 위치에 표시 여부
        }
    });

    console.log("숨긴 열 인덱스:", hiddenCols);
}



function searchPID()
{

    let pid = document.getElementById('searchInput').value.trim();
    console.log("---searchPID---");


    showLoading(); // 로딩바 표시
    $.ajax({
        type : "post",
        crossDomain : true,
        url : "/subae/findPIDLineView",
        //sync: false,
        data : {
            pid : pid.toUpperCase()
        },
        beforeSend: function() {
            $("html").css("cursor", "wait");
        },
        complete: function() {
            $("html").css("cursor", "auto");
        },
        success : function(rr)
        {
            if(rr != null && rr.length > 0) {
                //console.log("rrrrr========== ", rr);
                sampleData = rr;

                //값 셋팅
                initHandsontable(rr);

                //공백 인 열 제외
                hideEmptyColumns();


                hideLoading(); // 성공 시 로딩바 제거
                //return rr;
            } else {
                hideLoading(); // 성공 시 로딩바 제거
                alert("검색결과가 없습니다.");

            }
        }, // end success;
        error: function () {
            hideLoading(); // 성공 시 로딩바 제거
            alert('오류 발생하였습니다. 김영환M 문의하세요.😅');
        }
    });


} // END SearchPID


// Handsontable 인스턴스
let hot;

// 샘플 데이터 (json)
/*const sampleData = [
    ['제품명', '가격', '수량', '총액', '카테고리', '판매일', '상태', '비고', '9', '10', '11', '12', '13', '14', '15', '16', '17','18', '19', '20', '21','22','23','24','25','26','27','28','','30'],
    ['노트북', 1200000, 2, '=B2*C2', '전자제품', '2024-01-15', '판매완료', '우수고객','9','10', '11', '12', '13', '14', '15', '16', '17','18', '19', '20', '21','22','23','24','25','26','27','28','','30'],
    ['마우스', 50000, 5, '=B3*C3', '전자제품', '2024-01-16', '재고있음', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17','18', '19', '20', '21','22','23','24','25','26','27','28','','30'],
    ['키보드', 150000, 3, '=B4*C4', '전자제품', '2024-01-17', '판매완료', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17','18', '19', '20', '21','22','23','24','25','26','27','28','','30'],
    ['모니터', 300000, 1, '=B5*C5', '전자제품', '2024-01-18', '재고있음', '27인치', '9', '10', '11', '12', '13', '14', '15', '16', '17','18', '19', '20', '21','22','23','24','25','26','27','28','','30'],
    ['헤드셋', 80000, 4, '=B6*C6', '전자제품', '2024-01-19', '판매완료', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17','18', '19', '20', '21','22','23','24','25','26','27','28','','30'],
    ['웹캠', 120000, 2, '=B7*C7', '전자제품', '2024-01-20', '재고있음', '1080p', '9', '10', '11', '12', '13', '14', '15', '16', '17','18', '19', '20', '21','22','23','24','25','26','27','28','','30'],
];*/




// Handsontable 초기화
function initHandsontable(rr) {
    const container = document.getElementById('handsontable-container');
    console.log("-------- initHandsontable --------");
    console.log(container);
    console.log(rr);

    sampleData = rr;
    hot = new Handsontable(container, {
        data: sampleData,
        rowHeaders: true,
        colHeaders: [
            //'PID', 'NO',
            'ADDR', 'SPEC1', 'CON1', 'SPEC2', 'CON2', 'SPEC3', 'CON3', 'SPEC4', 'CON4', 'SPEC5', 'CON5',
            'SPEC6', 'CON6', 'SPEC7', 'CON7', 'SPEC8', 'CON8', 'SPEC9', 'CON9', 'SPEC10', 'CON10', 'SPEC11', 'CON11',
            'SPEC12', 'CON12', 'SPEC13', 'CON13', 'SPEC14', 'CON14', 'SPEC15', 'CON15', 'SPEC16', 'CON16', 'SPEC17', 'CON17' ,'SPEC18', 'CON18', 'SPEC19', 'CON19', 'SPEC20', 'CON20',
            'KEY1', 'VAL1', 'KEY2', 'VAL2', 'KEY3', 'VAL3', 'KEY4', 'VAL4', 'KEY5', 'VAL5',
            'KEY6', 'VAL6', 'KEY7', 'VAL7', 'KEY8', 'VAL8', 'KEY9', 'VAL9', 'KEY10', 'VAL10', 'KEY11', 'VAL11',
            'KEY12', 'VAL12', 'KEY13', 'VAL13', 'KEY14', 'VAL14', 'KEY15', 'VAL15', 'KEY16', 'VAL16', 'KEY17', 'VAL17' ,'KEY18', 'VAL18', 'KEY19', 'VAL19', 'KEY20', 'VAL20',
            'GOTO', 'REMARKS'
        ],
        width: '100%',
        height: 500,
        licenseKey: 'non-commercial-and-evaluation',

        // 기본 설정
        stretchH: 'all',
        manualRowResize: true,
        manualColumnResize: true,
        manualRowMove: true,
        manualColumnMove: true,
        hiddenColumns: {       // 🔹 플러그인 활성화
            columns: [],
            indicators: true
        },

        // 컨텍스트 메뉴
        contextMenu: {
            items: {
                'row_above': {
                    name: '위에 행 삽입'
                },
                'row_below': {
                    name: '아래에 행 삽입'
                },
                'col_left': {
                    name: '왼쪽에 열 삽입'
                },
                'col_right': {
                    name: '오른쪽에 열 삽입'
                },
                'separator1': Handsontable.plugins.ContextMenu.SEPARATOR,
                'remove_row': {
                    name: '행 삭제'
                },
                'remove_col': {
                    name: '열 삭제'
                },
                'separator2': Handsontable.plugins.ContextMenu.SEPARATOR,
                'copy': {
                    name: '복사'
                },
                'cut': {
                    name: '잘라내기'
                },
                'paste': {
                    name: '붙여넣기'
                }
            }
        },

        // 드롭다운 메뉴
        dropdownMenu: true,

        // 필터
        filters: true,

        // 수식 지원 (Still keep this if you want formula capabilities in the table itself)
        formulas: {
            engine: HyperFormula
        },

        // 열 타입 설정
        columns: [
            //{ type: 'text' },  // PID
            //{ type: 'text' },  // NO
            { type: 'text' },  // ADDR

            { type: 'text' },  // SPEC1
            { type: 'text' },  // CON1
            { type: 'text' },  //
            { type: 'text' },  // 2
            { type: 'text' },  //
            { type: 'text' }, //3
            { type: 'text' },
            { type: 'text' }, //4
            { type: 'text' },
            { type: 'text' }, //5
            { type: 'text' },
            { type: 'text' }, //6
            { type: 'text' },
            { type: 'text' }, //7
            { type: 'text' },
            { type: 'text' }, //8
            { type: 'text' },
            { type: 'text' }, //9
            { type: 'text' },
            { type: 'text' }, //10

            { type: 'text' },  // SPEC1
            { type: 'text' },  // CON1
            { type: 'text' },  //
            { type: 'text' },  // 2
            { type: 'text' },  //
            { type: 'text' }, //3
            { type: 'text' },
            { type: 'text' }, //4
            { type: 'text' },
            { type: 'text' }, //5
            { type: 'text' },
            { type: 'text' }, //6
            { type: 'text' },
            { type: 'text' }, //7
            { type: 'text' },
            { type: 'text' }, //8
            { type: 'text' },
            { type: 'text' }, //9
            { type: 'text' },
            { type: 'text' }, //10

            { type: 'text' },  // KEY1
            { type: 'text' },  // VAL1
            { type: 'text' },  //
            { type: 'text' },  // 2
            { type: 'text' },  //
            { type: 'text' }, //3
            { type: 'text' },
            { type: 'text' }, //4
            { type: 'text' },
            { type: 'text' }, //5
            { type: 'text' },
            { type: 'text' }, //6
            { type: 'text' },
            { type: 'text' }, //7
            { type: 'text' },
            { type: 'text' }, //8
            { type: 'text' },
            { type: 'text' }, //9
            { type: 'text' },
            { type: 'text' }, //10
            { type: 'text' },  // SPEC1
            { type: 'text' },  // CON1
            { type: 'text' },  //
            { type: 'text' },  // 2
            { type: 'text' },  //
            { type: 'text' }, //3
            { type: 'text' },
            { type: 'text' }, //4
            { type: 'text' },
            { type: 'text' }, //5
            { type: 'text' },
            { type: 'text' }, //6
            { type: 'text' },
            { type: 'text' }, //7
            { type: 'text' },
            { type: 'text' }, //8
            { type: 'text' },
            { type: 'text' }, //9
            { type: 'text' },
            { type: 'text' },

            { type: 'text' }, // GOT
            { type: 'text' } // REMARKS
        ],

        // 이벤트 핸들러
        afterSelectionEnd: function(row, col, row2, col2) {
            updateCellReference(row, col);
            // Removed updateFormulaBar as it's no longer a formula bar
        },

        afterChange: function(changes, source) {
            if (changes) {
                updateStatusBar();
                document.getElementById('statusText').textContent = '수정됨';
            }
        },

        beforeKeyDown: function(event) {
            // F2 키로 편집 모드 진입
            if (event.keyCode === 113) { // F2
                hot.getActiveEditor().beginEditing();
                event.preventDefault();
            }
        }
    });

    updateStatusBar();


    ///
    const headers = hot.getColHeader(); // 전체 헤더 배열
    const key1Index = headers.findIndex(h => String(h).toUpperCase() === 'KEY1');



    // 데이터 셀 색상
    hot.updateSettings({
        cells: function (row, col) {
            const props = {};
            // 현재 col의 헤더명이 KEY1인지 확인
           /* if (hot.getColHeader(col) === 'KEY1') {
                props.className = (props.className ? props.className + ' ' : '') + 'pink-col';
            }*/

            if (['KEY1', 'KEY2', 'KEY3', 'KEY4', 'KEY5', 'KEY6', 'KEY7', 'KEY8', 'KEY9', 'KEY10'].includes(hot.getColHeader(col))) {
                //props.classList.add('pink-col-header');
                props.className = (props.className ? props.className + ' ' : '') + 'pink-col';
                //col.classList.add('pink-col');
            }

            if (['SPEC1', 'SPEC2', 'SPEC3', 'SPEC4', 'SPEC5', 'SPEC6', 'SPEC7', 'SPEC8', 'SPEC9', 'SPEC10', 'SPEC11', 'SPEC12', 'SPEC13'].includes(hot.getColHeader(col))) {
                //TH.classList.add('gery-col-header');
                col.className = (props.className ? props.className + ' ' : '') + 'gery-col';
                //col.classList.add('gery-col');
            }

            return props;
        }
    });



    // 헤더 색상
    hot.addHook('afterGetColHeader', function (col, TH) {
        //if (hot.getColHeader(col) === 'KEY1') {
        if (['KEY1', 'KEY2', 'KEY3', 'KEY4', 'KEY5', 'KEY6', 'KEY7', 'KEY8', 'KEY9', 'KEY10'].includes(hot.getColHeader(col))) {
            TH.classList.add('pink-col-header');
        }

        if (['SPEC1', 'SPEC2', 'SPEC3', 'SPEC4', 'SPEC5', 'SPEC6', 'SPEC7', 'SPEC8', 'SPEC9', 'SPEC10', 'SPEC11', 'SPEC12', 'SPEC13'].includes(hot.getColHeader(col))) {
            TH.classList.add('gery-col-header');
        }

    });

// 수동/자동 숨김, 컬럼 이동 후에도 유지되도록 렌더링
    hot.render();
}

// 셀 참조 업데이트
function updateCellReference(row, col) {
    const colLetter = ""; //String.fromCharCode(65 + col);
    const cellRef = colLetter + (row + 1);
    document.getElementById('cellReference').value = cellRef;
    document.getElementById('selectedCell').textContent = cellRef;
}

// --- NEW: Function to perform search ---
/*function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        alert(`"${searchTerm}" (으)로 데이터베이스 검색을 수행합니다.\n\n실제 구현 시 이 검색어를 사용하여 데이터를 필터링하거나 서버에서 조회합니다.`);

    } else {
        alert('검색 조건을 입력해주세요.');
    }
}*/
// --- END NEW ---

// Status bar update remains the same
function updateStatusBar() {
    const data = hot.getData();
    document.getElementById('rowCount').textContent = data.length;
    document.getElementById('colCount').textContent = hot.countCols();
}

// --- MODIFIED: Search input handling ---
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        //performSearch();
        searchPID();
    }
});
// --- END MODIFIED ---

// Toolbar functions remain the same
function addRow() {
    const selected = hot.getSelected();
    const row = selected ? selected[0][0] : hot.countRows();
    hot.alter('insert_row', row + 1);
    updateStatusBar();
}

function addColumn() {
    const selected = hot.getSelected();
    const col = selected ? selected[0][1] : hot.countCols();
    hot.alter('insert_col', col + 1);
    updateStatusBar();
}

function deleteRowColumn() {
    const selected = hot.getSelected();
    if (selected) {
        const [row, col, row2, col2] = selected[0];
        if (confirm('선택된 영역을 삭제하시겠습니까?')) {
            // If a single row is selected, delete the row
            if (row === row2 && col === 0 && col2 === hot.countCols() -1) { // Check if entire row is selected (from column 0 to last column)
                hot.alter('remove_row', row);
            } else if (col === col2 && row === 0 && row2 === hot.countRows() - 1) { // Check if entire column is selected (from row 0 to last row)
                hot.alter('remove_col', col);
            } else if (row === row2) { // Just a single row selection somewhere within the table
                hot.alter('remove_row', row);
            } else if (col === col2) { // Just a single column selection somewhere within the table
                hot.alter('remove_col', col);
            } else {
                alert('선택된 영역이 단일 행 또는 열이 아니므로 삭제할 수 없습니다. 단일 행 또는 열을 선택해주세요.');
            }
            updateStatusBar();
        }
    } else {
        alert('삭제할 행 또는 열을 선택해주세요.');
    }
}

function exportToCSV() {
    console.log("exportToCSV");
    const exportPlugin = hot.getPlugin('exportFile');
    exportPlugin.downloadFile('csv', {
        bom: false,
        columnDelimiter: ',',
        columnHeaders: true,
        exportHiddenColumns: true,
        exportHiddenRows: true,
        fileExtension: 'csv',
        filename: 'ExcelAssistant_[YYYY]-[MM]-[DD]',
        mimeType: 'text/csv',
        rowDelimiter: '\r\n',
        rowHeaders: true
    });

}


//마인드맵
function insertChart() {
    //alert('차트 기능은 AI 어시스턴트와 연동하여 구현됩니다.');

    //logicViewMaptify.jsp
    //EL_PB126A01

    let pid = document.getElementById('searchInput').value.trim();
    //팝업
    let url = '/subae/logicViewMaptify?'; // Relative path is usually best
    url += "pid=" + pid;

    //const features = 'width=800,height=600,top=100,left=100,resizable=yes,scrollbars=yes';

    window.open(url,'secondPopup','width=700, height=700, top=50, left=50');

}

// Tooltip initialization remains the same
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Page load initialization remains the same
//페이지 로딩 시 바로시작
document.addEventListener('DOMContentLoaded', function() {
    //initHandsontable();
});

// AI Assistant functions remain the same
document.querySelectorAll('.suggestion-item').forEach(button => {
    button.addEventListener('click', function() {
        const feature = this.textContent.trim();

        switch(feature) {
            case '차트 생성':
                insertChart();
                break;
            case '합계 계산':
                const selected = hot.getSelected();
                if (selected) {
                    const [row, col, row2, col2] = selected[0];
                    // Get the current value in the sum cell, if any, to avoid overwriting formulas already there
                    const currentSumCellContent = hot.getDataAtCell(row2 + 1, col);
                    if (!currentSumCellContent || !currentSumCellContent.startsWith('=')) { // Only add if cell is empty or doesn't start with a formula
                        const range = ""; //
                        const sumFormula = `=SUM(${range})`;
                        hot.setDataAtCell(row2 + 1, col, sumFormula);
                        hot.selectCell(row2 + 1, col); // Select the cell where the sum is placed
                    } else {
                        alert('선택된 범위 바로 아래 셀에 이미 수식이 있거나 데이터가 있습니다.');
                    }
                } else {
                    alert('합계를 계산할 셀 범위를 선택해주세요.');
                }
                break;
            case '데이터 필터':
                const filtersPlugin = hot.getPlugin('filters');
                filtersPlugin.enablePlugin();
                alert('필터 기능이 활성화되었습니다. 열 헤더의 드롭다운 메뉴를 확인하세요.');
                break;
            case '정렬하기':
                const columnSortingPlugin = hot.getPlugin('columnSorting');
                columnSortingPlugin.enablePlugin();
                alert('정렬 기능이 활성화되었습니다. 열 헤더를 클릭하여 정렬하세요.');
                break;
            case '자동 완성':
                alert('자동 완성 기능이 실행됩니다. (실제 구현 시 해당 기능 로직 추가)');
                break;
            default:
                alert(`${feature} 기능이 실행됩니다. (실제 구현 시 해당 기능 로직 추가)`);
        }
    });
});

// AI question submission remains the same
/*
document.querySelector('.btn-light').addEventListener('click', function() {
    const textarea = document.querySelector('textarea');
    const question = textarea.value.trim();

    if (question) {
        // 여기에 실제 AI API 호출 로직 구현
        alert(`AI에게 질문: "${question}"\n\n실제 구현 시 서버로 전송하여 AI 응답을 받아옵니다.`);
        textarea.value = '';
    } else {
        alert('질문 내용을 입력해주세요.');
    }
});
*/

//테스트해야됨
function emptyCellDelete() {
    if (!hot) return;

    const data = hot.getData();
    const colCount = hot.countCols();
    const hiddenCols = [];

    for (let col = 0; col < colCount; col++) {
        let hasValue = false;

        for (let row = 0; row < data.length; row++) {
            const cellValue = data[row][col];
            if (cellValue !== null && cellValue !== undefined && cellValue.toString().trim() !== '') {
                hasValue = true;
                break;
            }
        }

        if (!hasValue) hiddenCols.push(col);
    }

    const hiddenPlugin = hot.getPlugin('hiddenColumns');
    hiddenPlugin.hideColumns(hiddenCols);
    hot.render();

    console.log("숨긴 열 인덱스:", hiddenCols);
}


// 로딩바 표시 함수
function showLoading() {
    // 로딩바 HTML 생성
    const loadingHtml = `
        <div id="loadingOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">
                <div style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                "></div>
                <p style="margin: 0; font-size: 16px; color: #333;">로직 분석 중입니다...</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    // 로딩바를 body에 추가
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
}

// 로딩바 제거 함수
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}