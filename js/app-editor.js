// ==========================================
// MODULE: LIVE EDITOR VẠN NĂNG (ĐỌC ĐÚNG DATA EXCEL)
// ==========================================

app.openQuickEdit = function(id) {
    document.getElementById('edit-modal').dataset.editingId = id; 
    let item = this.workingData.find(x => x._id === id);
    if (!item) return;

    // 1. Nhét dữ liệu phần CHUNG
    let qText = item.question || item.content || item.title || "";
    document.getElementById('edit-q').value = qText;
    document.getElementById('edit-pts').value = item.points || item.pointsPerQuestion || "";
    document.getElementById('edit-ans').value = item.answer || ""; // Tự luận/Điền khuyết nhét vô đây

    let optArea = document.getElementById('edit-options-area');
    let tfArea = document.getElementById('edit-tf-area');       
    let complexArea = document.getElementById('edit-complex-area'); 
    let complexContainer = document.getElementById('complex-container');

    // Ẩn tất cả đi, lát cần cái nào hiện cái đó
    if (optArea) optArea.style.display = 'none';
    if (tfArea) tfArea.style.display = 'none';
    if (complexArea) complexArea.style.display = 'none';
    if (complexContainer) complexContainer.innerHTML = ''; 

    // 2. Nhét dữ liệu TRẮC NGHIỆM
    if (item.type === 'mcq' && item.options) {
        if (optArea) {
            optArea.style.display = 'block';
            document.getElementById('edit-opt-0').value = item.options[0] || "";
            document.getElementById('edit-opt-1').value = item.options[1] || "";
            document.getElementById('edit-opt-2').value = item.options[2] || "";
            document.getElementById('edit-opt-3').value = item.options[3] || "";
        }
    } 
    // 3. Nhét dữ liệu ĐÚNG/SAI
    else if (item.type === 'true-false' && item.statements) {
        if (tfArea) {
            tfArea.style.display = 'block';
            for(let i=0; i<4; i++) {
                let st = item.statements[i] || {text: "", ans: "Đ"};
                let cleanText = st.text.replace(/^[a-d]\)\s*/i, ''); 
                document.getElementById('edit-tf-txt-' + i).value = cleanText;
                document.getElementById('edit-tf-ans-' + i).value = st.ans || "Đ";
            }
        }
    }
    // 4. Nhét dữ liệu ĐÁM PHỨC TẠP
    else if (complexArea && complexContainer) {
        let html = '';
        
        // [MỚI] TỰ LUẬN ĐƠN (Essay / Drawing) -> Có chỉnh số dòng & loại giấy
        if (item.type === 'essay' || item.type === 'drawing') {
            complexArea.style.display = 'block';
            let pStyle = item.paperStyle || 'line';
            html += `
            <div class="form-group" style="display:flex; gap:15px; align-items:center; margin-bottom: 10px; background: #e0f7fa; padding: 10px; border-radius: 5px;">
                <label style="color:#007bff; font-weight:bold; margin:0;">Loại giấy in:</label>
                <select id="complex-essay-style" style="padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 13px;">
                    <option value="line" ${pStyle==='line'?'selected':''}>Dòng kẻ</option>
                    <option value="grid" ${pStyle==='grid'?'selected':''}>Ô ly</option>
                    <option value="blank" ${pStyle==='blank'?'selected':''}>Giấy trắng</option>
                </select>
                <label style="color:#e83e8c; font-weight:bold; margin:0; margin-left: 10px;">Số dòng (Độ cao):</label>
                <input type="number" id="complex-essay-lines" value="${item.lines || 5}" min="1" style="width:70px; padding: 6px; text-align:center; border-radius: 4px; border: 1px solid #ccc; font-size: 13px;">
                <span style="font-size:11px; color:#666; font-style:italic;">(Tăng/giảm để ép trang in)</span>
            </div>`;
        }
        // A. TỰ LUẬN NHIỀU Ý (Essay-multi) -> Có các ý phụ (sub-essay)
        else if (item.type === 'essay-multi' && item.subQuestions) {
            complexArea.style.display = 'block';
            item.subQuestions.forEach((sub, idx) => {
                let pStyle = sub.paperStyle || 'line';
                html += `
                <div style="margin-bottom:10px; border-bottom:1px dashed #ffeeba; padding-bottom:10px;">
                    <div class="form-group" style="margin-bottom: 8px;"><label style="color:#007bff">Nội dung ý phụ ${idx+1}</label><input type="text" id="complex-em-q-${idx}" value="${sub.text || ""}"></div>
                    <div class="form-group" style="display:flex; gap:10px; align-items:center; margin-bottom: 8px; background: #e0f7fa; padding: 5px 10px; border-radius: 4px;">
                        <label style="color:#666; font-size:12px; font-weight:bold;">Loại giấy:</label>
                        <select id="complex-em-style-${idx}" style="padding: 4px; border-radius: 3px; border: 1px solid #ccc; font-size:12px;">
                            <option value="line" ${pStyle==='line'?'selected':''}>Dòng kẻ</option>
                            <option value="grid" ${pStyle==='grid'?'selected':''}>Ô ly</option>
                            <option value="blank" ${pStyle==='blank'?'selected':''}>Trắng</option>
                        </select>
                        <label style="color:#666; font-size:12px; margin-left:10px; font-weight:bold;">Số dòng:</label>
                        <input type="number" id="complex-em-lines-${idx}" value="${sub.lines || 3}" min="1" style="width:60px; text-align:center; padding: 4px; font-size:12px; border: 1px solid #ccc;">
                    </div>
                    <div class="form-group"><label style="color:#28a745">Đáp án ý ${idx+1}</label><textarea id="complex-em-a-${idx}" style="height:50px;">${sub.answer || ""}</textarea></div>
                </div>`;
            });
        }
        
        // B. ĐIỀN KHUYẾT NGẮN (Fill-blank)
        else if (item.type === 'fill-blank' && item.items) {
            complexArea.style.display = 'block';
            item.items.forEach((it, idx) => {
                html += `<div class="form-group"><label>Nội dung Ý ${idx+1}</label><input type="text" id="complex-fb-i-${idx}" value="${it || ""}"></div>`;
            });
            html += `<div style="font-size:11px; color:#6c757d;"><i>💡 Đáp án của câu Điền khuyết này bồ sửa ở ô "Đáp án đúng" phía dưới cùng nhé.</i></div>`;
        }
        
        // C. NỐI CỘT (Matching)
        else if (item.type === 'matching') {
            complexArea.style.display = 'block';
            html += `<table style="width:100%; font-size:12px; border-collapse:collapse;">
                    <thead><tr style="background:#eee"><th>STT</th><th>Vế Trái (Cột A)</th><th>Vế Phải (Cột B)</th></tr></thead><tbody>`;
            let maxRows = Math.max((item.colA || []).length, (item.colB || []).length);
            for(let i=0; i<maxRows; i++) {
                let aVal = (item.colA && item.colA[i]) ? item.colA[i] : "";
                let bVal = (item.colB && item.colB[i]) ? item.colB[i] : "";
                html += `<tr><td style="text-align:center">${i+1}</td>
                    <td><input type="text" id="complex-match-a-${i}" value="${aVal}" style="width:95%"></td>
                    <td><input type="text" id="complex-match-b-${i}" value="${bVal}" style="width:95%"></td>
                    </tr>`;
            }
            html += `</tbody></table><div style="font-size:11px; color:#6c757d; margin-top:8px;"><i>💡 Hệ thống sẽ tự động bắt cặp các hàng ngang với nhau (Trái 1 nối Phải 1).</i></div>`;
        }

        // D. ĐOẠN VĂN ĐỤC LỖ (Cloze)
        else if (item.type === 'cloze' && item.questions) {
            complexArea.style.display = 'block';
            html += `<div style="font-size:11px; color:red; margin-bottom:10px;"><i>⚠️ Ô Câu hỏi phía trên là Đoạn văn gốc. Dưới đây là các chỗ đục lỗ:</i></div>`;
            item.questions.forEach((cq, idx) => {
                let o0 = (cq.options && cq.options[0]) ? cq.options[0] : "";
                let o1 = (cq.options && cq.options[1]) ? cq.options[1] : "";
                let o2 = (cq.options && cq.options[2]) ? cq.options[2] : "";
                let o3 = (cq.options && cq.options[3]) ? cq.options[3] : "";
                html += `
                <div style="margin-bottom:10px; border-bottom:1px dashed #ffeeba; padding-bottom:10px;">
                    <div style="display:flex; gap:10px; margin-bottom:5px;">
                        <input type="text" id="complex-cloze-q-${idx}" value="${cq.question || ""}" style="width:40%" placeholder="Tiêu đề (VD: Chỗ trống 1)">
                        <input type="text" id="complex-cloze-ans-${idx}" value="${cq.answer || ""}" style="width:20%; color:red; font-weight:bold; text-align:center;" placeholder="Đ/A (VD: A)">
                    </div>
                    <div style="display:flex; gap:5px;">
                        <input type="text" id="complex-cloze-opt-${idx}-0" value="${o0}" placeholder="A">
                        <input type="text" id="complex-cloze-opt-${idx}-1" value="${o1}" placeholder="B">
                        <input type="text" id="complex-cloze-opt-${idx}-2" value="${o2}" placeholder="C">
                        <input type="text" id="complex-cloze-opt-${idx}-3" value="${o3}" placeholder="D">
                    </div>
                </div>`;
            });
        }

        complexContainer.innerHTML = html;
    }

    document.getElementById('math-guide').style.display = 'none';
    document.getElementById('edit-modal').style.display = 'flex';
    this.updatePreview(); 
};

