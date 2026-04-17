(function() {
    const test15phTemplate = {
        id: '15phut',
        name: 'Mẫu 15 Phút (Chuẩn A4)',
        
        headerPage1: `
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
                <div style="text-align: center; width: 40%;">
                    <div class="cfg-truong" style="font-weight: bold; font-size: 11pt; padding-top: 10px;">TRƯỜNG ...............................</div>
                </div>
                
                <div style="text-align: center; width: 55%;">
                    <div style="font-weight: bold; font-size: 14pt;">BÀI KIỂM TRA 15 PHÚT</div>
                    <div class="cfg-subject" style="font-weight: bold; font-size: 11pt; margin-top: 5px;">Môn: ........................</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px; font-size: 12pt; line-height: 1.8;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="width: 70%;"><b>Họ và tên:</b> ............................................................................</span>
                    <span style="width: 25%;"><b>Lớp:</b> ........................</span>
                </div>
                <div><b>Điểm:</b> ........................................ <b>Lời phê của giáo viên:</b> ...........................................................................</div>
            </div>
        `,

        // XÓA SỔ HOÀN TOÀN: Để trống tuyệt đối để tối ưu diện tích nhét câu hỏi
        headerPageN: ``,

        applyData: function(element, cfg, maDe) {
            // 1. Điền tên trường
            if(element.querySelector('.cfg-truong')) {
                element.querySelector('.cfg-truong').innerHTML = app.clean(cfg.truong);
            }
            
            // 2. Điền tên môn và mã đề
            element.querySelectorAll('.cfg-subject').forEach(el => {
                let txt = `Môn: ${app.clean(cfg.monThi)}`;
                if (maDe) txt += ` (Mã đề: ${app.clean(maDe)})`;
                el.innerHTML = txt;
            });
        }
    };

    window.app.templates['15phut'] = test15phTemplate;
})();