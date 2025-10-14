// 샘플 데이터
let jqprData = [
    {
        jqprNo: 'JQPR-2024-001',
        siteName: '서울 강남 오피스텔',
        problemPerson: '김현대',
        problemDate: '2024-07-15',
        problemCost: 2500000,
        problemReason: '엘리베이터 설치 중 전기 배선 손상으로 인한 추가 공사',
        siteAddress: '서울시 강남구 테헤란로 123'
    },
    {
        jqprNo: 'JQPR-2024-002',
        siteName: '부산 해운대 아파트',
        problemPerson: '이엘리',
        problemDate: '2024-07-20',
        problemCost: 850000,
        problemReason: '승강기 도어 정렬 불량으로 인한 재작업',
        siteAddress: '부산시 해운대구 해운대로 456'
    },
    {
        jqprNo: 'JQPR-2024-003',
        siteName: '대구 수성구 상가',
        problemPerson: '박베이터',
        problemDate: '2024-07-25',
        problemCost: 1200000,
        problemReason: '기계실 환기 시설 부족으로 인한 추가 설치',
        siteAddress: '대구시 수성구 범어로 789'
    },
    {
        jqprNo: 'JQPR-2024-004',
        siteName: '인천 송도 신도시',
        problemPerson: '최승강',
        problemDate: '2024-06-10',
        problemCost: 3200000,
        problemReason: '지하층 침수로 인한 장비 교체 및 방수 작업',
        siteAddress: '인천시 연수구 송도동 101'
    },
    {
        jqprNo: 'JQPR-2024-005',
        siteName: '광주 북구 병원',
        problemPerson: '정기계',
        problemDate: '2024-06-28',
        problemCost: 450000,
        problemReason: '의료용 엘리베이터 추가 안전장치 설치',
        siteAddress: '광주시 북구 용봉로 202'
    },
    {
        jqprNo: 'JQPR-2024-006',
        siteName: '대전 유성구 연구소',
        problemPerson: '한승기',
        problemDate: '2024-05-15',
        problemCost: 1800000,
        problemReason: '연구실 특수 환경으로 인한 방진 시설 추가',
        siteAddress: '대전시 유성구 대학로 303'
    },
    {
        jqprNo: 'JQPR-2024-007',
        siteName: '울산 남구 공장',
        problemPerson: '조엘베',
        problemDate: '2024-05-22',
        problemCost: 2100000,
        problemReason: '화물용 엘리베이터 하중 초과로 인한 보강 작업',
        siteAddress: '울산시 남구 공업로 404'
    },
    {
        jqprNo: 'JQPR-2024-008',
        siteName: '제주 서귀포 호텔',
        problemPerson: '임베이',
        problemDate: '2024-04-18',
        problemCost: 950000,
        problemReason: '관광객용 엘리베이터 디자인 변경 요청',
        siteAddress: '제주시 서귀포시 중문로 505'
    },
    {
        jqprNo: 'JQPR-2023-001',
        siteName: '서울 종로 빌딩',
        problemPerson: '최건축',
        problemDate: '2023-11-01',
        problemCost: 1800000,
        problemReason: '노후 부품 교체 및 시스템 업그레이드',
        siteAddress: '서울시 종로구 종로 100'
    },
    {
        jqprNo: 'JQPR-2023-002',
        siteName: '수원 영통구 아파트',
        problemPerson: '강안전',
        problemDate: '2023-10-20',
        problemCost: 700000,
        problemReason: '승강기 내부 CCTV 설치',
        siteAddress: '수원시 영통구 봉영로 500'
    },
    {
        jqprNo: 'JQPR-2023-003',
        siteName: '춘천시 리조트',
        problemPerson: '윤시설',
        problemDate: '2023-09-05',
        problemCost: 2800000,
        problemReason: '야외 엘리베이터 방수 처리 문제',
        siteAddress: '춘천시 신북읍 888'
    }
];

let filteredData = [...jqprData];
let monthlyChart = null;
let currentPage = 1;
const rowsPerPage = 5; // 한 페이지에 표시할 데이터 수

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    populateAnalysisYears();
    renderTable(currentPage);
    updateStats();
    createMonthlyChart();
    updateMonthlyAnalysis();
});

