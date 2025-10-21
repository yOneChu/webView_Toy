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

    $("#dashboard").removeClass("menu-open");

    //엔터키 감지
    $(document).keyup(function(event) {
        if(event.which === 13) {
            searchPID();
            return false; // 추가 이벤트 방지위해 false 리턴
        }
    })


    //pidVal03 입력하면 pidVal04 활성화
    $('#pidVal03').on('input', function () {
        const value = $(this).val();
        if (value.trim() !== '') {
            $('#pidVal04').prop('readonly', false);
        } else {
            $('#pidVal04').prop('readonly', true);
            $('#pidVal04').val('');

            $('#pidVal05').prop('readonly', true);
            $('#pidVal05').val('');
        }
    });

    //pidVal04 입력하면 pidVal05 활성화
    $('#pidVal04').on('input', function () {
        const value = $(this).val();
        if (value.trim() !== '') {
            $('#pidVal05').prop('readonly', false);
        } else {
            $('#pidVal05').prop('readonly', true);
            $('#pidVal05').val('');
        }
    });



    // 다크모드: 저장된 테마 적용
    const savedTheme = localStorage.getItem('theme');
    const $themeLabel = $('label[for="darkModeToggle"]');

    const updateThemeLabel = function(isDark) {
        if (isDark) {
            $themeLabel.text('🌙 다크모드');
        } else {
            $themeLabel.text('☀️ 라이트모드');
        }
    };

    if (savedTheme === 'dark') {
        $('body').addClass('dark-mode');
        $('#darkModeToggle').prop('checked', true);
        updateThemeLabel(true);
    } else {
        $('#darkModeToggle').prop('checked', false);
        updateThemeLabel(false);
    }

    // 다크모드 토글 스위치 핸들러
    $('#darkModeToggle').on('change', function() {
        const willBeDark = $(this).is(':checked');
        if (willBeDark) {
            $('body').addClass('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            $('body').removeClass('dark-mode');
            localStorage.setItem('theme', 'light');
        }
        updateThemeLabel(willBeDark);
    });

}); // END JQUERY


