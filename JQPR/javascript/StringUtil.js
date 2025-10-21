

// 'YYYYMMDD'를 'YYYY-MM-DD'로 변환
/**
 * @description 'YYYYMMDD'를 'YYYY-MM-DD'로 변환
 * @param dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
    if (!/^\d{8}$/.test(dateStr)) {
        throw new Error("입력값은 8자리 숫자 문자열이어야 합니다. 예: 20251008");
    }

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    return `${year}-${month}-${day}`;
}
/**
 * @description 주어진 값이 null, undefined 이거나 공백 문자열이면 빈 문자열("")을 반환하고, 그렇지 않으면 원본 값을 반환합니다.
 * @param {*} value - 검사할 값
 * @returns {*} 빈 문자열("") 또는 원본 값
 */
function emptyIfBlank(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === 'string') {
        return value.trim() === '' ? '' : value;
    }
    return value;
}
