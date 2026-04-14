// ==========================================
// MODULE 3: RENDER GIAO DIỆN & IN ẤN (V5.6 HỖ TRỢ ĐỒNG BỘ 4 ẢNH ĐÁP ÁN + VÁ LỖ HỔNG XSS)
// ==========================================

app.updateUI = function() {
    let btn = document.getElementById('btn-mode');
    btn.innerHTML = (EXAM.config.mode === 'key') ? "👁️ ĐÁP ÁN" : "👁️ ĐỀ THI";
    btn.style.backgroundColor = (EXAM.config.mode === 'key') ? "#dc3545" : "#007bff";
    if (EXAM.config.inTrangDen) document.body.classList.add('print-grayscale');
    else document.body.classList.remove('print-grayscale');
    document.getElementById('ui-font').innerText = EXAM.config.fontSize;
    document.getElementById('ui-lh').innerText = EXAM.config.lineHeight;
};

app.changeFont = function(delta) { EXAM.config.fontSize += delta; this.updateUI(); this.autoFit(); };
app.changeLineHeight = function(delta) { EXAM.config.lineHeight = parseFloat((EXAM.config.lineHeight + delta).toFixed(2)); this.updateUI(); this.autoFit(); };
app.getTextLength = function(htmlString) { let tmp = document.createElement('div'); tmp.innerHTML = htmlString || ''; return tmp.textContent.trim().length; };

app.autoFit = function() {
    document.documentElement.style.setProperty('--font-family', EXAM.config.fontFamily || '"Times New Roman"');
    document.documentElement.style.setProperty('--line-height', EXAM.config.lineHeight || 1.15); 
    this.renderDOM(EXAM.config.fontSize || 14, 6);
};

app.renderDOM = function(fontSize, marginBottom) {
    document.documentElement.style.setProperty('--main-font-size', fontSize + 'pt');
    document.documentElement.style.setProperty('--q-margin-bottom', marginBottom + 'px');
    
    const paper = document.getElementById('exam-paper'); 
    paper.innerHTML = ''; 
    this.masterKeys = {}; 
    
    this.examVersions.forEach((version, vIndex) => {
        this.pageCount = 0; 
        this.ansMCQ = []; this.ansTF = []; this.ansEssay = [];
        let currentPage = this.createNewPage(paper, version.maDe);
        
        version.data.forEach(item => {
            const el = this.createEl(item);
            if (window.renderMathInElement) renderMathInElement(el, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}], throwOnError: false });
            currentPage.contentElement.appendChild(el);
            
            if (currentPage.pageElement.scrollHeight > currentPage.pageElement.offsetHeight) {
                currentPage.contentElement.removeChild(el); 
                currentPage = this.createNewPage(paper, version.maDe); 
                currentPage.contentElement.appendChild(el);
            }
        });
        
        let allPages = paper.querySelectorAll(`.page-container[data-made="${version.maDe}"]`);
        allPages.forEach((pageContainer, index) => {
            const footer = document.createElement('div'); footer.className = 'page-footer';
            footer.innerHTML = `<span>${app.clean(EXAM.config.footerText)}</span><span>Trang ${index + 1}/${allPages.length} - Mã đề: <b>${version.maDe}</b></span>`;
            pageContainer.appendChild(footer);
        });

        if (vIndex < this.examVersions.length - 1) {
            let splitMarker = document.createElement('div'); splitMarker.className = "end-marker no-print"; 
            splitMarker.innerHTML = `✂️ --- HẾT MÃ ĐỀ ${version.maDe} --- ✂️`;
            paper.appendChild(splitMarker);
        }
        this.masterKeys[version.maDe] = { mcq: this.ansMCQ, tf: this.ansTF, essay: this.ansEssay };
    });

    if (EXAM.config.mode === 'key') {
        let keyTitle = document.createElement('div'); keyTitle.className = "end-marker no-print"; 
        keyTitle.innerHTML = `🌟 --- KHU VỰC ĐÁP ÁN DÀNH CHO GIÁO VIÊN --- 🌟`;
        paper.appendChild(keyTitle);
        this.renderMasterSummary(paper);
    }
    
    // Kích hoạt tính năng kéo tay
    this.initImageResizing();
};

