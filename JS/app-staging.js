// ==========================================
// MODULE 5: TRẠM KIỂM DUYỆT (NÂNG CẤP KÉO THẢ & VÁ XSS)
// ==========================================

app.openStagingModal = function() {
    let tbody = document.getElementById('staging-tbody');
    tbody.innerHTML = '';
    let html = '';
    let qIdx = 1;

    // Duyệt qua workingData để tạo các hàng trong bảng
    this.workingData.forEach((item, index) => {
        if (item.type === 'section') {
            html += `
            <tr class="draggable-row" draggable="true" data-id="${item._id}">
                <td style="text-align:center;"><span class="drag-handle">⣿</span></td>
                <td colspan="4" style="background:#e9ecef; font-weight:bold; padding:8px; color: #007bff; cursor:default;">${app.clean(item.title)}</td>
            </tr>`;
            return;
        }
        
        let shortQ = item.question || item.content || item.title || "";
        if (shortQ.length > 150) shortQ = shortQ.substring(0, 150) + "...";
        shortQ = shortQ.replace(/\n/g, '<br>'); 
        
        // 🛡️ VÁ XSS: Rửa sạch nội dung câu hỏi trước khi in ra bảng
        shortQ = app.clean(shortQ); 
        
        if (item.image) shortQ += ` <br><i style="color:#28a745;">[🖼️ Có hình ảnh]</i>`;
        
        html += `
        <tr class="draggable-row" draggable="true" data-id="${item._id}">
            <td style="text-align:center; border: 1px solid #eee; padding: 8px;">
                <span class="drag-handle">⣿</span><br><b>${qIdx++}</b>
            </td>
            <td style="text-align:center; border: 1px solid #eee; padding: 8px; font-size: 9pt; line-height: 1.4;">
                <span style="color:#aaa; font-family: monospace;">${item._id}</span><br>
                <b style="color:#e83e8c;">${item.level || 'NB'}</b>
            </td>
            <td style="border: 1px solid #eee; padding: 8px;">${shortQ}</td>
            <td style="text-align:center; border: 1px solid #eee; padding: 8px; font-weight:bold; color:red;">${app.clean(item.answer || '-')}</td>
            <td style="text-align:center; border: 1px solid #eee; padding: 8px;">
                <button onclick="app.openQuickEdit('${item._id}')" class="btn-tiny" style="background:#007bff; border-color:#007bff; margin-bottom:5px; width:100%;">✏️ Sửa</button><br>
                <button onclick="app.rerollQuestion('${item._id}')" class="btn-tiny" style="background:#ffc107; color:black; border-color:#ffc107; width:100%;">🔄 Đổi câu</button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
    
    // Kích hoạt tính năng kéo thả ngay sau khi render xong
    this.initStagingDnD();
    
    document.getElementById('staging-modal').style.display = 'flex';
};

// --- LOGIC XỬ LÝ KÉO THẢ (Drag & Drop) ---
app.initStagingDnD = function() {
    const tbody = document.getElementById('staging-tbody');
    const rows = tbody.querySelectorAll('.draggable-row');

    rows.forEach(row => {
        // 1. Khi bắt đầu nắm kéo
        row.addEventListener('dragstart', (e) => {
            row.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        // 2. Khi đang kéo lướt qua các hàng khác
        row.addEventListener('dragover', (e) => {
            e.preventDefault(); // Cho phép thả
            const draggingRow = tbody.querySelector('.dragging');
            const targetRow = e.target.closest('.draggable-row');

            if (targetRow && targetRow !== draggingRow) {
                const rect = targetRow.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                tbody.insertBefore(draggingRow, next ? targetRow.nextSibling : targetRow);
            }
        });

        // 3. Khi thả chuột ra
        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            // Cập nhật lại mảng dữ liệu ngầm cho khớp với giao diện mới
            app.syncDataOrder();
        });
    });
};

// Hàm đồng bộ thứ tự từ Giao diện vào mảng workingData
app.syncDataOrder = function() {
    const tbody = document.getElementById('staging-tbody');
    const rows = tbody.querySelectorAll('.draggable-row');
    const newOrderedData = [];

    rows.forEach(row => {
        const id = row.getAttribute('data-id');
        const item = this.workingData.find(x => x._id === id);
        if (item) newOrderedData.push(item);
    });

    this.workingData = newOrderedData;
    
    // Đánh số lại câu hỏi (preprocess) nhưng không đóng Modal
    this.preprocess();
    
    // Cập nhật lại cột STT trên giao diện mà không cần render lại cả bảng (để tránh giật lag)
    let qIdx = 1;
    rows.forEach(row => {
        const sttCell = row.querySelector('td:first-child b');
        if (sttCell) {
            // Chỉ đánh số cho các hàng không phải là Section
            const id = row.getAttribute('data-id');
            const item = this.workingData.find(x => x._id === id);
            if (item && item.type !== 'section') {
                sttCell.innerText = qIdx++;
            }
        }
    });
};

app.closeStagingModal = function() {
    document.getElementById('staging-modal').style.display = 'none';
};

app.confirmStaging = function() {
    this.closeStagingModal();
    this.run(); 
};

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
        app.toast("Kho đạn cạn rồi, không còn câu khác cùng loại để đổi!", "warning"); return;
    }
    
    let currentIds = this.workingData.map(x => x._id);
    let availableQuestions = pool.filter(x => !currentIds.includes(x._id));
    
    if (availableQuestions.length === 0) {
        app.toast("Đã bốc hết sạch câu hỏi trong kho mức độ này rồi!", "warning"); return;
    }
    
    let randIdx = Math.floor(Math.random() * availableQuestions.length);
    let newItem = JSON.parse(JSON.stringify(availableQuestions[randIdx]));
    newItem._id = "q_reroll_" + Date.now() + "_" + randIdx;
    
    this.workingData[index] = newItem; 
    this.openStagingModal(); 
};