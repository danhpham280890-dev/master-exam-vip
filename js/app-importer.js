// ==========================================
// MODULE 1: DỊCH EXCEL (OFFLINE) & KÉO DATA TỪ GAS (ONLINE)
// ==========================================

app.processRawData = function(sheetsData) {
    const newExamData = [];
    let currentCloze = null;
    let currentEssayMulti = null;
    
    for (let sheetName in sheetsData) {
        let rawJson = sheetsData[sheetName];
        
        rawJson.forEach(row => {
            let loai = String(row['Loại'] || '').trim().toLowerCase();
            let diem = String(row['Điểm'] || "").trim(); 
            let cauHoi = String(row['Câu hỏi'] || row['Nội dung'] || "").trim();
            let mucDo = String(row['Mức độ'] || "NB").trim().toUpperCase();
            let dapAn = String(row['Đáp án'] || "").trim();
            let idThat = String(row['ID Câu Hỏi'] || row['ID'] || "").trim(); // LẤY ID TỪ GOOGLE SHEETS
            
            // Đã thêm row['Link hình'] và đổi sang API thumbnail của Google
            let rawImgLink = String(row['Link ảnh (Google Drive)'] || row['Tên hình'] || row['Link hình'] || "").trim();
            let hinh = rawImgLink;
            if (hinh.includes("drive.google.com")) {
                let match = hinh.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (match && match[1]) {
                    hinh = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                }
            }
            let size = String(row['Size hình'] || "").trim();
            let viTri = String(row['Vị trí hình'] || "").trim();

            let qObj = null;

            if (loai === 'section') {
                currentCloze = null; currentEssayMulti = null;
                newExamData.push({ type: "section", title: cauHoi, pointsPerQuestion: diem });
            } 
            else if (loai === 'mcq') {
                currentCloze = null; currentEssayMulti = null;
                let opts = [row['A'], row['B'], row['C'], row['D']].filter(o => o !== undefined && o !== "");
                qObj = { type: "mcq", chapter: row['Chương'], lesson: row['Bài'], level: mucDo, points: diem, question: cauHoi, options: opts, answer: dapAn.toUpperCase() };
                newExamData.push(qObj);
            }
            else if (loai === 'tf' || loai === 'true-false') {
                currentCloze = null; currentEssayMulti = null;
                let st = [];
                ['A', 'B', 'C', 'D'].forEach((k, i) => {
                    if (row['Ý ' + k]) st.push({ text: ['a) ', 'b) ', 'c) ', 'd) '][i] + row['Ý ' + k], ans: String(row['Đ/S ' + k]).trim().toUpperCase() });
                });
                qObj = { type: "true-false", chapter: row['Chương'], lesson: row['Bài'], level: mucDo || "TH", points: diem, question: cauHoi, statements: st };
                newExamData.push(qObj);
            }
            else if (loai === 'reading') {
                currentCloze = null; currentEssayMulti = null;
                qObj = { type: "reading", content: cauHoi };
                newExamData.push(qObj);
            }
            else if (loai === 'cloze') {
                currentEssayMulti = null;
                currentCloze = { type: "cloze", chapter: String(row['Chương'] || "").trim(), lesson: String(row['Bài'] || "").trim(), level: mucDo || "TH", content: cauHoi, questions: [] };
                qObj = currentCloze; 
                newExamData.push(currentCloze);
            }
            else if (loai === 'cloze-q') {
                if (currentCloze) {
                    let opts = [row['A'], row['B'], row['C'], row['D']].filter(o => o !== undefined && o !== "");
                    qObj = { question: cauHoi, level: mucDo, answer: dapAn.toUpperCase(), options: opts };
                    currentCloze.questions.push(qObj);
                }
            }
            else if (loai === 'matching') {
                currentCloze = null; currentEssayMulti = null;
                let colA = [], colB = [];
                for(let i=1; i<=6; i++) {
                    if (row['Trái '+i]) colA.push(String(row['Trái '+i]));
                    if (row['Phải '+i]) colB.push(String(row['Phải '+i]));
                }
                qObj = { type: "matching", chapter: row['Chương'], lesson: row['Bài'], level: mucDo, points: diem, question: cauHoi, colA: colA, colB: colB };
                newExamData.push(qObj);
            }
            else if (loai === 'fill-blank') {
                currentCloze = null; currentEssayMulti = null;
                let items = [];
                for(let i=1; i<=5; i++) { if (row['Ý '+i]) items.push(row['Ý '+i]); }
                qObj = { type: "fill-blank", chapter: row['Chương'], lesson: row['Bài'], level: mucDo || "VD", points: diem, question: cauHoi, items: items, answer: dapAn };
                newExamData.push(qObj);
            }
            else if (loai === 'essay') {
                currentCloze = null; currentEssayMulti = null;
                qObj = { type: "essay", chapter: row['Chương'], lesson: row['Bài'], level: mucDo || "VD", points: diem, question: cauHoi, paperStyle: row['Loại giấy'] === 'ô ly' ? 'grid' : (row['Loại giấy'] === 'trắng' ? 'blank' : 'line'), lines: parseInt(row['Số dòng']) || 5, answer: dapAn };
                newExamData.push(qObj);
            }
            else if (loai === 'essay-multi') {
                currentCloze = null;
                currentEssayMulti = { type: "essay-multi", chapter: row['Chương'], lesson: row['Bài'], level: mucDo || "VDC", points: diem, question: cauHoi, subQuestions: [] };
                qObj = currentEssayMulti;
                newExamData.push(currentEssayMulti);
            }
            else if (loai === 'sub-essay') {
                if (currentEssayMulti) {
                    qObj = { text: cauHoi, paperStyle: row['Loại giấy'] === 'ô ly' ? 'grid' : (row['Loại giấy'] === 'trắng' ? 'blank' : 'line'), lines: parseInt(row['Số dòng']) || 3, answer: dapAn };
                    currentEssayMulti.subQuestions.push(qObj);
                }
            }

            if (qObj && hinh) {
                qObj.image = hinh;
                if (size) qObj.imageWidth = size; 
                if (viTri) qObj.imageLayout = (viTri.toLowerCase() === 'right' || viTri.toLowerCase() === 'phải') ? 'right' : 'stacked';
            }

            // GÁN ID THẬT VÀO OBJECT
            if (qObj && idThat !== "") {
                qObj._id = idThat;
            }
        });
    }

    if(newExamData.length > 0) {
        app.originalData = JSON.parse(JSON.stringify(newExamData));
        app.buildCatalog(); 
        
        const paper = document.getElementById('exam-paper');
        paper.innerHTML = `
            <div id="welcome-screen" class="no-print" style="text-align: center; padding: 50px 20px; font-family: Arial, sans-serif; color: #444; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); max-width: 600px; margin: 40px auto;">
                <h1 style="color: #28a745; margin-bottom: 10px;">✅ NẠP KHO THÀNH CÔNG!</h1>
                <p style="font-size: 13pt; color: #666; margin-bottom: 25px;">Đã phong ấn <b>${newExamData.length}</b> câu hỏi vào bộ nhớ ngầm.</p>
                <button class="btn-cp" onclick="app.openMatrixModal()" style="background-color: #e83e8c; font-size: 14pt; padding: 15px 30px; border-radius: 50px; box-shadow: 0 5px 15px rgba(232, 62, 140, 0.4); transition: 0.3s;">📊 Mở Ma Trận Bốc Đề Ngay</button>
            </div>
        `;
        
        document.getElementById('val-score').innerHTML = `Kho: ${newExamData.length} câu`;
        document.getElementById('val-ans').innerHTML = `Đang chờ bốc đề...`;
        
    } else {
        alert("⚠️ Không tìm thấy câu hỏi nào! Bồ check lại file xem có để trống không?");
    }
};