app.toggleGuide = function() {
    let guide = document.getElementById('math-guide');
    guide.style.display = (guide.style.display === 'none') ? 'block' : 'none';
};

app.insertMath = function(mathTag) {
    let textarea = document.getElementById('edit-q');
    let startPos = textarea.selectionStart;
    let endPos = textarea.selectionEnd;
    let text = textarea.value;
    textarea.value = text.substring(0, startPos) + mathTag + text.substring(endPos, text.length);
    textarea.focus();
    let newCursorPos = startPos + mathTag.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    this.updatePreview();
};

app.updatePreview = function() {
    let qText = document.getElementById('edit-q').value || "";
    qText = qText.replace(/\n/g, "<br>");
    let previewHTML = `<div style="margin-bottom: 10px;"><b>Câu hỏi:</b> ${qText}</div>`;
    
    let optArea = document.getElementById('edit-options-area');
    let tfArea = document.getElementById('edit-tf-area');

    if (optArea && optArea.style.display !== 'none') {
        let o0 = document.getElementById('edit-opt-0').value || "";
        let o1 = document.getElementById('edit-opt-1').value || "";
        let o2 = document.getElementById('edit-opt-2').value || "";
        let o3 = document.getElementById('edit-opt-3').value || "";
        previewHTML += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div><b>A.</b> ${o0}</div><div><b>B.</b> ${o1}</div><div><b>C.</b> ${o2}</div><div><b>D.</b> ${o3}</div></div>`;
    }

    if (tfArea && tfArea.style.display !== 'none') {
        previewHTML += `<table border="1" style="width:100%; border-collapse:collapse; margin-top:10px; text-align:center;">
            <tr style="background:#eee"><th>Phát biểu</th><th style="width:50px">Đ/S</th></tr>`;
        for(let i=0; i<4; i++) {
            let txt = document.getElementById('edit-tf-txt-' + i).value || "";
            let ans = document.getElementById('edit-tf-ans-' + i).value || "Đ";
            let ansColor = ans === 'Đ' ? 'green' : 'red';
            previewHTML += `<tr><td style="text-align:left; padding:5px;"><b>${['a','b','c','d'][i]})</b> ${txt}</td><td><b style="color:${ansColor}">${ans}</b></td></tr>`;
        }
        previewHTML += `</table>`;
    }

    let previewBox = document.getElementById('edit-preview');
    previewBox.innerHTML = previewHTML;
    if (window.renderMathInElement) {
        renderMathInElement(previewBox, {
            delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}],
            throwOnError: false
        });
    }
};

app.saveQuickEdit = function() {
    let id = document.getElementById('edit-modal').dataset.editingId;
    if (!id) return;
    let item = this.workingData.find(x => x._id === id);
    if (!item) return;

    // 1. Lấy dữ liệu chung
    let newQ = document.getElementById('edit-q').value;
    if (item.question !== undefined) item.question = newQ;
    if (item.content !== undefined) item.content = newQ;
    if (item.title !== undefined) item.title = newQ; 
    
    item.points = document.getElementById('edit-pts').value;
    item.answer = document.getElementById('edit-ans').value; 

    // 2. Lấy dữ liệu Trắc nghiệm
    if (item.type === 'mcq' && item.options) {
        item.options[0] = document.getElementById('edit-opt-0').value;
        item.options[1] = document.getElementById('edit-opt-1').value;
        item.options[2] = document.getElementById('edit-opt-2').value;
        item.options[3] = document.getElementById('edit-opt-3').value;
    } 
    // 3. Lấy dữ liệu Đúng/Sai
    else if (item.type === 'true-false' && item.statements) {
        for(let i=0; i<4; i++) {
            let txt = document.getElementById('edit-tf-txt-' + i).value;
            let ans = document.getElementById('edit-tf-ans-' + i).value;
            if(item.statements[i]) {
                item.statements[i].text = ['a', 'b', 'c', 'd'][i] + ') ' + txt; 
                item.statements[i].ans = ans;
            }
        }
    }
    // 4. Lấy dữ liệu Đám phức tạp
    else if (item.type === 'essay' || item.type === 'drawing') {
        let styleVal = document.getElementById('complex-essay-style');
        let linesVal = document.getElementById('complex-essay-lines');
        if (styleVal) item.paperStyle = styleVal.value;
        if (linesVal) item.lines = parseInt(linesVal.value) || 5;
    }
    else if (item.type === 'essay-multi' && item.subQuestions) {
        item.subQuestions.forEach((sub, idx) => {
            sub.text = document.getElementById('complex-em-q-' + idx).value;
            sub.answer = document.getElementById('complex-em-a-' + idx).value;
            let sStyle = document.getElementById('complex-em-style-' + idx);
            let sLines = document.getElementById('complex-em-lines-' + idx);
            if (sStyle) sub.paperStyle = sStyle.value;
            if (sLines) sub.lines = parseInt(sLines.value) || 3;
        });
    }
    else if (item.type === 'fill-blank' && item.items) {
        item.items.forEach((_, idx) => {
            item.items[idx] = document.getElementById('complex-fb-i-' + idx).value;
        });
    }
    else if (item.type === 'matching' && item.colA && item.colB) {
        let maxRows = Math.max((item.colA || []).length, (item.colB || []).length);
        for(let i=0; i<maxRows; i++) {
            item.colA[i] = document.getElementById('complex-match-a-' + i).value;
            item.colB[i] = document.getElementById('complex-match-b-' + i).value;
        }
    }
    else if (item.type === 'cloze' && item.questions) {
        item.questions.forEach((cq, idx) => {
            cq.question = document.getElementById('complex-cloze-q-' + idx).value;
            cq.answer = document.getElementById('complex-cloze-ans-' + idx).value;
            if(cq.options) {
                cq.options[0] = document.getElementById('complex-cloze-opt-' + idx + '-0').value;
                cq.options[1] = document.getElementById('complex-cloze-opt-' + idx + '-1').value;
                cq.options[2] = document.getElementById('complex-cloze-opt-' + idx + '-2').value;
                cq.options[3] = document.getElementById('complex-cloze-opt-' + idx + '-3').value;
            }
        });
    }

    document.getElementById('edit-modal').style.display = 'none';
    
    let stagingModal = document.getElementById('staging-modal');
    if (stagingModal && stagingModal.style.display !== 'none') {
        this.openStagingModal(); 
    } else {
        this.run(); 
    }
};