app.img = function(d) {
    if (!d.image) return { h: '', r: false };
    
    let w = d.imageWidth ? String(d.imageWidth).trim() : '';
    if (w && !w.includes('px') && !w.includes('cm') && !w.includes('%')) w += 'cm'; 
    
    let wrapStyle = w ? `width: ${w};` : 'max-width: 100%;';
    let imgStyle = w ? `width: 100%; max-width: 100%;` : 'max-width: 100%;';
    if (d.imageHeight) imgStyle += `height: ${d.imageHeight};`; 

    let caption = d.imageCaption ? `<div class="img-caption">${app.clean(d.imageCaption)}</div>` : '';
    let wrapClass = d.imageLayout === 'right' ? 'img-right-wrap' : 'img-stacked-wrap';
    
    let html = `<div class="${wrapClass}" style="${wrapStyle}">
        <div class="img-resizable-wrapper" data-qid="${d._id}">
            <img src="${d.image}" class="img-fluid editable-img" style="${imgStyle}">
            ${caption}
            <div class="img-resize-handle resizer-br"></div>
            <div class="resize-dim-badge">0 x 0</div>
        </div>
    </div>`;
    
    return { h: html, r: (d.imageLayout === 'right') };
};

app.createEl = function(data) {
    const wrap = document.createElement('div');
    wrap.className = 'q-wrap';
    
    wrap.setAttribute('ondblclick', 'app.openQuickEdit("' + data._id + '")');
    wrap.style.cursor = "pointer";
    wrap.title = "✏️ Nhấp đúp chuột để sửa nội dung";

    if (data.type === 'reading' || data.type === 'cloze') wrap.style.pageBreakInside = 'auto';

    let isKey = (EXAM.config.mode === 'key');
    // BỌC DOMPURIFY CHO NỘI DUNG CÂU HỎI
    let qTitle = app.clean(data.question || ""); 
    
    if (EXAM.config.autoNumbering && data._qIdx) {
        let ptsText = data.points ? ` (${app.clean(data.points)})` : '';
        qTitle = `<b>Câu ${data._qIdx}${ptsText}:</b> ${String(qTitle).replace(/^Câu\s+\d+.*:\s*/i, '')}`;
    } else if (data._qIdx) {
        qTitle = String(qTitle).replace(/^(Câu\s+\d+.*:)\s*/i, '<b>$1</b> ');
    }

    if (data.type === "section") {
        let html = `<div class="q-block" style="font-weight: bold; font-size: 110%; text-transform: uppercase; border-bottom: 1.5px solid #333; padding-bottom: 2px; margin-top: 8px; margin-bottom: 2px;">${app.clean(data.title)}</div>`;
        if (!isKey && data.showMCQTable && data._count > 0) {
            let total = data._count; let cols = total <= 16 ? total : Math.ceil(total / 2); if (total > 24) cols = Math.ceil(total / 3); 
            let rows = Math.ceil(total / cols);
            for (let r = 0; r < rows; r++) {
                let hRow = '', bRow = '';
                for (let c = 0; c < cols; c++) {
                    let idx = r * cols + c;
                    if (idx < total) { hRow += `<th>${data._start + idx}</th>`; bRow += `<td></td>`; } 
                    else { hRow += `<th></th>`; bRow += `<td></td>`; }
                }
                html += `<table class="student-table"><tr><th style="width:45px">Câu</th>${hRow}</tr><tr><th>TL</th>${bRow}</tr></table>`;
            }
        }
        wrap.innerHTML = html;
    } 
    else if (data.type === "mcq") {
        if (data.answer) this.ansMCQ.push({ q: data._qIdx, a: app.clean(data.answer) }); 
        let img = this.img(data);
        const isImg = (text) => typeof text === 'string' && (/\.(png|jpe?g|gif|svg|webp)$/i.test(text.trim()) || text.includes('drive.google.com/thumbnail') || text.includes('drive.google.com/uc'));
        let hasImageOption = (data.options || []).some(opt => isImg(opt));

        let gridClass = hasImageOption ? 'grid-2' : (data.columns == 1 ? 'grid-1' : (data.columns == 2 ? 'grid-2' : 'grid-4'));
        if (!hasImageOption && !data.columns) {
            let maxLen = 0; (data.options || []).forEach(o => { let l = app.getTextLength(o); if(l > maxLen) maxLen = l; });
            if (maxLen > 40) gridClass = 'grid-1'; else if (maxLen > 12) gridClass = 'grid-2';
        }

        let optH = app.clean(data.optImgHeight || "150px"); 
        
        let optsHTML = (data.options || []).map((opt, i) => {
            let charOpt = String.fromCharCode(65 + i);
            let isCorrectClass = (isKey && data.answer === charOpt) ? 'correct-answer' : '';
            let rawOpt = String(opt).replace(/^[A-D]\.\s*/, '').trim();
            
            // BỌC DOMPURIFY CHO ĐÁP ÁN TRẮC NGHIỆM
            let contentHTML = isImg(rawOpt) ? `
                <div style="margin-top: 5px; display: inline-block; width: auto;" class="img-resizable-wrapper opt-resizable" data-qid="${d._id}">
                    <img src="${rawOpt}" style="max-width: 100%; height: ${optH}; object-fit: contain; display: block;">
                    <div class="img-resize-handle resizer-br"></div>
                    <div class="resize-dim-badge">0px</div>
                </div>` : ` ${app.clean(rawOpt)}`;
                
            return `<div class="${isCorrectClass}"><b>${charOpt}.</b>${contentHTML}</div>`;
        }).join('');
        wrap.innerHTML = `${img.r ? img.h : ''}<div class="q-block">${qTitle}</div>${!img.r ? img.h : ''}<div class="mcq-grid ${gridClass}">${optsHTML}</div>`;
    }
    else if (data.type === "true-false") {
        if (isKey) this.ansTF.push({ q: data._qIdx, s: data.statements });
        let img = this.img(data);
        const isImg = (text) => typeof text === 'string' && (/\.(png|jpe?g|gif|svg|webp)$/i.test(text.trim()) || text.includes('drive.google.com/thumbnail') || text.includes('drive.google.com/uc'));
        let rows = (data.statements || []).map(s => {
            let rawTxt = s.text.replace(/^[a-e]\)\s*/, '').trim();
            // BỌC DOMPURIFY CHO CÂU ĐÚNG SAI
            let contentHTML = isImg(rawTxt) ? `<img src="${rawTxt}" style="max-height: 100px; object-fit: contain;">` : app.clean(rawTxt);
            let d = (isKey && s.ans === "Đ") ? '<b style="color:red">Đ</b>' : '';
            let sa = (isKey && s.ans === "S") ? '<b style="color:red">S</b>' : '';
            return `<tr><td style="text-align:left; padding: 6px 10px;"><b>${s.text.charAt(0)})</b> ${contentHTML}</td><td style="padding: 6px 0;">${d}</td><td style="padding: 6px 0;">${sa}</td></tr>`;
        }).join('');
        wrap.innerHTML = `${img.r ? img.h : ''}<div class="q-block">${qTitle}</div>${!img.r ? img.h : ''}<table border="1" style="border-collapse: collapse; width: 100%; text-align:center; margin-top: 8px; margin-bottom: 0px;"><tr><th style="padding: 6px 0; background-color: #f9f9f9;">Phát biểu</th><th style="width:60px; padding: 6px 0; background-color: #f9f9f9;">Đúng</th><th style="width:60px; padding: 6px 0; background-color: #f9f9f9;">Sai</th></tr>${rows}</table>`;
    }
    else if (data.type === "cloze") {
        let img = this.img(data); 
        // BỌC DOMPURIFY CHO ĐOẠN VĂN ĐỤC LỖ
        let clozeHTML = `${img.r ? img.h : ''}<div class="q-reading">${app.clean(data.content)}</div>${!img.r ? img.h : ''}`;
        (data.questions || []).forEach((q, qidx) => {
            if (q.answer) this.ansMCQ.push({ q: `${data._qIdx}.${qidx + 1}`, a: app.clean(q.answer) });
            let gridClass = 'grid-4'; let maxLen = 0;
            (q.options || []).forEach(o => { let l = app.getTextLength(o); if(l > maxLen) maxLen = l; });
            if (maxLen > 25) gridClass = 'grid-1'; else if (maxLen > 12) gridClass = 'grid-2';
            let optsHTML = (q.options || []).map((opt, i) => {
                let charOpt = String.fromCharCode(65 + i);
                let isCorrectClass = (isKey && q.answer === charOpt) ? 'correct-answer' : '';
                let cleanOpt = app.clean(String(opt).replace(/^[A-D]\.\s*/, '')); // Lọc đáp án
                return `<div class="${isCorrectClass}"><b>${charOpt}.</b> ${cleanOpt}</div>`;
            }).join('');
            clozeHTML += `<div style="margin-top:10px"><b>${app.clean(q.question)}</b></div><div class="mcq-grid ${gridClass}">${optsHTML}</div>`; // Lọc câu hỏi phụ
        });
        wrap.innerHTML = `<div class="q-block">${qTitle}</div>${clozeHTML}`;
    }
    else if (data.type === "matching") {
        if (isKey) this.ansEssay.push({ q: data._qIdx, a: "Giáo viên xem bảng nối cột ở đề." });
        let img = this.img(data); 
        const isImg = (text) => typeof text === 'string' && (/\.(png|jpe?g|gif|svg|webp)$/i.test(text.trim()) || text.includes('drive.google.com/thumbnail') || text.includes('drive.google.com/uc'));
        let rowCount = Math.max((data.colA || []).length, (data.colB || []).length); let trs = '';
        for (let i = 0; i < rowCount; i++) {
            let aTxt = data.colA[i] || ""; let bTxt = data.colB[i] || "";
            // BỌC DOMPURIFY CHO CÁC CỘT
            let aHTML = isImg(aTxt) ? `<img src="${aTxt}" style="max-height: 80px;">` : app.clean(aTxt); 
            let bHTML = isImg(bTxt) ? `<img src="${bTxt}" style="max-height: 80px;">` : app.clean(bTxt);
            let lblB = bTxt ? `<b>${String.fromCharCode(65 + i)}.</b> ` : "";
            trs += `<tr><td style="width: 48%; padding: 4px 0; border: none; vertical-align: middle;"><b>${i + 1}.</b> ${aHTML}</td><td style="width: 4%; border:none"></td><td style="width: 48%; padding: 4px 0; border: none; vertical-align: middle;">${lblB}${bHTML}</td></tr>`;
        }
        let slots = (data.colA || []).map((_, idx) => `<b>${idx + 1} - ....</b>`).join(' &nbsp;&nbsp; ');
        wrap.innerHTML = `${img.r ? img.h : ''}<div class="q-block">${qTitle}</div>${!img.r ? img.h : ''}<table style="width: 100%; border-collapse: collapse;">${trs}</table><div style="margin-top: 10px;"><i>Đáp án:</i> &nbsp; ${slots}</div>`;
    }
    else if (data.type === "fill-blank") {
        if (isKey) this.ansEssay.push({ q: data._qIdx, a: app.clean(data.answer) });
        let img = this.img(data); 
        const isImg = (text) => typeof text === 'string' && (/\.(png|jpe?g|gif|svg|webp)$/i.test(text.trim()) || text.includes('drive.google.com/thumbnail') || text.includes('drive.google.com/uc'));
        let ansHTML = isKey ? `<div class="answer-box"><b>Đáp án:</b><br>${isImg(data.answer) ? `<img src="${data.answer}" style="max-height:100px">` : app.clean(data.answer)}</div>` : '';
        // BỌC DOMPURIFY CHO CÁC Ý ĐIỀN KHUYẾT
        let itemsHTML = (data.items || []).map(it => `<div style="margin-top: 8px;">${app.clean(it)}</div><div class="essay-wrapper"><div class="first-line"></div></div>`).join('');
        wrap.innerHTML = `${img.r ? img.h : ''}<div class="q-block">${qTitle}</div>${!img.r ? img.h : ''}${itemsHTML}${ansHTML}`;
    }
    else if (data.type === "essay" || data.type === "drawing") {
        if (isKey) this.ansEssay.push({ q: data._qIdx, a: app.clean(data.answer) });
        let img = this.img(data); 
        const isImg = (text) => typeof text === 'string' && (/\.(png|jpe?g|gif|svg|webp)$/i.test(text.trim()) || text.includes('drive.google.com/thumbnail') || text.includes('drive.google.com/uc'));
        let pStyle = data.paperStyle || "line";
        let numLines = data.lines || 5;
        let workspaceHTML = "";
        
        if (isKey) { 
            // BỌC DOMPURIFY CHO ĐÁP ÁN TỰ LUẬN
            workspaceHTML = `<div class="answer-box"><b>Đáp án:</b><br>${isImg(data.answer) ? `<img src="${data.answer}" style="max-width:100%">` : app.clean(data.answer || "(Chưa có)") }</div>`; 
        } 
        else {
            if (pStyle === "line") { 
                let linesHTML = ""; 
                for (let i = 1; i < numLines; i++) linesHTML += `<div class="essay-line"></div>`; 
                workspaceHTML = `<div class="essay-wrapper"><div class="first-line"><div class="first-line-label">Bài làm:</div></div>${linesHTML}</div>`; 
            } 
            else if (pStyle === "grid") { 
                workspaceHTML = `<div class="paper-grid" style="min-height: calc(var(--line-spacing) * ${numLines});"></div>`; 
            } 
            else { 
                workspaceHTML = `<div class="paper-blank" style="min-height: calc(var(--line-spacing) * ${numLines});"><div class="blank-hint">Bài làm</div></div>`; 
            }
        }
        wrap.innerHTML = `${img.r ? img.h : ''}<div class="q-block">${qTitle}</div>${!img.r ? img.h : ''}${workspaceHTML}`;
    }
    else if (data.type === "essay-multi") {
        let img = this.img(data); 
        const isImg = (text) => typeof text === 'string' && (/\.(png|jpe?g|gif|svg|webp)$/i.test(text.trim()) || text.includes('drive.google.com/thumbnail') || text.includes('drive.google.com/uc'));
        let html = `${img.r ? img.h : ''}<div class="q-block">${qTitle}</div>${!img.r ? img.h : ''}`;
        (data.subQuestions || []).forEach(sub => {
            let subQNum = app.clean(sub.text.split(')')[0] + ')');
            if (isKey) this.ansEssay.push({ q: subQNum, a: app.clean(sub.answer), parent: data._qIdx });
            html += `<div style="margin-top:8px"><b>${app.clean(sub.text)}</b></div>`; // Lọc ý phụ
            if (isKey) { 
                html += `<div class="answer-box"><b>Đáp án:</b><br>${isImg(sub.answer) ? `<img src="${sub.answer}" style="max-width:100%">` : app.clean(sub.answer || "(Chưa có)")}</div>`; 
            } 
            else {
                let pStyle = sub.paperStyle || "line";
                let numLines = sub.lines || 3;
                if (pStyle === "line") { 
                    let linesHTML = ""; 
                    for (let i = 1; i < numLines; i++) linesHTML += `<div class="essay-line"></div>`; 
                    html += `<div class="essay-wrapper"><div class="first-line"><div class="first-line-label">Bài làm:</div></div>${linesHTML}</div>`; 
                } 
                else if (pStyle === "grid") { 
                    html += `<div class="paper-grid" style="min-height: calc(var(--line-spacing) * ${numLines});"></div>`; 
                } 
                else { 
                    html += `<div class="paper-blank" style="min-height: calc(var(--line-spacing) * ${numLines});"><div class="blank-hint">Bài làm</div></div>`; 
                }
            }
        });
        wrap.innerHTML = html;
    }
    // BỌC DOMPURIFY CHO ĐOẠN VĂN READING
    else if (data.type === "reading") { wrap.innerHTML = `<div class="q-reading">${app.clean(data.content)}</div>`; }
    return wrap;
};

