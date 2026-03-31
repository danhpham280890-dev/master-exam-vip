// ==========================================
// CÔNG TẮC KHỞI ĐỘNG & ĐIỀU PHỐI CHUNG
// ==========================================

app.init = function() {
    this.originalData = JSON.parse(JSON.stringify(EXAM.data));
    this.workingData = []; // 👈 QUAN TRỌNG: Khởi đầu với giỏ xách trống rỗng, không chứa câu nào!
    this.buildCatalog();
    this.updateUI(); 
    
    // Cố tình KHÔNG gọi this.run() ở đây để màn hình Welcome không bị ghi đè thành giấy thi trắng.
};

app.run = function() {
    if (this.workingData.length === 0) return; // 👈 THÊM DÒNG NÀY: Giỏ xách rỗng thì nằm im, không mất công render
    
    this.preprocess();
    this.validate();
    this.updateUI();

    let inputSoLuong = document.getElementById('cfg-soluong');
    let soLuong = parseInt(EXAM.config.soLuongMaDe) || (inputSoLuong ? parseInt(inputSoLuong.value) : 1) || 1;
    
    if (this.generateExamVersions) {
        this.generateExamVersions(soLuong);
    } else {
        alert("⚠️ Báo lỗi: Chưa nạp file app-shuffler.js");
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
        // ✨ ĐÃ TÍCH HỢP CHIP ĐỊNH VỊ CHO LIVE EDITOR Ở ĐÂY:
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
    this.closeSettings();
    this.run(); 
};
// --- Modal Nạp Dữ Liệu ---
app.openImportModal = function() { document.getElementById('import-modal').style.display = 'flex'; };
app.closeImportModal = function() { document.getElementById('import-modal').style.display = 'none'; };
window.onload = () => { app.init(); };