// ==========================================
// CÔNG TẮC KHỞI ĐỘNG & ĐIỀU PHỐI CHUNG
// ==========================================

app.init = function() {
    // 1. Nếu chưa có biến EXAM (do không dùng file data.js), tự tạo một cái rỗng để chống crash
    window.EXAM = window.EXAM || {
        config: { 
            mode: 'exam', 
            autoNumbering: true,  // 👈 BỒ THÊM DÒNG NÀY VÀO LÀ SỐ CÂU HIỆN RA LIỀN
			fontSize: 14, 
            lineHeight: 1.15,
            truong: "Trường ...............",
            kyThi: "Thi Học Kì",
            khoaNgay: "",
            diemThi: "",
            monThi: "Môn ...............",
            maDe: "101",
            soLuongMaDe: 1,
            footerText: ""
        },
        data: []
    };

    // 2. Khởi tạo kho dữ liệu trống chờ bồ nạp đạn vào
    this.originalData = [];
    this.workingData = []; 
    
    // 3. Cập nhật giao diện (Màu sắc nút, cỡ chữ...)
    this.updateUI(); 
};

app.run = function() {
    if (this.workingData.length === 0) return; 
    
    this.preprocess();
    this.validate();
    this.updateUI();

    let inputSoLuong = document.getElementById('cfg-soluong');
    let soLuong = parseInt(EXAM.config.soLuongMaDe) || (inputSoLuong ? parseInt(inputSoLuong.value) : 1) || 1;
    
    if (this.generateExamVersions) {
        this.generateExamVersions(soLuong);
    } else {
        app.toast("⚠️ Báo lỗi: Chưa nạp file app-shuffler.js", "error");
    }

    this.preloadImages(this.workingData).then(() => this.autoFit());
};

app.toggleMode = function() {
    EXAM.config.mode = (EXAM.config.mode === 'exam') ? 'key' : 'exam';
    this.run();
};

app.preprocess = function() {
    this.totalSecs = 0;
    this.matrix = { NB: 0, TH: 0, VD: 0, VDC: 0 };
    let currentPts = "";
    let tIdx = 1; 
    
    this.workingData.forEach((item, idx) => {
        if (!item._id) item._id = "q_" + Date.now() + "_" + idx; 
        
        if (item.type === "section") {
            this.totalSecs++;
            currentPts = item.pointsPerQuestion || "";
            let mcqCount = 0; let qOffset = 0; let start = -1;
            
            for (let j = idx + 1; j < this.workingData.length; j++) {
                if (this.workingData[j].type === "section") break;
                let types = ["mcq", "true-false", "cloze", "matching", "fill-blank", "essay", "essay-multi"];
                if (types.includes(this.workingData[j].type)) {
                    if (this.workingData[j].type === "mcq") {
                        if (start === -1) start = tIdx + qOffset;
                        mcqCount++;
                    }
                    qOffset++;
                }
            }
            if (mcqCount > 0) { item.showMCQTable = true; item._count = mcqCount; item._start = start; } 
            else { item.showMCQTable = false; }
            
        } else if (item.type !== "reading") {
            if (!item.points && currentPts) item.points = currentPts;
            item._qIdx = tIdx++;
            if (item.level && this.matrix[item.level] !== undefined) this.matrix[item.level]++;
        }
    });
};

app.validate = function() {
    let total = 0; let missing = 0;
    this.workingData.forEach(item => {
        if (item.points) { 
            let num = parseFloat(String(item.points).replace(',', '.')); 
            if (!isNaN(num)) total += num; 
        }
        if (item.type === 'mcq' && !item.answer) missing++;
    });
    
    let sEl = document.getElementById('val-score');
    sEl.innerHTML = (Math.abs(total - EXAM.config.totalExpectedScore) > 0.01) ? `⚠️ Điểm: ${total.toFixed(2)}đ (Lệch)` : `✅ Điểm: ${total.toFixed(2)}đ`;
    sEl.className = (Math.abs(total - EXAM.config.totalExpectedScore) > 0.01) ? "status-err" : "status-ok";
    
    let aEl = document.getElementById('val-ans');
    aEl.innerHTML = (missing > 0) ? `⚠️ Thiếu ${missing} đ/a` : `✅ Đủ đ/a`;
    aEl.className = (missing > 0) ? "status-err" : "status-ok";
};

