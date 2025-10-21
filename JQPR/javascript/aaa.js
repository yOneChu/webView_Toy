
    // ✅ 예시 데이터
    const year = "2025";
    const month = "10";
    const jqprNo = "JQPR-20251017-001";
    const state = "FINISH";

    // ✅ API 요청 함수
    async function getSearchFinish() {
    try {
        const response = await fetch("https://vault-in.hdel.co.kr:8070/jqpr/getSearchFinish", {
        method: "POST",                        // POST 방식
        headers: {
        "Content-Type": "application/json", // JSON 전송 명시
        "Accept": "application/json"        // 응답도 JSON 예상
    },
        body: JSON.stringify({                // ✅ 요청 본문 (JSON 직렬화)
        year: year,
        month: '',
        jqprNo: '',
        state: ''
    })
    });

        if (!response.ok) {
        throw new Error("서버 응답 오류: " + response.status);
    }

        // ✅ 응답 JSON 파싱
        const data = await response.json();
        console.log("✅ 서버 응답 데이터:", data);

        // 예: 응답 데이터 활용
        if (data && data.result) {
        console.log("처리 결과:", data.result);
    }

    } catch (error) {
        console.error("❌ 요청 실패:", error);
    }
}

    // ✅ 페이지 로드 후 자동 호출 (혹은 버튼 클릭 이벤트에서 호출 가능)
    //window.addEventListener("DOMContentLoaded", getSearchFinish);