app.importExcel = function(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        
        let sheetsData = {};
        workbook.SheetNames.forEach(sheetName => {
            sheetsData[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
        });

        app.processRawData(sheetsData); 
        inputElement.value = ""; 
    };
    reader.readAsArrayBuffer(file);
};

// ==================================================
// HÀM HÚT DATA MỚI - ĐÃ ĐƯỢC "TIÊM" XÁC THỰC EMAIL
// ==================================================
app.importFromCloud = async function() {
    // 1. Kiểm tra Email đăng nhập
    if (!window.userEmail) {
        alert("⛔ BỒ CHƯA ĐĂNG NHẬP!\n\nHãy bấm nút 'Sign in with Google' ở thanh Menu bên trái để xác thực danh tính trước khi dùng tính năng Hút Data VIP.");
        return;
    }

    let rawLink = document.getElementById('cloud-link').value.trim();
    if (!rawLink) { alert("⚠️ Bro chưa dán link Google Sheets vào kìa!"); return; }

    let match = rawLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
    let sheetId = match ? match[1] : null;

    if (!sheetId) { alert("❌ Lỗi: Không tìm thấy ID trong link."); return; }

    // 2. Gửi Sheet ID kèm theo Email đăng nhập
    const API_URL = "https://script.google.com/macros/s/AKfycbyg6PZxb1NTDsPHAsAo1m-enEhTYqsE7yC_WTTeyNlpzFFJh9hQ8NA0q2xLw22Rn9hLgQ/exec";
    let fetchUrl = `${API_URL}?id=${sheetId}&email=${encodeURIComponent(window.userEmail)}`;

    let btn = document.getElementById('cloud-btn');
    if(btn) { btn.innerText = "⏳ Đang soi vé vào cổng..."; btn.disabled = true; }

    try {
        let response = await fetch(fetchUrl);
        if (!response.ok) throw new Error("Trạm trung tâm bị nghẽn mạng!");
        
        let result = await response.json();
        
        // 3. Bắt lỗi từ Sổ Nam Tào trả về
        if (result.status === "error") {
            if (result.message.includes("Từ chối truy cập")) {
                throw new Error(`Email ${window.userEmail} không có trong Sổ Nam Tào hoặc đã bị khóa!`);
            } else {
                throw new Error(result.message);
            }
        }

        app.processRawData(result.data); 
        app.closeImportModal();
        
        // Nâng cấp: Tự điền tên trường và môn học từ kết quả trả về
        if (result.meta) {
            document.getElementById('cfg-truong').value = result.meta.tenTruong || "Trường VIP";
            document.getElementById('cfg-monthi').value = result.meta.tenMon || "Môn Thi VIP";
            alert(`🎉 Hút thành công kho đề: ${result.meta.tenMon} - ${result.meta.tenTruong}`);
        }
        
    } catch (error) {
        console.error("LỖI HÚT DATA:", error);
        alert("⛔ TỪ CHỐI TRUY CẬP:\n\n" + error.message);
    } finally {
        if(btn) { btn.innerText = "⚡ Hút Data"; btn.disabled = false; }
    }
};
