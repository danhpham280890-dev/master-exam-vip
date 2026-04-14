// ==========================================
// MODULE 2: MA TRẬN BỐC ĐỀ
// ==========================================
app.buildCatalog = function() {
    this.catalog = {};
    this.originalData.forEach(item => {
        if (item.type !== 'section' && item.type !== 'reading') {
            let chap = item.chapter || "Chương chung";
            let les = item.lesson || "Bài chung";
            let typ = item.type || "unknown";
            let lvl = item.level || 'NB';

            if (!this.catalog[chap]) this.catalog[chap] = {};
            if (!this.catalog[chap][les]) this.catalog[chap][les] = {};
            if (!this.catalog[chap][les][typ]) this.catalog[chap][les][typ] = { NB: [], TH: [], VD: [], VDC: [] };
            
            if (this.catalog[chap][les][typ][lvl]) {
                this.catalog[chap][les][typ][lvl].push(item);
            }
        }
    });
};

app.openMatrixModal = function() {
    let tbody = document.getElementById('matrix-tbody');
    tbody.innerHTML = '';
    let totalQ = 0;
    
    const typeNames = {
        'mcq': 'Trắc nghiệm (MCQ)', 'true-false': 'Đúng/Sai (TF)', 'matching': 'Nối cột (Match)',
        'cloze': 'Điền khuyết (Cloze)', 'fill-blank': 'Trả lời ngắn', 'essay': 'Tự luận (Đơn)', 'essay-multi': 'Tự luận (Nhiều ý)'
    };
    
    for (let chap in this.catalog) {
        tbody.innerHTML += `<tr style="background:#e9ecef;"><td colspan="5" style="text-align:left; font-weight:bold; color:#333; padding: 10px;">📖 ${chap}</td></tr>`;
        for (let les in this.catalog[chap]) {
            for (let typ in this.catalog[chap][les]) {
                let c = this.catalog[chap][les][typ];
                let sum = c.NB.length + c.TH.length + c.VD.length + c.VDC.length;
                if (sum === 0) continue; 
                totalQ += sum;
                
                let typeLabel = typeNames[typ] || typ;
                let rowTitle = `<b style="color:#007bff">${les}</b><br><small style="color:#666">👉 ${typeLabel}</small>`;
                
                let rowHTML = `
                    <tr>
                        <td style="text-align:left; padding-left: 25px; line-height: 1.4;">${rowTitle}</td>
                        <td><input type="number" class="mat-input" data-chap="${chap}" data-les="${les}" data-typ="${typ}" data-lvl="NB" min="0" max="${c.NB.length}" placeholder="/${c.NB.length}"></td>
                        <td><input type="number" class="mat-input" data-chap="${chap}" data-les="${les}" data-typ="${typ}" data-lvl="TH" min="0" max="${c.TH.length}" placeholder="/${c.TH.length}"></td>
                        <td><input type="number" class="mat-input" data-chap="${chap}" data-les="${les}" data-typ="${typ}" data-lvl="VD" min="0" max="${c.VD.length}" placeholder="/${c.VD.length}"></td>
                        <td><input type="number" class="mat-input" data-chap="${chap}" data-les="${les}" data-typ="${typ}" data-lvl="VDC" min="0" max="${c.VDC.length}" placeholder="/${c.VDC.length}"></td>
                    </tr>
                `;
                tbody.innerHTML += rowHTML;
            }
        }
    }
    document.getElementById('matrix-total-q').innerText = totalQ;
    document.getElementById('matrix-modal').style.display = 'flex';
};

app.closeMatrixModal = function() {
    document.getElementById('matrix-modal').style.display = 'none';
};

app.generateFromMatrix = function() {
    let selectedQuestions = [];
    let inputs = document.querySelectorAll('.mat-input');
    
    inputs.forEach(inputEl => {
        let val = parseInt(inputEl.value);
        if (val > 0) {
            let chap = inputEl.getAttribute('data-chap');
            let les = inputEl.getAttribute('data-les');
            let typ = inputEl.getAttribute('data-typ');
            let lvl = inputEl.getAttribute('data-lvl');
            
            let pool = [...this.catalog[chap][les][typ][lvl]];
            
            if (val > pool.length) {
                app.toast(`⚠️ CẢNH BÁO: Ở phần "${chap} - ${les} - ${lvl}", kho đạn chỉ có ${pool.length} câu!\n👉 Tự động bốc ${pool.length} câu.`, "warning");
                val = pool.length; 
                inputEl.value = val; 
            }
            
            for(let i = pool.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            selectedQuestions = selectedQuestions.concat(pool.slice(0, val));
        }
    });

    if (selectedQuestions.length === 0) { app.toast("⚠️ Bồ chưa nhập số lượng!", "warning"); return; }

    let typeMap = {
        'mcq': { title: 'TRẮC NGHIỆM ĐA LỰA CHỌN', items: [] },
        'true-false': { title: 'TRẮC NGHIỆM ĐÚNG SAI', items: [] },
        'matching': { title: 'NỐI CỘT', items: [] },
        'cloze': { title: 'ĐIỀN KHUYẾT', items: [] },
        'fill-blank': { title: 'TRẢ LỜI NGẮN', items: [] },
        'essay': { title: 'TỰ LUẬN', items: [] },
        'essay-multi': { title: 'TỰ LUẬN TỔNG HỢP', items: [] }
    };
    
    selectedQuestions.forEach(q => { if (typeMap[q.type]) typeMap[q.type].items.push(q); });
    
    let newExamData = [];
    let pIndex = 1;
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    
    Object.keys(typeMap).forEach(key => {
        if (typeMap[key].items.length > 0) {
            let defaultPts = typeMap[key].items[0].points || "";
            newExamData.push({ type: "section", title: `PHẦN ${roman[pIndex-1]}. ${typeMap[key].title}`, pointsPerQuestion: defaultPts });
            newExamData = newExamData.concat(typeMap[key].items);
            pIndex++;
        }
    });

    app.workingData = newExamData;
    EXAM.config.maDe = Math.floor(100 + Math.random() * 900).toString();
    
    // --- GỌI TRẠM KIỂM DUYỆT THAY VÌ IN NGAY ---
    app.preprocess(); 
    app.closeMatrixModal();
    app.openStagingModal(); 
};