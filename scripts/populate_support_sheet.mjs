import WebSocket from 'ws';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const sheetTab = tabs.find(t => t.url.includes('docs.google.com/spreadsheets') && t.url.includes('1YAVNiPtAiYrxEThvIgWuR0PAHJbDCDqrXCz5SNwrxXE'));
  
  if (!sheetTab) {
    console.error('No sheet tab found');
    return;
  }
  
  const ws = new WebSocket(sheetTab.webSocketDebuggerUrl);
  
  const headers = [
    'MÃ_PHIẾU',
    'THỜI_GIAN',
    'NGƯỜI_TRAO_ĐỔI',
    'VAI_TRÒ',
    'PHÂN_LOẠI',
    'MỤC_TIÊU_YÊU_CẦU',
    'KẾT_QUẢ_ĐẦU_RA_MONG_MUỐN',
    'NỘI_DUNG_TRAO_ĐỔI_CHI_TIẾT',
    'MỨC_ĐỘ_ƯU_TIÊN',
    'GIAI_ĐOẠN_ÁP_DỤNG',
    'TRẠNG_THÁI_XỬ_LÝ',
    'AI_CEO_LUCKY_ACTION',
    'GHI_CHÚ_LINK'
  ];

  const row1 = [
    'DEV-2026-001',
    '18/09/2026 08:15:00',
    'Chairman Victor Chuyen',
    'CHAIRMAN',
    'BÁO LỖI (BUG)',
    '5 Thẻ KPI đầu trang hiển thị số 0 khi tải lại trang',
    'Hiển thị chính xác số liệu thực từ Google Sheet (10 lao động, VWW: 2, Chờ: 5)',
    'Chairman chụp màn hình báo 5 thẻ KPI đầu trang bằng 0. Cần fix để hiện số thật.',
    'P1 - NGHIÊM TRỌNG',
    'GĐ1',
    'ĐÃ FIX & DEPLOY',
    'Đã ánh xạ v2.dashboard.stats chuẩn hóa vào dashboardApi.ts & TodayPage.tsx',
    'https://fcs.breaths.live/app'
  ];

  const row2 = [
    'DEV-2026-002',
    '18/09/2026 08:20:00',
    'Ban Giám Đốc FCS',
    'KHÁCH HÀNG',
    'BÁO LỖI (BUG)',
    'Nút Chạy mẫu Golden Flow bị báo lỗi đỏ khi bấm',
    'Thực thi mượt mà, chuyển deal sang L3 VWW trên Google Sheets',
    'Bấm nút Chạy mẫu Golden Flow hiện thông báo cảnh báo lỗi. Cần fix ngay.',
    'P1 - NGHIÊM TRỌNG',
    'GĐ1',
    'ĐÃ FIX & DEPLOY',
    'Nâng cấp goldenFlowApi.ts tự động điều phối Deal sang L2.1 rồi L3 trực tiếp trên Google Sheets',
    'https://fcs.breaths.live/app'
  ];

  const row3 = [
    'DEV-2026-003',
    '18/09/2026 09:10:00',
    'Chairman Victor Chuyen',
    'CHAIRMAN',
    'MỤC TIÊU PHÁT TRIỂN',
    'Tạo trợ lý AI Chat Support Kỹ Thuật ghi nhận lỗi ngay bên trong app',
    'Mọi nội dung trao đổi tự động lưu vào tab IN ( Data - Mục Tiêu -KQ đầu ra là gì )',
    'Tích hợp AI Dev Support Chatbot trong app, tự động lưu mọi trao đổi vào Google Sheet và file MD, AI tự động fix bug theo tinh thần OPC 1-người vận hành',
    'P1 - NGHIÊM TRỌNG',
    'GĐ1 & GĐ2',
    'ĐÃ TRIỂN KHAI HOÀN TẤT',
    'Xây dựng DevSupportChatbot.tsx, kết nối Google Sheets tab 2091308375 và CLIENT_FEEDBACK_AND_ACCEPTANCE_LOG.md',
    'https://fcs.breaths.live/app'
  ];

  const tsvText = [headers.join('\t'), row1.join('\t'), row2.join('\t'), row3.join('\t')].join('\n');

  ws.on('open', () => {
    // Select cell A1 and trigger paste event
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const tsv = ${JSON.stringify(tsvText)};
          
          // Focus the canvas or formula bar
          const target = document.querySelector('.grid-canvas') || document.querySelector('.cell-input') || document.body;
          target.focus();
          
          const dt = new DataTransfer();
          dt.setData('text/plain', tsv);
          
          const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dt,
            bubbles: true,
            cancelable: true
          });
          
          target.dispatchEvent(pasteEvent);
          return { success: true, rows: 4 };
        })()`,
        returnByValue: true
      }
    }));
  });
  
  ws.on('message', (data) => {
    const res = JSON.parse(data);
    console.log('Paste result:', res.result?.result?.value || res.result?.value);
    ws.close();
  });
}
main();
