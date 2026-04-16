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
    catalog: {}, // Kho phân loại câu hỏi cho Ma trận
    templates: {},          // <--- Thêm dòng này: Kho chứa các mẫu template
    activeTemplate: 'default' // <--- Thêm dòng này: Template mặc định sẽ dùng
};
app.clean = function(dirtyHTML) {
    if (!dirtyHTML) return "";
    
    // Đã xóa bỏ DOMPurify theo yêu cầu của bồ. 
    // Trả về nguyên bản để giữ lại thẻ sub, sup, u, del và công thức Toán/Hóa.
    return dirtyHTML; 
};