app.renderMasterSummary = function(paper) {
    let pageDiv = document.createElement('div'); 
    pageDiv.className = 'page-container';
    pageDiv.style.height = 'auto'; // Cho phép dài tự do, ko bị cắt lẹm
    pageDiv.style.pageBreakBefore = 'always'; // Ép ngắt trang, luôn nằm trang mới

    let contentArea = document.createElement('div'); 
    contentArea.className = 'content-area';

    let html = `<div class="summary-title" style="text-align:center; font-size:18pt; font-weight:bold; margin-bottom: 20px; color: #d32f2f; text-transform: uppercase;">BẢNG TỔNG HỢP ĐÁP ÁN CHI TIẾT</div>`;

    let codes = this.examVersions.map(v => v.maDe);

    codes.forEach(code => {
        let keys = this.masterKeys[code];

        html += `<div style="font-size: 14pt; font-weight: bold; background: #d32f2f; color: white; padding: 8px 15px; margin-top: 30px; margin-bottom: 15px; border-radius: 4px;">🎯 ĐÁP ÁN MÃ ĐỀ: ${app.clean(code)}</div>`;

        // ==========================================
        // PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN (Bảng ngang)
        // ==========================================
        if (keys.mcq && keys.mcq.length > 0) {
            html += `<div style="font-weight:bold; font-size: 12pt; margin-bottom: 8px;">PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN</div>`;
            // Cắt 20 câu 1 bảng để ko bị tràn ngang giấy
            let chunkSize = 20;
            for (let i = 0; i < keys.mcq.length; i += chunkSize) {
                let chunk = keys.mcq.slice(i, i + chunkSize);
                html += `<table border="1" style="width:100%; border-collapse: collapse; text-align:center; margin-bottom: 15px; font-size: 11.5pt;">`;
                html += `<tr style="background:#f4f4f4"><th style="padding: 8px;">Câu</th>` + chunk.map(k => `<th>${app.clean(String(k.q))}</th>`).join('') + `</tr>`;
                html += `<tr><td style="padding: 8px; font-weight:bold;">Trả lời</td>` + chunk.map(k => `<td style="color:red; font-weight:bold;">${app.clean(k.a)}</td>`).join('') + `</tr>`;
                html += `</table>`;
            }
        }

        // ==========================================
        // PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI
        // ==========================================
        if (keys.tf && keys.tf.length > 0) {
            html += `<div style="font-weight:bold; font-size: 12pt; margin-bottom: 8px; margin-top: 20px;">PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI</div>`;
            
            // Chia 4 câu 1 hàng để tối ưu diện tích
            let chunkSize = 4;
            for (let i = 0; i < keys.tf.length; i += chunkSize) {
                let chunk = keys.tf.slice(i, i + chunkSize);
                html += `<table border="1" style="width:100%; border-collapse: collapse; text-align:center; margin-bottom: 15px; font-size: 11.5pt;">`;
                
                // Dòng tiêu đề câu hỏi
                html += `<tr style="background:#f4f4f4">`;
                chunk.forEach(k => { html += `<th style="padding: 8px; width: 25%;">Câu ${app.clean(String(k.q))}</th>`; });
                // Điền thêm cột trống nếu ko đủ 4 câu
                for(let j = chunk.length; j < chunkSize; j++) { html += `<th style="width: 25%;"></th>`; }
                html += `</tr><tr>`;
                
                // Dòng đáp án a b c d
                chunk.forEach(k => {
                    let stHtml = (k.s || []).map((st, idx) => {
                        let letter = ['a', 'b', 'c', 'd'][idx] || '?';
                        let ansText = st.ans === 'Đ' ? 'Đúng' : (st.ans === 'S' ? 'Sai' : app.clean(st.ans));
                        return `<div style="margin-bottom: 6px;"><b>${letter})</b> <span style="color:red; font-weight:bold;">${ansText}</span></div>`;
                    }).join('');
                    html += `<td style="vertical-align:top; text-align:left; padding:10px 15px;">${stHtml}</td>`;
                });
                for(let j = chunk.length; j < chunkSize; j++) { html += `<td></td>`; }
                html += `</tr></table>`;
            }
        }

        // ==========================================
        // PHẦN III: TỰ LUẬN / ĐIỀN KHUYẾT
        // ==========================================
        if (keys.essay && keys.essay.length > 0) {
            html += `<div style="font-weight:bold; font-size: 12pt; margin-bottom: 8px; margin-top: 20px;">PHẦN III: TỰ LUẬN & TRẢ LỜI NGẮN</div>`;
            html += `<table border="1" style="width:100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11.5pt;">`;
            html += `<tr style="background:#f4f4f4"><th style="width:80px; padding:8px;">Câu</th><th style="padding:8px; text-align:center;">Nội dung đáp án</th></tr>`;
            
            const isImg = (text) => typeof text === 'string' && (/\.(png|jpe?g|gif|svg|webp)$/i.test(text.trim()) || text.includes('drive.google.com/thumbnail') || text.includes('drive.google.com/uc'));

            keys.essay.forEach(k => {
                let ansContent = k.a || "<i>(Chưa có đáp án)</i>";
                
                // Nếu đáp án là hình ảnh thì hiện hình
                if (isImg(ansContent)) {
                    ansContent = `<img src="${ansContent}" style="max-height: 150px; display: block; margin: 5px 0;">`;
                } else {
                    // Lọc XSS và giữ nguyên dấu xuống dòng của tự luận
                    ansContent = app.clean(ansContent).replace(/\n/g, '<br>');
                }

                // Nếu là tự luận có ý phụ thì nối số câu mẹ và câu con (VD: Câu 5 -> a)
                let qLabel = k.parent ? `Câu ${app.clean(String(k.parent))}<br>Ý ${app.clean(String(k.q))}` : `Câu ${app.clean(String(k.q))}`;

                html += `<tr>
                            <td style="text-align:center; font-weight:bold; padding:10px; vertical-align:top;">${qLabel}</td>
                            <td style="padding:10px 15px; color:red; line-height: 1.5;">${ansContent}</td>
                         </tr>`;
            });
            html += `</table>`;
        }
    });

    contentArea.innerHTML = html;
    
    // Ép render lại công thức Toán Hóa (KaTeX) cho bảng tổng hợp
    if (window.renderMathInElement) {
        renderMathInElement(contentArea, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}], throwOnError: false });
    }

    pageDiv.appendChild(contentArea);
    paper.appendChild(pageDiv);
};