// 테이블 렌더링
function renderTable(page) {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    paginatedData.forEach(item => {
        const row = document.createElement('tr');

        // 비용에 따른 클래스 결정
        let costClass = 'cost-low';
        if (item.problemCost >= 2000000) costClass = 'cost-high';
        else if (item.problemCost >= 1000000) costClass = 'cost-medium';

        // 날짜 포맷팅
        const formattedDate = new Date(item.problemDate).toLocaleDateString('ko-KR');

        row.innerHTML = `
                    <td><strong>${item.jqprNo}</strong></td>
                    <td>${item.siteName}</td>
                    <td>${item.problemPerson}</td>
                    <td>${formattedDate}</td>
                    <td><span class="${costClass}">₩${item.problemCost.toLocaleString()}</span></td>
                    <td>${item.problemReason.length > 30 ? item.problemReason.substring(0, 30) + '...' : item.problemReason}</td>
                    <td>${item.siteAddress}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="viewDetail('${item.jqprNo}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${item.jqprNo}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
        tbody.appendChild(row);
    });
    renderPagination();
}

// 통계 업데이트
function updateStats() {
    const totalCases = jqprData.length;
    const totalCost = jqprData.reduce((sum, item) => sum + item.problemCost, 0);
    const avgCost = totalCases > 0 ? totalCost / totalCases : 0;

    // 이번 달 사례 계산
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const thisMonthCases = jqprData.filter(item => {
        const itemDate = new Date(item.problemDate);
        return itemDate.getMonth() + 1 === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;

    document.getElementById('totalCases').textContent = totalCases;
    document.getElementById('totalCost').textContent = `₩${totalCost.toLocaleString()}`;
    document.getElementById('avgCost').textContent = `₩${Math.round(avgCost).toLocaleString()}`;
    document.getElementById('thisMonthCases').textContent = thisMonthCases;
}

// 데이터 추가
function addData() {
    const jqprNo = document.getElementById('jqprNo').value;
    const siteName = document.getElementById('siteName').value;
    const problemPerson = document.getElementById('problemPerson').value;
    const problemDate = document.getElementById('problemDate').value; // 날짜 입력값 가져오기
    const problemCost = parseInt(document.getElementById('problemCost').value);
    const problemReason = document.getElementById('problemReason').value;
    const siteAddress = document.getElementById('siteAddress').value;

    // 필수 필드 유효성 검사
    if (!jqprNo || !siteName || !problemPerson || !problemDate || isNaN(problemCost) || !problemReason || !siteAddress) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const newItem = {
        jqprNo,
        siteName,
        problemPerson,
        problemDate,
        problemCost,
        problemReason,
        siteAddress
    };

    jqprData.push(newItem);
    filterData(); // 데이터 추가 후 필터링 및 렌더링 다시 수행
    updateStats();
    updateMonthlyAnalysis(); // 월별 분석 차트 업데이트

    // 모달 닫기 및 폼 리셋
    const modal = bootstrap.Modal.getInstance(document.getElementById('addModal'));
    modal.hide();
    document.getElementById('addForm').reset();

    alert('데이터가 성공적으로 추가되었습니다.');
}

// 검색 및 필터
function filterData() {
    const searchSite = document.getElementById('searchSite').value.toLowerCase();
    const costFilter = document.getElementById('costFilter').value;
    const searchPerson = document.getElementById('searchPerson').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;
    const periodFilter = document.getElementById('periodFilter').value;

    filteredData = jqprData.filter(item => {
        const siteMatch = item.siteName.toLowerCase().includes(searchSite);
        const personMatch = item.problemPerson.toLowerCase().includes(searchPerson);

        let costMatch = true;
        if (costFilter === 'low') costMatch = item.problemCost < 1000000;
        else if (costFilter === 'medium') costMatch = item.problemCost >= 1000000 && item.problemCost < 2000000;
        else if (costFilter === 'high') costMatch = item.problemCost >= 2000000;

        let dateMatch = true;
        if (dateFilter) {
            dateMatch = item.problemDate === dateFilter;
        }

        if (periodFilter) {
            const itemDate = new Date(item.problemDate);
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
    const item = jqprData.find(data => data.jqprNo === jqprNo);
    if (!item) return;

    const detailContent = document.getElementById('detailContent');

    // 비용에 따른 클래스 결정 (상세보기 모달에서도 적용)
    let costClass = 'cost-low';
    if (item.problemCost >= 2000000) costClass = 'cost-high';
    else if (item.problemCost >= 1000000) costClass = 'cost-medium';

    const formattedDate = new Date(item.problemDate).toLocaleDateString('ko-KR');

    detailContent.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-primary">기본 정보</h6>
                        <table class="table table-sm">
                            <tr><td><strong>JQPR번호:</strong></td><td>${item.jqprNo}</td></tr>
                            <tr><td><strong>현장명:</strong></td><td>${item.siteName}</td></tr>
                            <tr><td><strong>문제발생자:</strong></td><td>${item.problemPerson}</td></tr>
                            <tr><td><strong>발생일자:</strong></td><td>${formattedDate}</td></tr>
                            <tr><td><strong>발생비용:</strong></td><td class="${costClass}">₩${item.problemCost.toLocaleString()}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-primary">현장 정보</h6>
                        <table class="table table-sm">
                            <tr><td><strong>현장주소:</strong></td><td>${item.siteAddress}</td></tr>
                            <tr><td><strong>상태:</strong></td><td><span class="badge bg-primary">처리완료</span></td></tr>
                        </table>
                    </div>
                </div>
                <div class="mt-3">
                    <h6 class="text-primary">발생사유</h6>
                    <div class="alert alert-light">
                        ${item.problemReason}
                    </div>
                </div>
            `;

    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}

// 데이터 삭제
function deleteItem(jqprNo) {
    if (confirm('정말 이 데이터를 삭제하시겠습니까?')) {
        jqprData = jqprData.filter(item => item.jqprNo !== jqprNo);
        filterData(); // 삭제 후 필터링 및 렌더링 다시 수행
        updateStats();
        updateMonthlyAnalysis(); // 월별 분석 차트 업데이트
        alert('데이터가 삭제되었습니다.');
    }
}

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
    const selectedYear = document.getElementById('analysisYear').value;
    const selectedMonth = document.getElementById('analysisMonth').value;

    const monthlyCosts = new Array(12).fill(0); // 1월부터 12월까지
    let casesInSelectedPeriod = 0;
    let totalCostInSelectedPeriod = 0;

    jqprData.forEach(item => {
        const itemDate = new Date(item.problemDate);
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

        if (itemYear == selectedYear) {
            monthlyCosts[itemMonth - 1] += item.problemCost;

            if (selectedMonth === "" || itemMonth == selectedMonth) {
                casesInSelectedPeriod++;
                totalCostInSelectedPeriod += item.problemCost;
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