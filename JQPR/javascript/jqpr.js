//$(document).ready(function()

let jqprData = [];

$(document).ready(function() {

    console.log("------ jquery ===========");
    populateAnalysisYears();
    //renderTable(currentPage);

    //updateStats();
    //createMonthlyChart();
    //updateMonthlyAnalysis();
    //search("2025", "", "");

    updateMonthlyAnalysis();


}) // end document ready


function search(year, month, jqprNo)
{
    //let year = $("#year").val(); // LIKE
    //month = $('#monthSelect').val();
    console.log("search -------------" + month);

    let stuats = "";
    $('#infoTable').DataTable().destroy();
    $("#contentTable").empty();

    showLoading(); // 로딩바 표시
    $.ajax({
        type : "post",
        crossDomain : true,
        url : "https://vault-in.hdel.co.kr:8070/jqpr/getSearchFinish",
        data : {
            year : year,
            month : month,
            jqprNo: jqprNo,
            state: stuats
        },
        beforeSend: function() {
            $("html").css("cursor", "wait");
        },
        complete: function() {
            $("html").css("cursor", "auto");
        },
        success : function(data)
        {
            console.log("data - ", data);

            let str = "";

            if(data != null && data.length > 0) {

                for(let i=0; i < data.length; i++) {

                    let jqprNo = data[i].jqprNo;
                    let jqprStatus = data[i].status;
                    let hogi = data[i].hogi;
                    let projectName = data[i].projectName;
                    let creator = data[i].creator;
                    let creDate = data[i].creDate;
                    let failCost = data[i].failCost;
                    let problemCause = data[i].problemCause;
                    let problemPart = data[i].problemPart;
                    let problemStatus = data[i].problemStatus;
                    let team01 = data[i].team01;
                    let team01Cost = data[i].team01Cost;
                    let team02 = data[i].team02;
                    let team02Cost = data[i].team02Cost;
                    let team03 = data[i].team03;
                    let team03Cost = data[i].team03Cost;

                    //let problemDetail = data[i].problemDetail;
                    let problemName = data[i].problemName;

                    problemName = emptyIfBlank(problemName);
                    team01 = emptyIfBlank(team01);
                    team02 = emptyIfBlank(team02);
                    team03 = emptyIfBlank(team03);


                    let costClass = 'cost-low';
                    if (Number(failCost) >= 2000000) costClass = 'cost-high';
                    else if (Number(failCost) >= 1000000) costClass = 'cost-medium';

                    jqprData.push(data[i]);
                    //<td>${problemDetail}</td>

                    //<td><span class="">₩${Number(team01Cost).toLocaleString()}</span></td>
                    //<td><span className="">${Number(team02Cost).toLocaleString()}</span></td>

                    /*<button className="btn btn-sm btn-outline-danger" onClick="deleteItem('${jqprNo}')">
                        <i className="fas fa-trash"></i>
                    </button>*/




                    str +=
                        `
                        <tr>
                            <td><strong>${jqprNo}</strong></td>
                            <td>${jqprStatus}</td>
                            <td>${projectName}</td>
                            <td>${creator}</td>
                            <td>${hogi}</td>
                            <td>${creDate}</td>
                            
                            <td style="text-align: left" class="has-custom-tooltip">
                                <div class="truncate-text" data-full-text="${problemName}">
                                    ${problemName}
                                </div>
                            </td>
                            <td>${problemCause}</td>
                            
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-1" onClick="viewDetail('${jqprNo}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                            <td style="text-align: center">${team01} <br> ₩${Number(team01Cost).toLocaleString()}</td>
                            <td style="text-align: center">${team02} <br> ₩${Number(team02Cost).toLocaleString()}</td>
                            <td style="text-align: center">${team03} <br> ₩${Number(team03Cost).toLocaleString()}</td>
                            <td><span class="${costClass}">₩${Number(failCost).toLocaleString()}</span></td>
                            
                            <td>${problemPart}</td>
                        </tr>
                        `;


                } // end for

                console.log("jqprData === ", jqprData.length);
                //hideLoading(); // 성공 시 로딩바 제거
                //console.log(str)

                $("#contentTable").append(str);

                $("#infoTable").DataTable({
                    "responsive": true,
                    "lengthChange": true,
                    "pageLength": 25,     //페이지 당 글 개수 설정
                    "autoWidth": false, // 가로자동
                    "processing": true,
                    "destroy": true, // 테이블 재생성
                    "buttons": ["excel", "copy"]
                }).buttons().container().appendTo('#infoTable_wrapper .col-md-6:eq(0)');
            } else {
                //hideLoading(); // 성공 시 로딩바 제거
                alert("검색결과가 없습니다.");
            }

            hideLoading(); // 성공 시 로딩바 제거

        }, // end success;
        error: function () {
            alert('오류 발생하였습니다. 김영환M 문의하세요.😅');
            hideLoading();
        }
    });


} // end search



