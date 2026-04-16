// templates/template-default.js
(function() {
    const defaultTemplate = {
        id: 'default',
        name: 'Mẫu truyền thống (Bộ GD)',
        
        // HTML cho trang đầu tiên (có phần phách, thông tin thí sinh)
        headerPage1: `
            <div class="sync-phach-height">
                <table class="header-table">
                    <colgroup><col style="width: 26%;"><col style="width: 10%;"><col style="width: 22%;"><col style="width: 22%;"><col style="width: 20%;"></colgroup>
                    <tr style="height: var(--h-ho-ten);">
                        <td colspan="2"><span style="display: block; line-height: 1.5; padding-top: 2px;">HỌ TÊN: ............................................<br>...........................................................</span></td>
                        <td colspan="2"><span class="nowrap-text">KỲ THI: <span class="cfg-exam">..........................................</span></span></td>
                        <td rowspan="2" class="center" style="padding-top: 6px;">Số thứ tự bài thi<br><small>do cán bộ coi thi ghi</small></td>
                    </tr>
                    <tr style="height: var(--h-thong-tin);">
                        <td colspan="2"><span class="nowrap-text">NGÀY SINH: ...........................................</span></td>
                        <td colspan="2"><span class="nowrap-text">Khóa ngày: <span class="cfg-khoangay">.......................................</span></span></td>
                    </tr>
                    <tr style="height: var(--h-thong-tin);">
                        <td colspan="2"><span class="nowrap-text">NƠI SINH: ..............................................</span></td>
                        <td colspan="2"><span class="nowrap-text">Điểm thi: <span class="cfg-diemthi">..........................................</span></span></td>
                        <td rowspan="2" class="center" style="padding-top: 6px;">Túi số lần 1<br><small>(do CB Làm phách ghi)</small></td>
                    </tr>
                    <tr style="height: var(--h-thong-tin);">
                        <td colspan="2"><span class="nowrap-text">TRƯỜNG: <span class="cfg-truong">......................................</span></span></td>
                        <td colspan="2"><span class="nowrap-text">Phòng thi số: ..........................................</span></td>
                    </tr>
                    <tr>
                        <td rowspan="3" class="center" style="padding-top: 8px;">
                            <b style="font-size: 12pt;">BÀI THI MÔN:</b><br><br>
                            <div class="cfg-subject"><span style="font-size: 10pt;">..................................</span></div>
                        </td>
                        <td rowspan="3" class="center" style="padding-top: 8px;">SỐ BÁO DANH<br><small>do TS ghi</small></td>
                        <td colspan="2" style="padding: 0; height: 1px;">
                            <div style="display: flex; flex-direction: column; height: 100%;">
                                <div class="center bold" style="height: var(--h-tieu-de-ky-tren); border-bottom: 1px solid black; display: flex; align-items: flex-start; justify-content: center; padding-top: 5px;">Họ, tên và chữ ký</div>
                                <div style="display: flex; height: var(--h-cb-coi-thi); border-bottom: 1px solid black;">
                                    <div class="center" style="flex: 1; border-right: 1px solid black; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px;">CB coi thi 1</div>
                                    <div class="center" style="flex: 1; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px;">CB coi thi 2</div>
                                </div>
                                <div style="flex-grow: 1; display: flex; min-height: var(--h-vung-ky-tren);">
                                    <div style="flex: 1; border-right: 1px solid black;"></div><div style="flex: 1;"></div>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 0; height: 1px;">
                            <div style="display: flex; flex-direction: column; height: 100%;">
                                <div class="center" style="flex-grow: 1; border-bottom: 1px solid black; display: flex; align-items: flex-start; justify-content: center; padding-top: 5px;">
                                    <div>Túi hoán vị<br><small>(do CB Làm phách ghi)</small></div>
                                </div>
                                <div style="padding: 6px; display: flex; align-items: flex-start;">Số phách ...................</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="roc-phach"></div>
            <table class="header-table" style="margin-bottom: 15px;">
                <colgroup><col style="width: 26%;"><col style="width: 10%;"><col style="width: 22%;"><col style="width: 22%;"><col style="width: 20%;"></colgroup>
                <tr>
                    <td colspan="2" class="cell-loi-dan">
                        <div class="center bold" style="margin-bottom: 3px; font-size: 10pt;">LỜI DẶN THÍ SINH</div>
                        1. Ghi đầy đủ các mục ở trên, không được đánh dấu bài thi.<br>
                        2. Ghi rõ tổng số tờ giấy thi đã làm bài.<br>
                        Bằng số: ........ tờ. &nbsp;&nbsp; Bằng chữ: ............................ tờ.
                    </td>
                    <td colspan="2" style="padding: 0; height: 1px;">
                        <div style="display: flex; flex-direction: column; height: 100%;">
                            <div class="center bold" style="height: var(--h-tieu-de-ky-duoi); border-bottom: 1px solid black; display: flex; align-items: flex-start; justify-content: center; padding-top: 5px;">Họ, tên và chữ ký</div>
                            <div style="display: flex; height: var(--h-cb-cham-thi); border-bottom: 1px solid black;">
                                <div class="center" style="flex: 1; border-right: 1px solid black; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px;">CB chấm thi 1</div>
                                <div class="center" style="flex: 1; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px;">CB chấm thi 2</div>
                            </div>
                            <div style="flex-grow: 1; display: flex; min-height: var(--h-vung-ky-duoi);">
                                <div style="flex: 1; border-right: 1px solid black;"></div><div style="flex: 1;"></div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 0; height: 1px;">
                        <div style="display: flex; flex-direction: column; height: 100%;">
                            <div style="height: var(--h-tieu-de-ky-duoi); border-bottom: 1px solid black; display: flex; align-items: flex-start; padding-left: 6px; padding-top: 5px;">Số phách ...................</div>
                            <div class="center" style="flex-grow: 1; display: flex; align-items: flex-start; justify-content: center; padding-top: 5px;">
                                <div>Túi hoán vị<br><small>(do CB Làm phách ghi)</small></div>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" class="center bold" style="font-size: 11pt; padding-top: 8px;">LỜI GHI CỦA CÁN BỘ CHẤM THI</td>
                    <td colspan="2" style="padding: 0; height: 1px;">
                        <div style="display: flex; flex-direction: column; height: 100%;">
                            <div class="center bold" style="height: var(--h-tieu-de-diem); border-bottom: 1px solid black; display: flex; align-items: flex-start; justify-content: center; padding-top: 5px;">Điểm bài thi</div>
                            <div style="display: flex; height: var(--h-chu-diem); border-bottom: 1px solid black;">
                                <div class="center" style="flex: 1; border-right: 1px solid black; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px;">Bằng số</div>
                                <div class="center" style="flex: 1; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px;">Bằng chữ</div>
                            </div>
                            <div style="flex-grow: 1; display: flex; min-height: var(--h-vung-ghi-diem);">
                                <div style="flex: 1; border-right: 1px solid black;"></div><div style="flex: 1;"></div>
                            </div>
                        </div>
                    </td>
                    <td class="center" style="padding-top: 8px;">Số thứ tự bài thi<br><small>do cán bộ coi thi ghi</small></td>
                </tr>
            </table>
        `,

        // HTML cho các trang tiếp theo (chỉ có dòng nhắc nhở không viết vào phách)
        headerPageN: `
            <div class="sync-phach-height"><div class="do-not-write-box">THÍ SINH KHÔNG ĐƯỢC VIẾT VÀO PHẦN NÀY</div></div>
            <div class="roc-phach"></div>
        `,

        // Hàm đổ dữ liệu (Data Binding)
        applyData: function(element, cfg, maDe) {
            if(element.querySelector('.cfg-truong')) element.querySelector('.cfg-truong').innerHTML = `<b style="font-size:10.5pt">${app.clean(cfg.truong)}</b>`;
            if(element.querySelector('.cfg-exam')) element.querySelector('.cfg-exam').innerHTML = `<b>${app.clean(cfg.kyThi)}</b>`;
            if(element.querySelector('.cfg-khoangay')) element.querySelector('.cfg-khoangay').innerHTML = `<b>${app.clean(cfg.khoaNgay)}</b>`;
            if(element.querySelector('.cfg-diemthi')) element.querySelector('.cfg-diemthi').innerHTML = `<b>${app.clean(cfg.diemThi)}</b>`;
            if(element.querySelector('.cfg-subject')) { 
                let txt = `<span style="font-size: 11pt; font-weight: bold;">${app.clean(cfg.monThi)}</span>`; 
                if (maDe) txt += `<br><span style="font-size:9pt; font-weight:normal">(Mã đề: ${app.clean(maDe)})</span>`; 
                element.querySelector('.cfg-subject').innerHTML = txt; 
            }
        }
    };

    // Đăng ký template này vào hệ thống core
    window.app.templates['default'] = defaultTemplate;
})();