// ========================================================================
// 🧠 TỪ ĐIỂN JSON SCHEMA - MASTER EXAM V4.0 (KHO DỮ LIỆU SẠCH)
// ========================================================================
const EXAM = {
    config: {
        "mode": "exam",              
        "autoNumbering": true,       
        "totalExpectedScore": 10.0, 
        "maDe": "101", 
        
        "fontFamily": "Times New Roman", 
        "fontSize": 14,                  
        "lineHeight": 1.15, 
        "inTrangDen": true,              
        
        "truong": "THCS NGUYỄN VĂN BÉ",
        "kyThi": "KIỂM TRA GIỮA HỌC KỲ II", 
        "khoaNgay": "Ngày 20/03/2026",
        "diemThi": "THCS NGUYỄN VĂN BÉ", 
        "monThi": "KHOA HỌC TỰ NHIÊN",
        
        "thoiGian": "Thời gian làm bài: 120 phút",
        "soPhan": 6, 
        "footerText": "© Master Exam V4.0 - Final Boss" 
    },
    
    data: [
        // =======================================================
        // PHẦN I. TRẮC NGHIỆM ĐA LỰA CHỌN
        // =======================================================
        { 
            "type": "section", 
            "title": "PHẦN I. TRẮC NGHIỆM ĐA LỰA CHỌN (4,0 ĐIỂM)", 
            "pointsPerQuestion": "0.25 điểm", 
            "showMCQTable": true 
        },
        { 
            "type": "mcq", 
            "question": "Hàm số $y = \\frac{2x - 1}{x + 1}$ có đường tiệm cận ngang là:", 
            "level": "TH", 
            "columns": 2, 
            "answer": "A", 
            "options": [
                "A. $y = 2$", 
                "B. $x = -1$", 
                "C. $y = -1$", 
                "D. $x = 2$"
            ] 
        },
        { 
            "type": "mcq", 
            "question": "Dụng cụ dùng để đo nhiệt độ được gọi là:", 
            "level": "NB", 
            "image": "test-hinh.png", 
            "imageWidth": "30%", 
            "imageLayout": "right", 
            "answer": "B", 
            "options": [
                "A. Barometer", 
                "B. Thermometer", 
                "C. Compass", 
                "D. Ruler"
            ] 
        },
        { 
            "type": "mcq", 
            "question": "Đồ thị của hàm số $y = -x^3 + 3x$ là đường cong nào?", 
            "level": "VD", 
            "optionImages": [
                "test-hinh.png", 
                "test-hinh.png", 
                "test-hinh.png", 
                "test-hinh.png"
            ], 
            "optionColumns": 4, 
            "answer": "C" 
        },

        // =======================================================
        // PHẦN II. TRẮC NGHIỆM ĐÚNG SAI
        // =======================================================
        { 
            "type": "section", 
            "title": "PHẦN II. TRẮC NGHIỆM ĐÚNG SAI (3,0 ĐIỂM)", 
            "pointsPerQuestion": "1.0 điểm",
            "showMCQTable": false 
        },
        { 
            "type": "true-false", 
            "question": "Nhận định về hiện tượng vật lý trong tự nhiên:", 
            "level": "TH",
            "statements": [
                { "text": "a) Nước sôi ở 100 độ C ở điều kiện tiêu chuẩn.", "ans": "Đ" },
                { "text": "b) Kim loại là chất cách điện tốt.", "ans": "S" },
                { "text": "c) Ánh sáng đi theo đường thẳng.", "ans": "Đ" },
                { "text": "d) Trái đất hình vuông.", "ans": "S" }
            ] 
        },
        { 
            "type": "true-false", 
            "question": "Nhận định về tế bào sinh học:", 
            "level": "NB",
            "statements": [
                { "text": "a) Tế bào là đơn vị cơ bản của sự sống.", "ans": "Đ" },
                { "text": "b) Tất cả vi khuẩn đều có hại.", "ans": "S" },
                { "text": "c) DNA nằm trong nhân tế bào.", "ans": "Đ" }
            ] 
        },

        // =======================================================
        // PHẦN III. ĐỌC HIỂU VÀ ĐIỀN KHUYẾT
        // =======================================================
        { 
            "type": "section", 
            "title": "PHẦN III. ĐỌC HIỂU VÀ ĐIỀN KHUYẾT", 
            "pointsPerQuestion": "0.5 điểm",
            "showMCQTable": false 
        },
        { 
            "type": "reading", 
            "content": "<i>Global warming refers to the long-term rise in the average temperature of the Earth's climate system. The effects include rising sea levels and expansion of deserts. This passage is very long and we allowed it to break across pages automatically so it won't leave a huge blank space.</i>" 
        },
        { 
            "type": "cloze", 
            "content": "Air pollution is a serious problem. It causes a lot of (1) ________ problems for people. The government should take actions to (2) ________ smoke.", 
            "questions": [
                { 
                    "question": "Blank (1):", 
                    "level": "NB", 
                    "answer": "A", 
                    "options": ["A. health", "B. healthy", "C. healthily", "D. heal"] 
                },
                { 
                    "question": "Blank (2):", 
                    "level": "TH", 
                    "answer": "B", 
                    "options": ["A. increase", "B. reduce", "C. reuse", "D. recycle"] 
                }
            ] 
        },
        
        // =======================================================
        // PHẦN IV. NỐI CỘT & TRẢ LỜI NGẮN
        // =======================================================
        { 
            "type": "section", 
            "title": "PHẦN IV. NỐI CỘT & TRẢ LỜI NGẮN", 
            "pointsPerQuestion": "1.0 điểm",
            "showMCQTable": false 
        },
        { 
            "type": "matching", 
            "question": "Match the words in column A with their meanings in column B.", 
            "level": "NB",
            "colA": ["1. Lực tĩnh điện", "2. Điện trường"], 
            "colB": ["A. Vôn trên mét", "B. Niutơn", "C. Vôn"] 
        },
        { 
            "type": "matching", 
            "question": "Match the traffic signs (Column A) with their meanings (Column B).", 
            "level": "TH",
            "colA": [
                "1. <br><img src='test-hinh.png' style='width: 3cm; margin-top: 5px;'>", 
                "2. <br><img src='test-hinh.png' style='width: 3cm; margin-top: 5px;'>"
            ], 
            "colB": [
                "A. Stop", 
                "B. No Parking"
            ] 
        },
        { 
            "type": "fill-blank", 
            "question": "Supply the correct form:", 
            "level": "VD",
            "items": [
                "1. If I (be) ____________ you, I would take that course."
            ],
            "answer": "1. were"
        },

        // =======================================================
        // PHẦN V. TỰ LUẬN CƠ BẢN
        // =======================================================
        { 
            "type": "section", 
            "title": "PHẦN V. TỰ LUẬN CƠ BẢN (CÁC LOẠI GIẤY)", 
            "pointsPerQuestion": "1.0 điểm",
            "showMCQTable": false 
        },
        { 
            "type": "essay", 
            "question": "Viết một đoạn văn ngắn về bảo vệ môi trường.", 
            "level": "VD", 
            "paperStyle": "line", 
            "lines": 4, 
            "answer": "Nêu thực trạng, hậu quả và giải pháp (0.5đ mỗi ý)."
        },
        { 
            "type": "essay", 
            "question": "Vẽ đồ thị biểu diễn sự phụ thuộc của I vào U.", 
            "level": "TH", 
            "paperStyle": "grid", 
            "height": "4cm", 
            "answer": "Đường thẳng đi qua gốc tọa độ O."
        },
        { 
            "type": "essay", 
            "question": "Vẽ sơ đồ khối vòng tuần hoàn của nước.", 
            "level": "VDC", 
            "paperStyle": "blank", 
            "height": "4cm", 
            "answer": "Bốc hơi -> Ngưng tụ -> Mưa."
        },

        // =======================================================
        // PHẦN VI. TỰ LUẬN TỔNG HỢP (NHIỀU Ý)
        // =======================================================
        { 
            "type": "section", 
            "title": "PHẦN VI. TỰ LUẬN TỔNG HỢP", 
            "showMCQTable": false 
        },
        { 
            "type": "essay-multi", 
            "question": "Thực hành đo điện trở đoạn mạch.", 
            "points": "2.0 điểm", 
            "level": "VDC",
            "subQuestions": [
                { 
                    "text": "a) (1,0 điểm) Vẽ sơ đồ mạch điện.", 
                    "paperStyle": "blank", 
                    "height": "4cm", 
                    "answer": "Vẽ đúng ký hiệu nguồn, khóa K, điện trở nối tiếp." 
                },
                { 
                    "text": "b) (1,0 điểm) Tính Rtđ khi R1=5, R2=10.", 
                    "paperStyle": "line", 
                    "lines": 3, 
                    "answer": "Rtđ = 5 + 10 = 15 ohm." 
                }
            ]
        }
    ]
};