function searchExcel() {
    let con01 = $("#con-01").val(); // SPEC
    let con02 = $("#con-02").val(); // LIKE
    let pidVal = $("#pidVal").val();


    let SPEC03 = $("#con-03").val(); // SPEC
    let CON04 = $("#con-04").val(); // LIKE
    let pidVal02 = $("#pidVal02").val(); // SPEC

    //PID-GROUP
    let CON05 = $("#con-05").val();
    let pidVal03 = $("#pidVal03").val();
    let pidVal04 = $("#pidVal04").val();
    let pidVal05 = $("#pidVal05").val();
    let joinOp = $("#joinOp").val();

    if(pidVal == null || "" == pidVal) {
        console.log(pidVal);
        alert("PID값을 입력하세요.");
        return;
    }


    if(con01 == 'REMARKS' && pidVal02 != '') {
        alert("조건1을 REMARKS로 검색 시, 조건2의 PID는 검색할 수 없습니다.");
        return;
    }

    showLoading(); // 로딩바 표시
    $.ajax({
        url: '/excel/searchPIDExcel',   // 요청 보낼 URL
        type: 'POST',              // 메서드 (GET/POST 등)
        data : {
            pid : pidVal,
            FIELD : con01,
            GUBUN : con02,
            SPEC02 : SPEC03,
            GUBUN02 : CON04,
            PID02 : pidVal02,
            CON05 : CON05,
            PID03 : pidVal03,
            PID04 : pidVal04,
            PID05 : pidVal05,
            joinOp: joinOp
        },
        xhrFields: {
            responseType: 'blob'    // 파일 다운로드용 응답 처리
        },
        success: function (data, status, xhr) {

            console.log(data);

            // 응답 헤더에서 파일명 추출
            const disposition = xhr.getResponseHeader('Content-Disposition');
            let filename = 'excel.xlsx';
            if (disposition && disposition.indexOf('filename=') !== -1) {
                filename = disposition.split('filename=')[1].replace(/"/g, '');
            }

            // Blob으로 파일 생성 및 다운로드
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            hideLoading(); // 성공 시 로딩바 제거
        },
        error: function () {
            alert('엑셀 다운로드 중 오류가 발생했습니다.');
        }
    });
}




//검색
function searchPID()
{
    let spec01 = $("#spec-01").val(); // SPEC, CON
    let link01 = $("#link-01").val(); // LIKE
    let pidVal01 = $("#pidVal").val(); // PID-01


    let spec02 = $("#spec-02").val(); // SPEC
    let like02 = $("#link-02").val(); // LIKE
    let pidVal02 = $("#pidVal02").val(); // PID-02


    let CON05 = $("#con-05").val(); //PID-GROUP
    let pidVal03 = $("#pidVal03").val();
    let pidVal04 = $("#pidVal04").val();
    let pidVal05 = $("#pidVal05").val();

    let joinOp = $("#joinOp").val();


    if(pidVal01 == null || "" == pidVal01) {
        console.log(pidVal01);
        alert("PID값을 입력하세요.");
        return;
    }


    if(spec01 == 'REMARKS' && pidVal02 != '') {
        alert("조건1을 REMARKS로 검색 시, 조건2의 PID는 검색할 수 없습니다.");
        return;
    }


    $('#infoTable').DataTable().destroy();
    $("#contentTable").empty();

    showLoading(); // 로딩바 표시

    $.ajax({
        type : "post",
        //url : "searchPID.jsp",
        crossDomain : true,
        url : "/pid/searchPIDSpecViewJson",
        data : {
            pid : pidVal01,
            FIELD : spec01,
            GUBUN : link01,
            SPEC02 : spec02,
            GUBUN02 : like02,
            PID02 : pidVal02,
            CON05 : CON05, //PID-GROUP
            PID03 : pidVal03,
            PID04 : pidVal04,
            PID05 : pidVal05,
            join: joinOp
        },
        /* beforeSend: function() {
             $("html").css("cursor", "wait");
         },
         complete: function() {
             $("html").css("cursor", "auto");
         },*/
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
                    str += "<tr>";

                    str += "<td>" + data[i].PID + "</td>";
                    str += "<td>" + data[i].NO + "</td>";
                    str += "<td>" + data[i].ADDR + "</td>";
                    str += "<td>" + data[i].REMARKS + "</td>";


                    str += "<td>" + data[i].SPEC1 + "</td>";  str += "<td>" + data[i].CON1 + "</td>";
                    str += "<td>" + data[i].SPEC2 + "</td>";  str += "<td>" + data[i].CON2 + "</td>";
                    str += "<td>" + data[i].SPEC3 + "</td>";  str += "<td>" + data[i].CON3 + "</td>";
                    str += "<td>" + data[i].SPEC4 + "</td>";  str += "<td>" + data[i].CON4 + "</td>";
                    str += "<td>" + data[i].SPEC5 + "</td>";  str += "<td>" + data[i].CON5 + "</td>";
                    str += "<td>" + data[i].SPEC6 + "</td>";  str += "<td>" + data[i].CON6 + "</td>";
                    str += "<td>" + data[i].SPEC7 + "</td>";  str += "<td>" + data[i].CON7 + "</td>";
                    str += "<td>" + data[i].SPEC8 + "</td>";  str += "<td>" + data[i].CON8 + "</td>";
                    str += "<td>" + data[i].SPEC9 + "</td>";  str += "<td>" + data[i].CON9 + "</td>";
                    str += "<td>" + data[i].SPEC10 + "</td>";  str += "<td>" + data[i].CON10 + "</td>";
                    str += "<td>" + data[i].SPEC11 + "</td>";  str += "<td>" + data[i].CON11 + "</td>";
                    str += "<td>" + data[i].SPEC12 + "</td>";  str += "<td>" + data[i].CON12 + "</td>";
                    str += "<td>" + data[i].SPEC13 + "</td>";  str += "<td>" + data[i].CON13 + "</td>";
                    str += "<td>" + data[i].SPEC14 + "</td>";  str += "<td>" + data[i].CON14 + "</td>";
                    str += "<td>" + data[i].SPEC15 + "</td>";  str += "<td>" + data[i].CON15 + "</td>";
                    str += "<td>" + data[i].SPEC16 + "</td>";  str += "<td>" + data[i].CON16 + "</td>";
                    str += "<td>" + data[i].SPEC17 + "</td>";  str += "<td>" + data[i].CON17 + "</td>";
                    str += "<td>" + data[i].SPEC18 + "</td>";  str += "<td>" + data[i].CON18 + "</td>";
                    str += "<td>" + data[i].SPEC19 + "</td>";  str += "<td>" + data[i].CON19 + "</td>";
                    str += "<td>" + data[i].SPEC20 + "</td>";  str += "<td>" + data[i].CON20 + "</td>";

                    str += "<td>" + data[i].KEY1 + "</td>";  str += "<td>" + data[i].VAL1 + "</td>";
                    str += "<td>" + data[i].KEY2 + "</td>";  str += "<td>" + data[i].VAL2 + "</td>";
                    str += "<td>" + data[i].KEY3 + "</td>";  str += "<td>" + data[i].VAL3 + "</td>";
                    str += "<td>" + data[i].KEY4 + "</td>";  str += "<td>" + data[i].VAL4 + "</td>";
                    str += "<td>" + data[i].KEY5 + "</td>";  str += "<td>" + data[i].VAL5 + "</td>";
                    str += "<td>" + data[i].KEY6 + "</td>";  str += "<td>" + data[i].VAL6 + "</td>";
                    str += "<td>" + data[i].KEY7 + "</td>";  str += "<td>" + data[i].VAL7 + "</td>";
                    str += "<td>" + data[i].KEY8 + "</td>";  str += "<td>" + data[i].VAL8 + "</td>";
                    str += "<td>" + data[i].KEY9 + "</td>";  str += "<td>" + data[i].VAL9 + "</td>";
                    str += "<td>" + data[i].KEY10 + "</td>";  str += "<td>" + data[i].VAL10 + "</td>";
                    str += "<td>" + data[i].KEY11 + "</td>";  str += "<td>" + data[i].VAL11 + "</td>";
                    str += "<td>" + data[i].KEY12 + "</td>";  str += "<td>" + data[i].VAL12 + "</td>";
                    str += "<td>" + data[i].KEY13 + "</td>";  str += "<td>" + data[i].VAL13 + "</td>";
                    str += "<td>" + data[i].KEY14 + "</td>";  str += "<td>" + data[i].VAL14 + "</td>";
                    str += "<td>" + data[i].KEY15 + "</td>";  str += "<td>" + data[i].VAL15 + "</td>";
                    str += "<td>" + data[i].KEY16 + "</td>";  str += "<td>" + data[i].VAL16 + "</td>";
                    str += "<td>" + data[i].KEY17 + "</td>";  str += "<td>" + data[i].VAL17 + "</td>";
                    str += "<td>" + data[i].KEY18 + "</td>";  str += "<td>" + data[i].VAL18 + "</td>";
                    str += "<td>" + data[i].KEY19 + "</td>";  str += "<td>" + data[i].VAL19 + "</td>";
                    str += "<td>" + data[i].KEY20 + "</td>";  str += "<td>" + data[i].VAL20 + "</td>";

                    //str += "<td>" + data[i].KEY1 + "</td>";
                    //str += "<td>" + data[i].VAL1 + "</td>";

                    str += "</tr>";
                } // end for


                $("#contentTable").append(str);



                hideLoading(); // 성공 시 로딩바 제거

                $("#infoTable").DataTable({
                    "responsive": true,
                    "lengthChange": true,
                    "pageLength": 50,     //페이지 당 글 개수 설정
                    "autoWidth": false, // 가로자동
                    "processing": true,
                    "scrollX" : true, //가로  스크롤
                    "destroy": true, // 테이블 재생성
                    //"scrollX": true, // 가로 스크롤
                    //"buttons": ["csv", "excel", "pdf", "print"]
                    //"buttons": ["csv", "excel"]
                    "dom": "Bfrtip",
                    "buttons": [
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
                hideLoading(); // 성공 시 로딩바 제거
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