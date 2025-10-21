let dtTable = $("#infoTable").DataTable({
    "responsive": true,
    "lengthChange": true,
    "pageLength": 50,     //페이지 당 글 개수 설정
    "autoWidth": false, // 가로자동
    "processing": true,
    "destroy": true, // 테이블 재생성
    //"scrollX": true, // 가로 스크롤
    //"buttons": ["csv", "excel", "pdf", "print"]
    "buttons": ["csv", "excel", "copy"]
}).buttons().container().appendTo('#infoTable_wrapper .col-md-6:eq(0)');


//ready
$(document).ready(function() {

    //엔터키 감지
    $(document).keyup(function(event) {
        if(event.which === 13) {
            searchPID();
            return false; // 추가 이벤트 방지위해 false 리턴
        }
    });


}); // END JQUERY



//검색
function searchPID()
{
    let hogi1 = $("#hogi-01").val(); //
    let hogi2 = $("#hogi-02").val(); //


    if(hogi1 == null || "" == hogi1) {
        alert("hogi1 값을 입력하세요.");
        return;
    }

    if(hogi2 == null || "" == hogi2) {
        alert("hogi2 값을 입력하세요.");
        return;
    }

    $('#infoTable').DataTable().destroy();
    $("#contentTable").empty();

    showLoading(); // 로딩바 표시

    $.ajax({
        type : "post",
        //url : "searchPID.jsp",
        crossDomain : true,
        url : "/subae/elevatorSpecDiff",
        data : {
            ho1 : hogi1,
            ho2 : hogi2,
        },
        success : function(data)
        {
            console.log("data - ", data);

            if(data[0] != null && data[0].msg != null) {
                let msg = data[0].msg;

                console.log(msg);
                if(msg != null || "" != msg) {
                    alert(msg);
                    return;
                }
            }


            let str = "";

            if(data != null && data.length > 0) {

                for(let i=0; i < data.length; i++) {
                    let SPEC_VALUE = data[i].SPEC_VALUE;
                    let SPEC_CODE = data[i].SPEC_CODE;
                    let VALUE = data[i].VALUE;
                    let TYPE = data[i].TYPE;
                    let VALUE2 = data[i].VALUE2;

                    str +=
                        `
                            <tr class="diffData">
                                <td>${TYPE} </td>
                                <td>${SPEC_VALUE} </td>
                                <td>${SPEC_CODE} </td>
                                <td class="word-wrap">${VALUE} </td>
                                <td class="word-wrap">${VALUE2} </td>
                            </tr>
                        `;

                } // end for


                $("#contentTable").append(str);

                                // 차이 하이라이트
                                rowDiffColor();

                                hideLoading(); // 성공 시 로딩바 제거

                    $("#infoTable").DataTable({

                        responsive: false, // 폭을 ‘진짜’ 고정하고 싶으면 off 권장
                        autoWidth: false,   // 자동 폭 계산 끔
                        lengthChange: false,// "n개 보기" 드롭다운 숨김
                        scrollX: true,      // 가로 스크롤 유지
                        destroy: true,      // 재생성 허용
                        // ▼ 페이징/관련 UI 끄기
                        paging: false,      // 페이징 OFF
                        info: false,        // 하단 "총 n개" 정보 숨김 (원하면 true로)

                        // 필요한 기능은 그대로 유지
                        searching: true,
                        ordering: true,
                        // 페이지네이션 요소(p) 제거한 dom (버튼 B, 필터 f, 처리표시 r, 테이블 t)
                        dom: "Bfrt",
                        // 행이 많을 때 렌더링 최적화(옵션)
                        deferRender: true,
                        columnDefs: [
                            { targets: 3, width: "220px", className: "dt-nowrap" }, // 3열(호기 1)
                            { targets: 4, width: "220px", className: "dt-nowrap" }  // 4열(호기 2)
                        ],
                        buttons: [
                        {
                            extend: "csv",
                            charset: "UTF-16LE",
                            text: "CSV",
                            filename: 'csv_Result'
                        },
                        {
                            extend: "excel",
                            charset: "UTF-8",
                            text: "EXCEL",
                            filename: 'excel_Result',
                        },
                        {
                            extend: "copy"
                        }
                    ]
                }).buttons().container().appendTo('#infoTable_wrapper .col-md-6:eq(1)');

            } else {
                alert("검색결과가 없습니다.");

            }
        } // end success;
    });
}

function isStringAndNotEmptyOrWhitespace(value) {
    // 1. 문자열인지 확인
    if (typeof value === 'string') {
        // 2. 공백만 있는지 확인 (trim()으로 공백 제거 후 빈 문자열인지 체크)
        if (value.trim() === '') {
            return false; // 공백 문자열
        }
        return true; // 유효한 문자열
    }
    return false; // 문자열이 아님
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
                <p style="margin: 0; font-size: 16px; color: #333;">데이터 분석 중...</p>
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


function rowDiffColor() {
    try {
        const tbody = document.getElementById('contentTable');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        rows.forEach(tr => {
            const tds = tr.querySelectorAll('td');
            // Need at least 5 columns based on table structure: TYPE, SPEC_VALUE, SPEC_CODE, VALUE, VALUE2
            if (tds.length >= 5) {
                // Compare 4th and 5th columns (index 3 and 4) per requirement (3rd,4th of VALUE columns in Korean description)
                const v1 = (tds[3].textContent || '').trim();
                const v2 = (tds[4].textContent || '').trim();

                // Normalize common whitespace and case; treat empty and '-' the same
                const norm = (s) => s.replace(/\s+/g, ' ').toLowerCase();
                const isEmptyLike = (s) => s === '' || s === '-' || s === 'null' || s === 'undefined';

                const same = (isEmptyLike(v1) && isEmptyLike(v2)) || (norm(v1) === norm(v2));

                if (!same) {
                    //tr.style.backgroundColor = '#ffe6f2'; // light pink
                    tr.style.backgroundColor = 'pink'; // light pink
                } else {
                    tr.style.backgroundColor = '';
                }
            }
        });
    } catch (e) {
        console.error('rowDiffColor error:', e);
    }
}