app.createNewPage = function(containerElement, maDe) {
    this.pageCount++; let pageDiv = document.createElement('div'); pageDiv.className = 'page-container'; pageDiv.setAttribute('data-made', app.clean(maDe)); 
    let tplClone = document.getElementById((this.pageCount === 1) ? 'tpl-header-page-1' : 'tpl-header-page-n').content.cloneNode(true);
    if (this.pageCount === 1) {
        const cfg = EXAM.config;
        if(tplClone.querySelector('.cfg-truong')) tplClone.querySelector('.cfg-truong').innerHTML = `<b style="font-size:10.5pt">${app.clean(cfg.truong)}</b>`;
        if(tplClone.querySelector('.cfg-exam')) tplClone.querySelector('.cfg-exam').innerHTML = `<b>${app.clean(cfg.kyThi)}</b>`;
        if(tplClone.querySelector('.cfg-khoangay')) tplClone.querySelector('.cfg-khoangay').innerHTML = `<b>${app.clean(cfg.khoaNgay)}</b>`;
        if(tplClone.querySelector('.cfg-diemthi')) tplClone.querySelector('.cfg-diemthi').innerHTML = `<b>${app.clean(cfg.diemThi)}</b>`;
        if(tplClone.querySelector('.cfg-subject')) { let txt = `<span style="font-size: 11pt; font-weight: bold;">${app.clean(cfg.monThi)}</span>`; if (maDe) txt += `<br><span style="font-size:9pt; font-weight:normal">(Mã đề: ${app.clean(maDe)})</span>`; tplClone.querySelector('.cfg-subject').innerHTML = txt; }
    }
    pageDiv.appendChild(tplClone); let contentAreaDiv = document.createElement('div'); contentAreaDiv.className = 'content-area';
    if (this.pageCount === 1) {
        contentAreaDiv.classList.add('first-page-content');
        let sidebarDiv = document.createElement('div'); sidebarDiv.className = 'score-sidebar';
        let sHTML = '<div class="bold" style="margin-bottom:5px; font-size: 11pt;">Điểm phần:</div>';
        for (let i = 1; i <= (EXAM.config.soPhan || this.totalSecs || 1); i++) sHTML += `<div class="score-item"><span>Phần ${i}:</span><span>......đ</span></div>`;
        sHTML += `<div class="score-total" style="margin-top:auto"><span>Tổng:</span><span>.......đ</span></div>`;
        sidebarDiv.innerHTML = sHTML; contentAreaDiv.appendChild(sidebarDiv);
        let titleDiv = document.createElement('div'); titleDiv.className = 'center bold'; titleDiv.innerText = 'BÀI LÀM'; titleDiv.style.cssText = 'font-size:13pt; margin-bottom:10px'; contentAreaDiv.appendChild(titleDiv);
    }
    pageDiv.appendChild(contentAreaDiv); containerElement.appendChild(pageDiv);
    return { pageElement: pageDiv, contentElement: contentAreaDiv };
};

