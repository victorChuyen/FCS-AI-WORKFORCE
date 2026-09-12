import React from 'react';

export const FloatingVipContact: React.FC = () => {
  return (
    <>
      <style>{`
        /* ── LUXURY FLOATING CONTACT DOCK (CHUẨN HANOTOUR ENTERPRISE CỦA CHAIRMAN VICTOR) ── */
        .luxury-contact-dock {
            position: fixed;
            right: 20px;
            bottom: max(28px, calc(20px + env(safe-area-inset-bottom)));
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 99990;
            pointer-events: auto;
        }

        .dock-btn {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            text-decoration: none;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0,0,0,0.1);
            transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s ease, filter 0.28s ease;
            cursor: pointer;
            border: 1.5px solid rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(8px);
            user-select: none;
        }

        .dock-icon-box {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            transition: transform 0.28s ease;
        }

        .dock-tooltip {
            position: absolute;
            right: 64px;
            background: rgba(15, 23, 42, 0.94);
            color: #ffffff;
            font-family: inherit;
            font-size: 11.5px;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 8px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transform: translateX(10px);
            transition: opacity 0.22s ease, transform 0.22s ease;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(12px);
        }

        .dock-tooltip::after {
            content: "";
            position: absolute;
            top: 50%;
            right: -5px;
            transform: translateY(-50%);
            border-width: 5px 0 5px 5px;
            border-style: solid;
            border-color: transparent transparent transparent rgba(15, 23, 42, 0.94);
        }

        .dock-btn:hover .dock-tooltip {
            opacity: 1;
            transform: translateX(0);
        }

        .dock-btn:hover {
            transform: scale(1.12) translateY(-2px);
        }

        .dock-btn:hover .dock-icon-box {
            transform: scale(1.1);
        }

        /* 1. Nút AI Support (Hồng ngọc Ruby) */
        .dock-btn-visa {
            background: linear-gradient(135deg, #a00037, #d81b60);
            box-shadow: 0 8px 24px rgba(216, 27, 96, 0.45);
        }
        .dock-btn-visa:hover {
            box-shadow: 0 12px 30px rgba(216, 27, 96, 0.7);
        }

        /* 2. Nút Zalo OA (Trắng viền xanh biển) */
        .dock-btn-zalo {
            background: #ffffff;
            border: 1.5px solid #0084ff;
            box-shadow: 0 8px 24px rgba(0, 132, 255, 0.35);
        }
        .dock-btn-zalo:hover {
            box-shadow: 0 12px 30px rgba(0, 132, 255, 0.6);
        }

        /* 3. Nút Hotline (Đỏ san hô pulse) */
        .dock-btn-phone {
            background: linear-gradient(135deg, #ff4757, #ff6b81);
            box-shadow: 0 8px 24px rgba(255, 71, 87, 0.4);
            animation: phonePulse 2.4s infinite;
        }
        .dock-btn-phone:hover {
            box-shadow: 0 12px 30px rgba(255, 71, 87, 0.65);
        }

        /* 4. Nút Cal.com Đặt lịch tư vấn 1:1 (Xanh Sapphire/Indigo) */
        .dock-btn-cal {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
        }
        .dock-btn-cal:hover {
            box-shadow: 0 12px 30px rgba(79, 70, 229, 0.7);
        }

        @keyframes phonePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
        }

        @media (max-width: 768px) {
            .luxury-contact-dock {
                right: 14px !important;
                bottom: max(20px, calc(16px + env(safe-area-inset-bottom))) !important;
                gap: 10px !important;
                z-index: 99990 !important;
            }
            .dock-btn {
                width: 44px !important;
                height: 44px !important;
            }
            .dock-icon-box img {
                width: 24px !important;
                height: 24px !important;
            }
            .dock-icon-box svg {
                width: 20px !important;
                height: 20px !important;
            }
            .dock-tooltip {
                display: none !important;
            }
        }
      `}</style>

      {/* LUXURY FLOATING CONTACT DOCK */}
      <div className="luxury-contact-dock" id="luxuryContactDock">
        {/* 1. AI Support (Gemini Bot - Link để trống theo chỉ đạo Chairman Victor) */}
        <a
          rel="nofollow"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert('Trợ lý AI FCS Workforce đang được chuẩn bị. Chairman Victor sẽ gửi liên kết chính thức sớm!');
          }}
          className="dock-btn dock-btn-visa"
          aria-label="Tư vấn AI 24/7"
        >
          <span className="dock-tooltip">🤖 AI Thẩm Định Lao Động (Tư vấn 24/7)</span>
          <div className="dock-icon-box">
            <img
              src="https://hanotour.com.vn//images/chat.svg"
              alt="AI Support"
              width={26}
              height={26}
              style={{
                width: '26px',
                height: '26px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
              }}
              onError={(e) => {
                // Fallback nếu ảnh không load được
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </a>

        {/* 2. Zalo OA / Zalo Chat Trực Tiếp */}
        <a
          rel="nofollow"
          href="https://zalo.me/0989890022"
          target="_blank"
          className="dock-btn dock-btn-zalo"
          aria-label="Tư vấn Zalo"
        >
          <span className="dock-tooltip">💬 CHÁT ZALO: 0989.890.022</span>
          <div className="dock-icon-box">
            <img
              src="/images/Zalo-100.svg"
              alt="Zalo OA"
              width={34}
              height={34}
              style={{
                width: '34px',
                height: '34px',
                objectFit: 'contain',
                borderRadius: '6px',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://hanotour.com.vn/templates/default/images/Zalo-100.svg';
              }}
            />
          </div>
        </a>

        {/* 3. Hotline 24/7 (0989890022) */}
        <a
          href="tel:0989890022"
          rel="nofollow"
          className="dock-btn dock-btn-phone"
          aria-label="Gọi Hotline 24/7"
        >
          <span className="dock-tooltip">📞 Hotline 24/7: 0989.890.022</span>
          <div className="dock-icon-box">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
        </a>

        {/* 4. Đặt Lịch Tư Vấn Chiến Lược 1:1 (Cal.com) */}
        <a
          href="https://cal.com/victorchuyen/coachai"
          target="_blank"
          rel="noopener noreferrer"
          className="dock-btn dock-btn-cal"
          aria-label="Đặt lịch tư vấn chiến lược 1:1"
        >
          <span className="dock-tooltip">📅 Đặt Lịch Tư Vấn 1:1 (Chairman Victor Chuyen)</span>
          <div className="dock-icon-box">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </a>
      </div>
    </>
  );
};
