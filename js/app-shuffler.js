// ==========================================
// MODULE 4: ĐỘNG CƠ TRỘN MÃ ĐỀ (SHUFFLE ENGINE)
// ==========================================

app.examVersions = []; // Chứa danh sách các mã đề đã trộn

app.generateExamVersions = function(numVersions) {
    this.examVersions = [];
    let baseCode = parseInt(EXAM.config.maDe) || 101;

    for (let i = 0; i < numVersions; i++) {
        let currentCode = (baseCode + i).toString();
        // Copy tách biệt dữ liệu gốc để trộn không bị dính chùm
        let clonedData = JSON.parse(JSON.stringify(this.workingData));

        if (i > 0) { // Mã đề đầu tiên (i=0) giữ nguyên gốc, từ mã thứ 2 trở đi mới xào bài
            clonedData = this.shuffleQuestions(clonedData);
            clonedData.forEach(q => this.shuffleOptions(q));
        }

        // Cập nhật lại Số thứ tự câu (1, 2, 3...) sau khi đã xáo trộn
        this.recalculateNumbering(clonedData);
        
        this.examVersions.push({
            maDe: currentCode,
            data: clonedData
        });
    }
};

// Thuật toán xào câu hỏi trong từng PHẦN (Section)
app.shuffleQuestions = function(data) {
    let newData = [];
    let currentSection = [];
    let currentHeader = null;

    data.forEach(item => {
        if (item.type === 'section') {
            if (currentHeader) {
                newData.push(currentHeader);
                this.shuffleArray(currentSection);
                newData = newData.concat(currentSection);
            }
            currentHeader = item;
            currentSection = [];
        } else {
            currentSection.push(item);
        }
    });

    if (currentHeader) {
        newData.push(currentHeader);
        this.shuffleArray(currentSection);
        newData = newData.concat(currentSection);
    }
    return newData.length > 0 ? newData : data;
};

// Thuật toán xào Đáp án A, B, C, D
app.shuffleOptions = function(item) {
    // Xáo Trắc nghiệm thường
    if (item.type === 'mcq' && item.options && item.options.length > 1 && item.answer) {
        let ansIdx = item.answer.charCodeAt(0) - 65; // Đổi A, B, C, D thành 0, 1, 2, 3
        if (ansIdx >= 0 && ansIdx < item.options.length) {
            let correctText = item.options[ansIdx]; // Nhớ mặt đáp án đúng
            this.shuffleArray(item.options); // Xóc đĩa
            let newAnsIdx = item.options.indexOf(correctText); // Tìm lại nó đang nằm ở đâu
            item.answer = String.fromCharCode(65 + newAnsIdx); // Gắn mác mới (VD: B thành C)
        }
    }
    // Xáo Điền khuyết có câu hỏi phụ (Cloze-q)
    if (item.type === 'cloze' && item.questions) {
        item.questions.forEach(q => this.shuffleOptions(q)); // Đệ quy xáo câu phụ
    }
};

app.shuffleArray = function(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

app.recalculateNumbering = function(data) {
    let tIdx = 1;
    data.forEach(item => {
        if (item.type !== "section" && item.type !== "reading") {
            item._qIdx = tIdx++;
        }
    });
};