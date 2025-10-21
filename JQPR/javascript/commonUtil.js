
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


// 로딩바 제거 함수
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
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
                <p style="margin: 0; font-size: 16px; color: #333;">데이터 분석 중입니다...</p>
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

