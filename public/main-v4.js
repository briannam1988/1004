
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('generateBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            alert('버튼 클릭 성공! 이벤트 리스너가 작동합니다.');
        });
    } else {
        alert('오류: 버튼(generateBtn)을 찾을 수 없습니다.');
    }
});