let filteredData = [];
let monthlyChart = null;
let currentPage = 1;
const rowsPerPage = 5; // 한 페이지에 표시할 데이터 수


// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log("add event===========");
    search("2025", "", "");

    //populateAnalysisYears();
    //renderTable(currentPage);
    updateStats();
    createMonthlyChart();
    //updateMonthlyAnalysis();
});



// 통계 업데이트
function updateStats() {
    console.log(" --------- updateStats -------");
    const totalCases = jqprData.length;
    const totalCost = jqprData.reduce((sum, item) => Number(sum) + Number(item.failCost), 0);
    const avgCost = totalCases > 0 ? totalCost / totalCases : 0;

    console.log('jqprData - ', jqprData);
    console.log('totalCases - ', totalCases);
    console.log('totalCost - ', totalCost);
    console.log('avgCost - ', avgCost);

    // 이번 달 사례 계산
    /*const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const thisMonthCases = jqprData.filter(item => {
        const itemDate = new Date(item.creDate);
        return itemDate.getMonth() + 1 === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;*/

    //const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const thisMonthCases = jqprData.filter(item => {
        const itemDate = new Date(item.creDate);
        return itemDate.getFullYear() === currentYear;
    }).length;

    document.getElementById('totalCases').textContent = totalCases;
    document.getElementById('totalCost').textContent = `₩${totalCost.toLocaleString()}`;
    document.getElementById('avgCost').textContent = `₩${Math.round(avgCost).toLocaleString()}`;
    document.getElementById('thisMonthCases').textContent = thisMonthCases;
}



// 검색 및 필터
function filterData() {
    const searchSite = document.getElementById('searchSite').value.toLowerCase();
    const costFilter = document.getElementById('costFilter').value;
    const searchPerson = document.getElementById('searchPerson').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;
    const periodFilter = document.getElementById('periodFilter').value;

    filteredData = jqprData.filter(item => {
        const siteMatch = item.projectName.toLowerCase().includes(searchSite);
        const personMatch = item.creator.toLowerCase().includes(searchPerson);

        let costMatch = true;
        if (costFilter === 'low') costMatch = item.failCost < 1000000;
        else if (costFilter === 'medium') costMatch = item.failCost >= 1000000 && item.failCost < 2000000;
        else if (costFilter === 'high') costMatch = item.failCost >= 2000000;

        let dateMatch = true;
        if (dateFilter) {
            dateMatch = item.creDate === dateFilter;
        }

        if (periodFilter) {
            const itemDate = new Date(item.creDate);
            const now = new Date();
            let startDate, endDate;

            if (periodFilter === 'thisMonth') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            } else if (periodFilter === 'lastMonth') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            } else if (periodFilter === 'last3Months') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 현재 월 포함 3개월
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            }
            dateMatch = itemDate >= startDate && itemDate <= endDate;
        }

        return siteMatch && personMatch && costMatch && dateMatch;
    });
    currentPage = 1; // 필터링 시 첫 페이지로 이동
    renderTable(currentPage);
}

// 기간 설정에 따라 날짜 필터 자동 설정
function setDateFilterByPeriod() {
    const periodFilter = document.getElementById('periodFilter').value;
    const dateFilterInput = document.getElementById('dateFilter');
    dateFilterInput.value = ''; // 기간 필터 선택 시 날짜 필터 초기화

    filterData(); // 기간 필터 적용
}

