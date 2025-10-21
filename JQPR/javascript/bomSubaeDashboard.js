    let dtTable = $("#infoTable").DataTable({
        "responsive": true,
        "lengthChange": true,
        "pageLength": 25,     //페이지 당 글 개수 설정
        "autoWidth": false, // 가로자동
        "processing": true,
        "destroy": true, // 테이블 재생성
        //"scrollX": true, // 가로 스크롤
        //"buttons": ["csv", "excel", "pdf", "print"]
        "buttons": ["excel", "copy"]
    }).buttons().container().appendTo('#infoTable_wrapper .col-md-6:eq(0)');

    // 초기화
    $(document).ready(function() {
        $("#subae").removeClass("menu-open");
        $("#sap").removeClass("menu-open");
        $("#mlb").removeClass("menu-open");
        $("#vault").removeClass("menu-open");

        searchPID();
        //renderTable();
        //updateSummaryCards();

        viewDashboard();

        // 제품만 EXCEL
        $('#excelGo').on('click', function () {

            let month = $('#monthSelect').val();

            showLoading(); // 로딩바 표시
            $.ajax({
                url: '/excel/subaeDownload',   // 요청 보낼 URL
                type: 'POST',              // 메서드 (GET/POST 등)
                data : {
                    month : month,
                    ucheck: ''
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
        });


        /**
         * 자재전체 엑셀 다운로드
         */
        $('#excel_all').on('click', function () {

            let month = $('#monthSelect').val();
            //let ucheck = "1";

            excelPrint('');
        });

        /**
         * 변경자재 엑셀 다운로드
         */
        $('#excel_mod').on('click', function () {

            let month = $('#monthSelect').val();
            let ucheck = "1";

            excelPrint(ucheck);
        });


        $('#monthSelect').on('change', function () {
            const selectedValue = $(this).val(); // 선택된 값 (예: '2025-03' 또는 'all')

            // 원하는 동작 수행
            console.log("선택된 월:", selectedValue);
            searchPID();
        });

    }); // END JQUERY


    function excelPrint(ucheck) {
        //console.log(month);
        let month = $('#monthSelect').val();

        showLoading(); // 로딩바 표시

        $.ajax({
            url: '/excel/subaeDownloadV2',   // 요청 보낼 URL
            type: 'POST',              // 메서드 (GET/POST 등)
            data : {
                month : month,
                ucheck: ucheck
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


    //null, undefined, NaN, 빈 문자열, 혹은 falsy한 값 일 때 0으로 초기화
    function initIfEmpty(value) {
        return value ?? 0; // null 또는 undefined일 때만 0
    }

    //검색
    function searchPID(year, month)
    {
        let partNo = $("#partNo").val(); // LIKE
        month = $('#monthSelect').val();
        console.log(month);

        $('#infoTable').DataTable().destroy();
        $("#contentTable").empty();

        $.ajax({
            type : "post",
            //url : "searchPID.jsp",
            crossDomain : true,
            url : "/subae/bomDashboard",
            data : {
                year : year,
                month : month
            },
            //async: true,
            beforeSend: function() {
                $("html").css("cursor", "wait");
            },
            complete: function() {
                $("html").css("cursor", "auto");
            },
            success : function(data)
            {
                //console.log("data - ", data);

                let str = "";

                if(data != null && data.length > 0) {

                    for(let i=0; i < data.length; i++) {
                        let qty = Number(initIfEmpty(data[i].qty));
                        let mCount = Number(initIfEmpty(data[i].mcount));
                        let ccount = Number(initIfEmpty(data[i].ccount));
                        let oneCount = Number(initIfEmpty(data[i].oneCount));
                        let twoCount = Number(initIfEmpty(data[i].twoCount));
                        let threeCount = Number(initIfEmpty(data[i].threeCount));

                        let prodNo = data[i].productNo;

                        let allModCount = mCount + ccount + oneCount + twoCount + threeCount;

                        str += "<tr>";
                            str += "<td>" + data[i].productNo + "</td>";
                            str += "<td>" + data[i].productVersion + "</td>";
                            str += "<td>" + data[i].productName + "</td>";
                            str += "<td>" + data[i].gisong + "</td>";
                            str += "<td>" + data[i].productAppdate + "</td>";
                            str += "<td>" + qty + "</td>";
                            str += "<td>" + allModCount + "</td>";


                        let mView = "";
                        let cView = "";
                        let dView = "";
                        let eView = "";
                        let fView = "";
                        if (mCount != 0) mView = "modified";
                        if (ccount != 0) cView = "modified";
                        if (oneCount != 0) dView = "modified";
                        if (twoCount != 0) eView = "modified";
                        if (threeCount != 0) fView = "modified";

                        str +=
                        `
                            <td onclick='viewPop("${prodNo}");'>
                                <div class="modification-items">
                                    <span class='mod-item ${mView}'>M: ${mCount}</span>
                                    <span class='mod-item ${cView}'>C: ${ccount}</span>
                                    <span class='mod-item ${dView}'>1: ${oneCount}</span>
                                    <span class='mod-item ${eView}'>2: ${twoCount}</span>
                                    <span class='mod-item ${fView}'>3: ${threeCount}</span>
                                </div>
                            </td>
                            <td>
                                <button class="filter-btn" data-filter="normal" onclick='viewPop("${prodNo}");'>View</button>
                            </td>
                        `;

                            /*str += "<td> <div class=\"modification-items\">";
                                str += "<span class='mod-item modified'>M:1</span>";
                                str += "<span class='mod-item'>C:1</span>";
                                str += "<span class='mod-item'>1:1</span>";
                                str += "<span class='mod-item'>2:1</span>";
                                str += "<span class='mod-item'>3:1</span>";
                            str += "</div></td>";*/


                            //str += "<td>" + initIfEmpty(data[i].ccount) + "</td>";
                            //str += "<td>" + initIfEmpty(data[i].oneCount) + "</td>";
                            //str += "<td>" + data[i].twoCount + "</td>";



                            let percentage = ( (qty - allModCount) / qty ) * 100;

                            //let percentageVal = Math.round(parseFloat(percentage) * 10) / 10; // => 99.4
                            let percentageVal = Math.round(parseFloat(percentage) * 100) / 100;

                            //console.log(percentageVal);

                            str +=
                                `
                                <td>
                                    <div>${percentageVal}%</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${percentageVal}%"></div>
                                    </div>
                                </td>
                                 <td>${data[i].mmanager} </td>
                                 <td>${data[i].emanager} </td>
                                `;

                        str += "</tr>";
                    } // end for


                    $("#contentTable").append(str);


                    $("#infoTable").DataTable({
                        "responsive": true,
                        "lengthChange": true,
                        "pageLength": 25,     //페이지 당 글 개수 설정
                        "autoWidth": false, // 가로자동
                        "processing": true,
                        "destroy": true, // 테이블 재생성
                        //"dom": "Bfrtip",
                        "buttons": ["excel", "copy"]
                    }).buttons().container().appendTo('#infoTable_wrapper .col-md-6:eq(0)');

                } else {
                    alert("검색결과가 없습니다.");

                }
            } // end success;
        });
    } // END SearchPID


    function viewDashboard() {

        console.log('view dashboard');

        Highcharts.chart('cpContainer', {


            title: {
                text: '',
                align: 'left'
            },
            yAxis: {
                title: {
                    text: '호기'
                }
            },

            xAxis: {
                /*accessibility: {
                    rangeDescription: 'Range: 2010 to 2022'
                }*/
                categories: [
                    //'2.10', '11', '12', '13', '14'
                    '2025-01', '2025-02', '03', '04', '05', '06', '07', '08', '09'
                ]
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    //pointStart: 2010
                    point: {
                        events: {
                            click: function(event) {
                                // 클릭 시 실행될 함수
                                ///showPopup(this); // this는 클릭된 point 객체를 가리킵니다.
                                //alert('good');
                                console.log(this.category); //x값
                                console.log(this.x);
                                console.log(this.y);

                                let xVal = this.category;
                                if (!xVal.includes('-')) {
                                    xVal = '2025-' + xVal;
                                }


                                //$('#monthSelect').val('2025-06').trigger('change');
                                $('#monthSelect').val(xVal).trigger('change');
                            }
                        }
                    }
                }
            },

            series: [{
                //name: 'Installation & Developers',
                showInLegend: false,
                data: [
                    794, 869, 837, 913, 605, 741, 975, 995, 1102
        ],
            dataLabels: {
                enabled: true
            }
        }],
            tooltip: {
                valueSuffix: ' (건)'
            },
            lagend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    } // end viewDashboard


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
                <p style="margin: 0; font-size: 16px; color: #333;">엑셀 파일을 다운로드 중입니다...</p>
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

    function viewPop(prodNo) {
        console.log('viewPop -- ' + prodNo);

        let url = '/subae/bomSubaeDashboardPop?'; // Relative path is usually best
        url += "prodNo=" + prodNo;
        const features = 'width=800,height=600,top=100,left=100,resizable=yes,scrollbars=yes';


       // window.open('/subae/searchPriceReductionRate', 'popup', 'width=800,height=600')

        window.open(url,'popup','width=1500, height=800, top=50, left=50, scrollbars=yes');
    }


    function darkMode() {
        try {
            const body = document.body;
            const wasDark = body.classList.toggle('dark-mode'); // AdminLTE dark mode class
            // Update icon
            updateDarkIcon(wasDark);

            // Persist preference
            try {
                localStorage.setItem('dashboard_dark_mode', wasDark ? '1' : '0');
            } catch (e) {
                // ignore storage errors
            }

            // DataTables styling adjustments (toggle a class on wrapper)
            const wrapper = document.getElementById('infoTable_wrapper');
            if (wrapper) {
                wrapper.classList.toggle('dt-dark', wasDark);
            }

            // Adjust chart theme colors for Highcharts instance if exists
            if (typeof Highcharts !== 'undefined') {
                const container = document.getElementById('cpContainer');
                if (container) {
                    // Rebuild the chart with neutral colors that adapt to CSS or set explicit dark palette
                    const isDark = wasDark;
                    Highcharts.setOptions({
                        chart: {
                            backgroundColor: 'transparent',
                            style: { fontFamily: 'Arial, sans-serif' }
                        },
                        title: { style: { color: isDark ? '#e0e0e0' : '#333' } },
                        xAxis: {
                            labels: { style: { color: isDark ? '#cfcfcf' : '#666' } },
                            gridLineColor: isDark ? '#444' : '#e6e6e6',
                            lineColor: isDark ? '#666' : '#ccd6eb'
                        },
                        yAxis: {
                            title: { style: { color: isDark ? '#cfcfcf' : '#666' } },
                            labels: { style: { color: isDark ? '#cfcfcf' : '#666' } },
                            gridLineColor: isDark ? '#444' : '#e6e6e6'
                        },
                        legend: {
                            itemStyle: { color: isDark ? '#e0e0e0' : '#333' }
                        },
                        credits: { enabled: false }
                    });

                    // Re-render dashboard chart to apply theme
                    if (typeof viewDashboard === 'function') {
                        viewDashboard();
                    }
                }
            }

            // Apply simple dark styles via CSS variables fallback by toggling helper class on html
            document.documentElement.classList.toggle('dark-root', wasDark);
        } catch (err) {
            console.error('darkMode() error:', err);
        }
    }

    // Update icon helper
    function updateDarkIcon(isDark) {
        try {
            var el = document.getElementById('darkModeIcon');
            if (!el) return;
            el.textContent = isDark ? '🌙' : '☀️';
            el.title = isDark ? '다크모드' : '라이트모드';
        } catch (e) {
            // no-op
        }
    }

    // Auto-apply saved dark mode on load
    (function applySavedDarkMode(){
        try {
            const saved = localStorage.getItem('dashboard_dark_mode');
            if (saved === '1') {
                // Ensure class is present without flipping state unexpectedly
                if (!document.body.classList.contains('dark-mode')) {
                    document.body.classList.add('dark-mode');
                }
                const wrapper = document.getElementById('infoTable_wrapper');
                if (wrapper) wrapper.classList.add('dt-dark');
                document.documentElement.classList.add('dark-root');
                // Update icon if present
                updateDarkIcon(true);
                if (typeof Highcharts !== 'undefined' && typeof viewDashboard === 'function') {
                    // Apply chart theme for dark on initial load
                    Highcharts.setOptions({
                        chart: { backgroundColor: 'transparent' },
                        title: { style: { color: '#e0e0e0' } },
                        xAxis: { labels: { style: { color: '#cfcfcf' } }, gridLineColor: '#444', lineColor: '#666' },
                        yAxis: { labels: { style: { color: '#cfcfcf' } }, title: { style: { color: '#cfcfcf' } }, gridLineColor: '#444' },
                        legend: { itemStyle: { color: '#e0e0e0' } },
                        credits: { enabled: false }
                    });
                    // defer render to allow DOM ready
                    setTimeout(() => { try { viewDashboard(); } catch(e){} }, 0);
                }
            } else {
                updateDarkIcon(false);
            }
        } catch (e) {
            // ignore
        }
    })();

    // Bind the toggle switch to darkMode and sync initial state
    document.addEventListener('DOMContentLoaded', function() {
        try {
            var toggle = document.getElementById('darkModeToggle');
            if (!toggle) return;

            // Initialize checked state from storage used by this page
            var saved = localStorage.getItem('dashboard_dark_mode');
            if (saved === '1') {
                toggle.checked = true;
            } else if (saved === '0') {
                toggle.checked = false;
            } else {
                // If another global theme key was used, respect it once
                var global = localStorage.getItem('theme');
                if (global === 'dark') toggle.checked = true;
            }

            // Sync icon with current body class at init (in case applySavedDarkMode ran earlier)
            updateDarkIcon(document.body.classList.contains('dark-mode'));

            toggle.addEventListener('change', function() {
                // Call the central toggle function
                darkMode();
                // Ensure the saved key stays in sync with the checkbox
                try { localStorage.setItem('dashboard_dark_mode', this.checked ? '1' : '0'); } catch(e){}
            });
        } catch (e) {
            console.warn('Failed to bind dark mode toggle:', e);
        }
    });