app.openSettings = function() {
    document.getElementById('cfg-truong').value = EXAM.config.truong || "";
    document.getElementById('cfg-kythi').value = EXAM.config.kyThi || "";
    document.getElementById('cfg-khoangay').value = EXAM.config.khoaNgay || "";
    document.getElementById('cfg-diemthi').value = EXAM.config.diemThi || "";
    document.getElementById('cfg-monthi').value = EXAM.config.monThi || "";
    document.getElementById('cfg-made').value = EXAM.config.maDe || "101";
    document.getElementById('cfg-soluong').value = EXAM.config.soLuongMaDe || 1;
    document.getElementById('cfg-sophan').value = EXAM.config.soPhan || this.totalSecs || 1;
    
    // Nạp footer cũ lên giao diện
    let inputFooter = document.getElementById('cfg-footer');
    if(inputFooter) inputFooter.value = EXAM.config.footerText || "";
    
    // Lấy API URL từ localStorage gắn lên giao diện
    let savedApi = localStorage.getItem('MASTER_EXAM_API_URL') || "";
    let inputApi = document.getElementById('cfg-api-url');
    if(inputApi) inputApi.value = savedApi;

    document.getElementById('settings-modal').style.display = 'flex';
};

app.closeSettings = function() { document.getElementById('settings-modal').style.display = 'none'; };

app.saveSettings = function() {
    EXAM.config.truong = document.getElementById('cfg-truong').value;
    EXAM.config.kyThi = document.getElementById('cfg-kythi').value;
    EXAM.config.khoaNgay = document.getElementById('cfg-khoangay').value;
    EXAM.config.diemThi = document.getElementById('cfg-diemthi').value;
    EXAM.config.monThi = document.getElementById('cfg-monthi').value;
    EXAM.config.maDe = document.getElementById('cfg-made').value;
    EXAM.config.soLuongMaDe = parseInt(document.getElementById('cfg-soluong').value) || 1;
    EXAM.config.soPhan = parseInt(document.getElementById('cfg-sophan').value) || this.totalSecs;
    
    // Lưu footer mới vào config
    let inputFooter = document.getElementById('cfg-footer');
    if(inputFooter) EXAM.config.footerText = inputFooter.value.trim();

    // Lưu API URL xuống localStorage
    let inputApi = document.getElementById('cfg-api-url');
    if(inputApi) {
        let apiUrl = inputApi.value.trim();
        if (apiUrl) {
            localStorage.setItem('MASTER_EXAM_API_URL', apiUrl);
        } else {
            localStorage.removeItem('MASTER_EXAM_API_URL');
        }
    }

    this.closeSettings();
    this.run(); 
};

// --- Modal Nạp Dữ Liệu ---
app.openImportModal = function() { document.getElementById('import-modal').style.display = 'flex'; };
app.closeImportModal = function() { document.getElementById('import-modal').style.display = 'none'; };
window.onload = () => { app.init(); };
// ==========================================
// UI UTILITIES: TOAST & LOADING SPINNER
// ==========================================
app.toast = function(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) return;
    
    let toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : 'ℹ️'));
    toast.innerHTML = `<div class="toast-icon">${icon}</div> <div>${msg.replace(/\n/g, '<br>')}</div>`;
    
    container.appendChild(toast);
    
    // Tự động biến mất sau 4 giây
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
    
    // Bấm vào thì tắt luôn
    toast.onclick = () => toast.remove();
};

app.showLoading = function(text = 'Đang xử lý...') {
    let overlay = document.getElementById('loading-overlay');
    let textEl = document.getElementById('loading-text');
    if (overlay && textEl) {
        textEl.innerText = text;
        overlay.style.display = 'flex';
    }
};

app.hideLoading = function() {
    let overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
};