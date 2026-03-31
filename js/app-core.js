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