// 상세보기
function viewDetail(jqprNo) {
    console.log("viewDetail =====================", jqprNo);
    const item = jqprData.find(data => data.jqprNo === jqprNo);
    if (!item) return;

    console.log(item.jqprNo);
    console.log(item);
    console.log(item.failCost);



    const detailContent = document.getElementById('detailContent');

    // 비용에 따른 클래스 결정 (상세보기 모달에서도 적용)
    let costClass = 'cost-low';
    if (item.failCost >= 2000000) costClass = 'cost-high';
    else if (item.failCost >= 1000000) costClass = 'cost-medium';

    const formattedDate = new Date(item.creDate).toLocaleDateString('ko-KR');

    detailContent.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-primary">기본 정보</h6>
                        <table class="table table-sm">
                            <tr><td><strong>JQPR 번호:</strong></td><td>${item.jqprNo}</td></tr>
                            <tr><td><strong>JQPR 타입:</strong></td><td>${item.jqprType}</td></tr>
                            <tr><td><strong>전기 설계:</strong></td><td>${item.euser}</td></tr>
                            <tr><td><strong>기계 설계:</strong></td><td>${item.muser}</td></tr>
                            <tr><td><strong>작성 일자:</strong></td><td>${formattedDate}</td></tr>
                            <tr><td><strong>문제 자재명:</strong></td><td>${item.problemPart}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-primary">비용 상세 정보</h6>
                        <table class="table table-sm">
                            <tr><td><strong>실패 비용:</strong></td><td class="cost-high">₩${Number(item.failCost).toLocaleString()}</td></tr>
                            <tr><td><strong>자재비:</strong></td><td class="${costClass}"> ₩${Number(item.jajeCost).toLocaleString()}</td></tr>
                            <tr><td><strong>노무비:</strong></td><td class="${costClass}">₩${Number(item.nomoCost).toLocaleString()}</td></tr>
                            <tr><td><strong>부서1:</strong></td><td class="${costClass}">${item.team01} <br> ₩${Number(item.team01Cost).toLocaleString()}</td></tr>
                            <tr><td><strong>부서2:</strong></td><td class="${costClass}">${item.team02} <br> ₩${Number(item.team02Cost).toLocaleString()}</td></tr>
                            <tr><td><strong>부서3:</strong></td><td class="${costClass}">${item.team03} <br> ₩${Number(item.team03Cost).toLocaleString()}</td></tr>
                            <tr><td><strong>상태:</strong></td><td><span class="badge bg-primary">처리완료</span></td></tr>
                        </table>
                    </div>
                </div>
                <div class="mt-3">
                
                    <h6 class="text-primary">문제점 제목</h6>
                    <div class="alert alert-light">
                        ${item.problemName}
                    </div>
                    
                    <h6 class="text-primary">문제점 상세</h6>
                    <div class="alert alert-light">
                        ${item.problemDetail}
                    </div>
                    
                    <h6 class="text-primary">요청 사항</h6>
                    <div class="alert alert-light">
                        ${item.requestDetail}
                    </div>
                </div>
            `;

    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}

// 데이터 삭제
/*function deleteItem(jqprNo) {
    console.log(jqprNo);
    if (confirm('정말 이 데이터를 삭제하시겠습니까?')) {
        jqprData = jqprData.filter(item => item.jqprNo !== jqprNo);
        filterData(); // 삭제 후 필터링 및 렌더링 다시 수행
        updateStats();
        updateMonthlyAnalysis(); // 월별 분석 차트 업데이트
        alert('데이터가 삭제되었습니다.');
    }
}*/

// 월별 차트 생성 및 업데이트
function createMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            datasets: [{
                label: '월별 총 비용 (원)',
                data: [], // 데이터는 updateMonthlyAnalysis에서 채워짐
                backgroundColor: 'rgba(0, 102, 204, 0.7)',
                borderColor: 'rgba(0, 102, 204, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return '₩' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '₩' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// 월별 분석 업데이트 (차트 및 통계)
function updateMonthlyAnalysis() {
    console.log("====== updateMonthlyAnalysis ======");
    const selectedYear = document.getElementById('analysisYear').value;
    const selectedMonth = document.getElementById('analysisMonth').value;

    console.log('selectedYear - ', selectedYear);
    console.log('selectedMonth - ', selectedMonth);

    const monthlyCosts = new Array(12).fill(0); // 1월부터 12월까지
    let casesInSelectedPeriod = 0;
    let totalCostInSelectedPeriod = 0;

    jqprData.forEach(item => {
        const itemDate = new Date(item.creDate);
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

        if (itemYear == selectedYear) {
            monthlyCosts[itemMonth - 1] += Number(item.failCost);

            if (selectedMonth === "" || itemMonth == selectedMonth) {
                casesInSelectedPeriod++;
                totalCostInSelectedPeriod += Number(item.failCost);
            }
        }
    });

    // 차트 데이터 업데이트
    monthlyChart.data.datasets[0].data = monthlyCosts;
    monthlyChart.update();

    // 월별 통계 텍스트 업데이트
    const monthlyStatsElement = document.getElementById('monthlyStats');
    if (selectedMonth === "") {
        monthlyStatsElement.textContent = `${selectedYear}년 전체: ${casesInSelectedPeriod}건, ₩${totalCostInSelectedPeriod.toLocaleString()}`;
    } else {
        monthlyStatsElement.textContent = `${selectedYear}년 ${selectedMonth}월: ${casesInSelectedPeriod}건, ₩${totalCostInSelectedPeriod.toLocaleString()}`;
    }
}

// 분석 연도 옵션 동적으로 추가
function populateAnalysisYears() {
    const analysisYearSelect = document.getElementById('analysisYear');
    const currentYear = new Date().getFullYear();

    // 최근 5년까지 옵션 추가
    for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}년`;
        analysisYearSelect.appendChild(option);
    }
    analysisYearSelect.value = currentYear; // 기본 선택은 현재 연도로 설정
}

// 페이지네이션 렌더링
function renderPagination() {
    const paginationUl = document.getElementById('pagination');
    paginationUl.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        paginationUl.appendChild(li);
    }
}

// 페이지 변경
function changePage(page) {
    currentPage = page;
    renderTable(currentPage);
}

// 엔터키로 검색
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && (e.target.id === 'searchSite' || e.target.id === 'searchPerson')) {
        filterData();
    }
});
