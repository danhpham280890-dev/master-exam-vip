(function() {
    const doubleA5 = {
        id: '15ph-double',
        name: '✂️ Mẫu 15 Phút (2 Đề A5/A4 Ngang - Tự Đồng Bộ)',
        
        headerPage1: `
            <style>
                @media print {
                    @page { size: A4 landscape; margin: 0.5cm; }
                }
                
                /* 1. KHUNG GIẤY CHUẨN A4 NGANG */
                body #exam-paper .page-container {
                    width: 297mm !important;      
                    height: 210mm !important; 
                    min-height: 210mm !important;
                    max-height: 210mm !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                    position: relative; 
                    overflow: hidden !important; 
                    display: block !important;
                    background: white;
                }

                /* 2. DỌN DẸP KHUNG ĐIỂM & CHÂN TRANG */
                body #exam-paper .score-sidebar,
                body #exam-paper .page-footer {
                    display: none !important;
                }

                /* =======================================
                   3. ĐỒNG BỘ LỀ TRÁI & PHẢI TUYỆT ĐỐI
                   ======================================= */
                
                /* Chỉ lót lề Trái/Phải, giải phóng lề Trên/Dưới để không bị đụng chạm */
                body #exam-paper .page-container > .a5-left-header, 
                body #exam-paper .page-container > .content-area,
                .a5-right-clone .a5-left-header,
                .a5-right-clone .content-area {
                    padding-left: 1.5cm !important; 
                    padding-right: 1.5cm !important;
                    box-sizing: border-box !important;
                    display: block !important;
                    float: none !important;
                    clear: none !important;
                }

                /* Ép bề ngang 50% cho bản gốc */
                body #exam-paper .page-container > .a5-left-header, 
                body #exam-paper .page-container > .content-area {
                    width: 50% !important;
                }

                /* Ép bề ngang 100% cho bản sao (Vì khung chứa nó đã là 50% rồi) */
                .a5-right-clone .a5-left-header,
                .a5-right-clone .content-area {
                    width: 100% !important; 
                }

                /* Cấp lề trên 1cm bằng nhau chằn chặn cho cả 2 bên gốc & sao */
                body #exam-paper .page-container > .a5-left-header,
                .a5-right-clone .a5-left-header {
                    padding-top: 1cm !important; 
                }
                
                body #exam-paper .page-container > .content-area, 
                .a5-right-clone .content-area { 
                    padding-top: 0 !important; 
                    padding-bottom: 0 !important;
                    min-height: 0 !important;
                }

                /* Khung chứa Bản sao bên phải */
                .a5-right-clone {
                    position: absolute;
                    top: 0; right: 0;
                    width: 50%; height: 100%;
                    pointer-events: none; /* Khóa click */
                    display: block !important;
                    overflow: hidden;
                }

                /* Căn giữa chữ BÀI LÀM */
                body #exam-paper .content-area > .center.bold,
                .a5-right-clone .content-area > .center.bold {
                    width: 100% !important;
                    text-align: center !important;
                    margin-top: 10px !important;
                    margin-bottom: 10px !important;
                }

                /* 4. ĐƯỜNG KÉO RỌC PHÁCH */
                body #exam-paper .page-container::before {
                    content: '✂️';
                    position: absolute;
                    left: 50%; top: 0; bottom: 0;
                    border-left: 1px dashed #aaa;
                    display: flex; align-items: center; justify-content: center;
                    transform: translateX(-50%);
                    z-index: 10;
                }
            </style>

            <div class="a5-left-header">
                <div style="display: flex; justify-content: space-between; font-size: 10pt; border-bottom: 1.5px solid #000; padding-bottom: 5px; margin-bottom: 8px;">
                    <span>Họ tên: .......................................</span>
                    <span>Lớp: ...........</span>
                    <span class="cfg-subject">Môn: .................</span>
                </div>
                <div style="font-size: 10pt; margin-bottom: 15px; display: flex; gap: 20px;">
                    <span>Điểm: ...........</span>
                    <span style="flex-grow: 1;">Lời phê: ...........................................................</span>
                </div>
            </div>
        `,

        // 🔪 ĐÃ TRẢM HEADER TRANG 2: Rỗng tuếch để nhường chỗ cho câu hỏi
        headerPageN: ``,

        applyData: function(element, cfg, maDe) {
            document.querySelectorAll('.cfg-subject').forEach(el => {
                let txt = `Môn: ${app.clean(cfg.monThi)}`;
                if (maDe) txt += ` (${app.clean(maDe)})`;
                el.innerHTML = `<b>${txt}</b>`;
            });

            // GỌI ROBOT NHÂN BẢN
            setTimeout(() => {
                const paper = document.getElementById('exam-paper');
                if (!paper || paper.dataset.mirrorActive === 'true') return; 
                paper.dataset.mirrorActive = 'true'; 

                const syncAllPages = () => {
                    paper.querySelectorAll('.page-container').forEach(page => {
                        let oldClone = page.querySelector('.a5-right-clone');
                        if (oldClone) oldClone.remove();

                        let cloneBox = document.createElement('div');
                        cloneBox.className = 'a5-right-clone';
                        
                        let header = page.querySelector('.a5-left-header');
                        if (header) cloneBox.appendChild(header.cloneNode(true));
                        
                        let content = page.querySelector(':scope > .content-area');
                        if (content) cloneBox.appendChild(content.cloneNode(true));
                        
                        page.appendChild(cloneBox);
                    });
                };

                syncAllPages(); 

                let timeout;
                const observer = new MutationObserver(() => {
                    clearTimeout(timeout);
                    timeout = setTimeout(syncAllPages, 300); 
                });
                observer.observe(paper, { childList: true, subtree: true, characterData: true });
                
            }, 500); 
        }
    };

    window.app.templates['15ph-double'] = doubleA5;
})();