app.preloadImages = function(dataArray) {
    return new Promise((resolve) => {
        let imageUrls = [];

        const isImgUrl = (text) => {
            if (typeof text !== 'string') return false;
            let t = text.trim();
            return /\.(png|jpe?g|gif|svg|webp)$/i.test(t) || t.includes('drive.google.com/thumbnail') || t.includes('drive.google.com/uc');
        };

        const findImages = (obj) => {
            if (!obj) return;
            if (typeof obj === 'string' && isImgUrl(obj)) {
                imageUrls.push(obj.trim());
            } else if (Array.isArray(obj)) {
                obj.forEach(findImages);
            } else if (typeof obj === 'object') {
                Object.values(obj).forEach(findImages);
            }
        };

        findImages(dataArray);

        imageUrls = [...new Set(imageUrls)];

        if (imageUrls.length === 0) {
            resolve();
            return;
        }

        let loaded = 0;
        imageUrls.forEach(url => {
            let img = new Image();
            img.onload = img.onerror = () => { 
                loaded++;
                if (loaded === imageUrls.length) resolve();
            };
            img.src = url;
        });
    });
};

// ==========================================
// MỚI: ĐỘNG CƠ CO GIÃN HÌNH ẢNH TRỰC TIẾP TRÊN WEB
// ==========================================
app.initImageResizing = function() {
    const paper = document.getElementById('exam-paper');
    if (!paper) return;

    document.addEventListener('mousedown', function(e) {
        if (!e.target.closest('.img-resizable-wrapper')) {
            paper.querySelectorAll('.img-resizable-wrapper.active-resize').forEach(w => w.classList.remove('active-resize'));
        }
    });

    const wrappers = paper.querySelectorAll('.img-resizable-wrapper');
    wrappers.forEach(wrapper => {
        const img = wrapper.querySelector('img');
        if (!img) return;

        wrapper.addEventListener('click', function(e) {
            e.stopPropagation(); 
            paper.querySelectorAll('.img-resizable-wrapper.active-resize').forEach(w => w.classList.remove('active-resize'));
            this.classList.add('active-resize');
        });

        const resizer = wrapper.querySelector('.resizer-br');
        if (!resizer) return;

        let startX, startY, startWidth, startHeight, ratio;
        const badge = wrapper.querySelector('.resize-dim-badge');
        
        // Cảm biến xem đây là Ảnh câu hỏi hay Ảnh Đáp án
        const isOpt = wrapper.classList.contains('opt-resizable');

        const onMouseDown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY; 
            const rect = img.getBoundingClientRect();
            startWidth = rect.width;
            startHeight = rect.height;
            ratio = startWidth / startHeight;

            if (badge) {
                badge.style.display = 'block';
                // Đáp án thì báo chiều cao, Ảnh gốc thì báo chiều rộng
                badge.innerText = isOpt ? `Cao: ${Math.round(startHeight)}px` : `${Math.round(startWidth)}px`;
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'se-resize'; 
        };

        const onMouseMove = (e) => {
            if (isOpt) {
                // 1. CHẾ ĐỘ ẢNH ĐÁP ÁN: Kéo chuột lên/xuống đổi CHIỀU CAO
                const dy = e.clientY - startY;
                let newHeight = startHeight + dy;
                if (newHeight < 30) newHeight = 30; // Min 30px để ko bị biến mất
                
                // ✨ PHÉP THUẬT NẰM Ở ĐÂY: Quét 1 phát lấy CẢ 4 ẢNH TRONG CÂU HỎI ĐÓ và chỉnh chiều cao đồng loạt
                const allOptImgs = paper.querySelectorAll(`.opt-resizable[data-qid="${wrapper.dataset.qid}"] img`);
                allOptImgs.forEach(im => im.style.height = `${newHeight}px`);
                
                if (badge) badge.innerText = `Cao: ${Math.round(newHeight)}px`;
            } else {
                // 2. CHẾ ĐỘ ẢNH CÂU HỎI BÌNH THƯỜNG: Kéo ngang đổi CHIỀU RỘNG, giữ tỷ lệ
                const dx = e.clientX - startX;
                let newWidth = startWidth + dx;
                if (newWidth < 30) newWidth = 30; 
                
                const newHeight = newWidth / ratio;
                img.style.width = `${newWidth}px`;
                img.style.height = `${newHeight}px`; 
                
                if (badge) badge.innerText = `${Math.round(newWidth)}px`;
                
                const outerWrap = wrapper.closest('.img-stacked-wrap, .img-right-wrap');
                if (outerWrap) outerWrap.style.width = `${newWidth}px`;
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = ''; 
            
            if (badge) badge.style.display = 'none';

            // CHỐT KÍCH THƯỚC MỚI VÀO DATA VÀ CHIA TRANG LẠI
            const qid = wrapper.dataset.qid;
            if (qid) {
                if (isOpt) {
                    const finalHeight = img.style.height; 
                    
                    let item = app.workingData.find(x => x._id === qid);
                    if (item) item.optImgHeight = finalHeight;
                    
                    app.examVersions.forEach(version => {
                        let vItem = version.data.find(x => x._id === qid);
                        if (vItem) vItem.optImgHeight = finalHeight;
                    });
                } else {
                    const finalWidth = img.style.width; 
                    
                    let item = app.workingData.find(x => x._id === qid);
                    if (item) { item.imageWidth = finalWidth; if (item.imageHeight) delete item.imageHeight; }
                    
                    app.examVersions.forEach(version => {
                        let vItem = version.data.find(x => x._id === qid);
                        if (vItem) { vItem.imageWidth = finalWidth; if (vItem.imageHeight) delete vItem.imageHeight; }
                    });
                }
                app.autoFit(); 
            }
        };

        resizer.addEventListener('mousedown', onMouseDown);
    });
};