document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('hot-container');

    // JSON 형식의 샘플 데이터 (객체들의 배열)
    const jsonData = [
        {id: 1, name: '김철수', age: 28, city: '서울'},
        {id: 2, name: '이영희', age: 34, city: '부산'},
        {id: 3, name: '박민준', age: 22, city: '대구'},
        {id: 4, name: '최유리', age: 31, city: '인천'}
    ];

    // Handsontable 초기화 옵션 설정
    const hotSettings = {
        data: jsonData,             // JSON 형식 데이터 지정

        // 열 헤더를 명시적으로 정의 (사용자에게 보여질 이름)
        colHeaders: ['ID', '이름', '나이', '도시'],

        // 데이터 객체의 속성과 열을 매핑
        columns: [
            {data: 'id', type: 'numeric', readOnly: true}, // ID는 숫자 타입, 읽기 전용
            {data: 'name', type: 'text'},                  // 이름은 텍스트 타입
            {data: 'age', type: 'numeric'},                 // 나이는 숫자 타입
            {data: 'city', type: 'text'}                   // 도시는 텍스트 타입
        ],

        rowHeaders: true,           // 행 헤더 표시
        contextMenu: true,          // 우클릭 컨텍스트 메뉴 활성화
        filters: true,              // 필터링 기능 활성화
        dropdownMenu: true,         // 드롭다운 메뉴 활성화
        height: 'auto',             // 높이를 내용에 맞게 자동 조절
        width: 'auto',              // 너비를 내용에 맞게 자동 조절
        licenseKey: 'non-commercial-and-evaluation' // 비상업적 또는 평가용 라이선스 키
    };

    // Handsontable 인스턴스 생성 및 초기화
    const hot = new Handsontable(container, hotSettings);

    console.log('Handsontable (JSON 데이터)이 성공적으로 로드되었습니다.');
});