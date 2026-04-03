// ==========================================
// MODULE 5: TRẠM KIỂM DUYỆT (STAGING AREA)
// ==========================================

app.openStagingModal = function() {
    let tbody = document.getElementById('staging-tbody');
    tbody.innerHTML = '';
    let html = '';
    let qIdx = 1;

    this.workingData.forEach((item) => {
        if (item.type === 'section') {
            html += `<tr><td colspan="5" style="background:#e9ecef; font-weight:bold; padding:8px; color: #007bff;">${item.title}</td></tr>`;
            return;
        }
        
        // Trích xuất 1 đoạn ngắn của câu hỏi để hiển thị cho gọn
        let shortQ = item.question || item.content || item.title || "";
        if (shortQ.length > 150) shortQ = shortQ.substring(0, 150) + "...";
        shortQ = shortQ.replace(/\n/g, '<br>'); // Giữ nguyên dòng
        if (item.image) shortQ += ` <br><i>[Có đính kèm hình ảnh]</i>`;
        
        html += `
        <tr>
            <td style="text-align:center; border: 1px solid #eee; padding: 8px;"><b>${qIdx++}</b></td>
            <td style="text-align:center; border: 1px solid #eee; padding: 8px; font-size: 9pt; line-height: 1.4;">
                <span style="color:#aaa; font-family: monospace;">${item._id}</span><br>
                <b style="color:#e83e8c;">${item.level || 'NB'}</b>
            </td>
            <td style="border: 1px solid #eee; padding: 8px;">${shortQ}</td>
            <td style="text-align:center; border: 1px solid #eee; padding: 8px; font-weight:bold; color:red;">${item.answer || '-'}</td>
            <td style="text-align:center; border: 1px solid #eee; padding: 8px;">
                <button onclick="app.openQuickEdit('${item._id}')" class="btn-tiny" style="background:#007bff; border-color:#007bff; margin-bottom:5px; width:100%; padding: 4px;">✏️ Sửa</button><br>
                <button onclick="app.rerollQuestion('${item._id}')" class="btn-tiny" style="background:#ffc107; color:black; border-color:#ffc107; width:100%; padding: 4px;">🔄 Đổi câu</button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
    document.getElementById('staging-modal').style.display = 'flex';
};

app.closeStagingModal = function() {
    document.getElementById('staging-modal').style.display = 'none';
};

// KHI BẤM CHỐT -> ĐẨY RA GIẤY THI VÀ XÀO ĐỀ
app.confirmStaging = function() {
    this.closeStagingModal();
    this.run(); 
};

// TÍNH NĂNG "ĐỔI CÂU KHÁC" (RE-ROLL)
app.rerollQuestion = function(id) {
    let index = this.workingData.findIndex(x => x._id === id);
    if (index === -1) return;
    
    let oldItem = this.workingData[index];
    let chap = oldItem.chapter || "Chương chung";
    let les = oldItem.lesson || "Bài chung";
    let typ = oldItem.type;
    let lvl = oldItem.level || 'NB';
    
    let pool = [];
    try { pool = this.catalog[chap][les][typ][lvl]; } catch(e) { }
    
    if (!pool || pool.length <= 1) {
        alert("⚠️ Kho đạn của Loại/Mức độ này đã cạn, không còn câu khác để đổi!"); return;
    }
    
    let currentIds = this.workingData.map(x => x._id);
    let availableQuestions = pool.filter(x => !currentIds.includes(x._id));
    
    if (availableQuestions.length === 0) {
        alert("⚠️ Tất cả câu hỏi trong Kho của mức độ này đã được bốc hết ra đề, không còn dự bị!"); return;
    }
    
    let randIdx = Math.floor(Math.random() * availableQuestions.length);
    let newItem = JSON.parse(JSON.stringify(availableQuestions[randIdx]));
    
    newItem._id = "q_reroll_" + Date.now() + "_" + randIdx;
    
    this.workingData[index] = newItem; 
    this.openStagingModal(); 
};
