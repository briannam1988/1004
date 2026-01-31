document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('generateBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            alert('드디어 버튼이 클릭되었습니다!');
        });
    } else {
        // 만약 버튼을 찾지 못하면 이 알림창이 뜹니다.
        alert('오류: generateBtn 버튼을 찾을 수 없습니다. HTML을 확인해주세요.');
    }
});
