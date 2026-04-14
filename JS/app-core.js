// ==========================================
// THÂN ROBOT: LƯU TRỮ TRẠNG THÁI VÀ DỮ LIỆU
// ==========================================
window.app = {
    originalData: [],
    workingData: [],
    pageCount: 0,
    qCounter: 1, 
    ansMCQ: [], 
    ansTF: [],  
    ansEssay: [], 
    totalSecs: 0,
    matrix: { NB: 0, TH: 0, VD: 0, VDC: 0 },
    catalog: {} // Kho phân loại câu hỏi cho Ma trận
};
app.clean = function(dirtyHTML) {
    if (!dirtyHTML) return "";
    
    // 1. Rửa sạch mã độc
    let cleanHTML = DOMPurify.sanitize(String(dirtyHTML), {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'img', 'span', 'div', 'table', 'tr', 'td', 'th', 'tbody', 'thead'],
        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'style', 'width', 'height', 'data-qid']
    });

    // 2. So sánh: Nếu chuỗi sau khi rửa mà khác chuỗi ban đầu -> Chắc chắn có rác/mã độc!
    if (cleanHTML !== dirtyHTML) {
        console.warn("⚠️ Đã phát hiện và dọn dẹp mã khả nghi trong câu hỏi!");
        
        // Gọi Toast thông báo cho giáo viên biết mà cẩn thận với file gốc
        if (window.app && typeof window.app.toast === 'function') {
            app.toast("⚠️ Hệ thống đã tự động lọc bỏ mã độc/rác ẩn trong nội dung đề thi!", "warning");
        }
    }

    return cleanHTML;
};