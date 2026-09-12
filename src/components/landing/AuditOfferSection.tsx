import React, { useState } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  Info,
  Layers,
  MapPin,
  Calendar,
  MessageSquare,
  Award,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import {
  submitConsultationRequest,
  ConsultationRequest,
} from '../../services/consultation';

export const AuditOfferSection: React.FC = () => {
  const [formData, setFormData] = useState<ConsultationRequest>({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    officeCount: '1',
    workforceScale: '100 - 500 lao động',
    bottleneck: 'Tỷ lệ bùng phỏng vấn & bùng ca ngày đầu cao',
  });

  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, số điện thoại và email liên hệ.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitConsultationRequest(formData);
      if (res.success) {
        setSuccessResult(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi khi gửi thông tin khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="audit-offer-section" className="py-16 sm:py-24 bg-slate-900/40 border-y border-slate-800/80">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        
        {/* TẦNG 1: MAIN CONTAINER - AUDIT PROGRAM & REGISTRATION FORM */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
            {/* Left Column: Deliverables & Blueprint Visual Preview (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CHƯƠNG TRÌNH KHẢO SÁT & CHẨN ĐOÁN MIỄN PHÍ</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
                FCS AI WORKFORCE AUDIT & BLUEPRINT
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Chúng tôi không cố bán phần mềm khi chưa hiểu rõ bài toán thực tế của bạn. Hãy bắt đầu từ việc chẩn đoán chính xác điểm rò rỉ lớn nhất trong quy trình cung ứng lao động hiện tại.
              </p>

              {/* What they get - 4 Key Deliverables */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Những gì doanh nghiệp bạn nhận được (Hoàn toàn miễn phí):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">Bản đồ luồng tiếp nhận</strong>
                      <span className="text-[11px] text-slate-400 leading-tight block">Đối soát chuẩn Golden Flow 8 chặng</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">Điểm rò rỉ ứng viên</strong>
                      <span className="text-[11px] text-slate-400 leading-tight block">Đo lường % hao hụt phỏng vấn & bùng ca</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">Chẩn đoán đối soát công</strong>
                      <span className="text-[11px] text-slate-400 leading-tight block">Khử sai lệch bảng công nhà máy & CTV</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-xs block">Mô hình 1 Quản lý</strong>
                      <span className="text-[11px] text-slate-400 leading-tight block">Định biên kiểm soát trọn vẹn 300+ lao động</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blueprint Mockup Visual Showcase */}
              <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl group bg-slate-950">
                <img
                  src="/images/audit-blueprint-showcase.jpg"
                  alt="FCS AI Workforce OS Confidential Audit Blueprint Showcase"
                  className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 text-amber-300 text-[10px] font-mono font-bold border border-amber-400/30 backdrop-blur-md">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>MẪU BẢN ĐỒ BLUEPRINT BÀN GIAO</span>
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono bg-blue-950/80 px-2 py-0.5 rounded border border-blue-600/40">
                    PDF & Live Sheets
                  </span>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Cam kết bảo mật dữ liệu NDA. Chúng tôi không bao giờ chia sẻ thông tin hoặc bảng công của doanh nghiệp bạn cho bất kỳ bên thứ ba nào.
                </p>
              </div>
            </div>

            {/* Right Column: Clean Consultation Form (6 cols) */}
            <div className="lg:col-span-6 bg-slate-950/95 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl">
              {successResult ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Đã tiếp nhận yêu cầu Audit!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    {successResult}
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    Chuyên gia của FCS sẽ liên hệ trong vòng 24 giờ làm việc để gửi bản Blueprint sơ bộ.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessResult(null);
                      setFormData({
                        fullName: '',
                        phone: '',
                        email: '',
                        companyName: '',
                        officeCount: '1',
                        workforceScale: '100 - 500 lao động',
                        bottleneck: 'Tỷ lệ bùng phỏng vấn & bùng ca ngày đầu cao',
                      });
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    Gửi thêm thông tin khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Đăng ký nhận Blueprint giải pháp</span>
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      MIỄN PHÍ 100%
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* 2 Cols: Họ tên & SĐT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Họ và tên của bạn *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="VD: Nguyễn Văn Hùng"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Số điện thoại Zalo *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="VD: 0912 345 678"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* 2 Cols: Email & Tên doanh nghiệp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email nhận bản đồ Blueprint *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="VD: hung@nhanlucviet.vn"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Tên doanh nghiệp / Đơn vị cung ứng
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({ ...formData, companyName: e.target.value })
                        }
                        placeholder="VD: Công ty Nhân lực Bắc Ninh"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* 2 Cols: Số văn phòng & Quy mô lao động */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Số văn phòng / chi nhánh hiện tại
                      </label>
                      <select
                        value={formData.officeCount}
                        onChange={(e) =>
                          setFormData({ ...formData, officeCount: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="1">1 văn phòng duy nhất</option>
                        <option value="2 - 3">2 - 3 văn phòng / chi nhánh</option>
                        <option value="4 - 10">4 - 10 văn phòng / chi nhánh</option>
                        <option value="Trên 10">Trên 10 văn phòng toàn quốc</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Quy mô lao động đang quản lý
                      </label>
                      <select
                        value={formData.workforceScale}
                        onChange={(e) =>
                          setFormData({ ...formData, workforceScale: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="Dưới 100 lao động">Dưới 100 lao động</option>
                        <option value="100 - 500 lao động">100 - 500 lao động</option>
                        <option value="500 - 2,000 lao động">500 - 2,000 lao động</option>
                        <option value="Trên 2,000 lao động">Trên 2,000 lao động</option>
                      </select>
                    </div>
                  </div>

                  {/* Điểm nghẽn lớn nhất */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Điểm nghẽn lớn nhất bạn muốn khắc phục ngay
                    </label>
                    <textarea
                      rows={2}
                      value={formData.bottleneck}
                      onChange={(e) =>
                        setFormData({ ...formData, bottleneck: e.target.value })
                      }
                      placeholder="VD: Trôi tin Zalo nhiều, tỷ lệ bùng ca ngày đầu cao, đối soát công giấy tờ chậm trễ..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-600/30 min-h-[48px]"
                    >
                      {loading ? (
                        <span>ĐANG GỬI THÔNG TIN...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>NHẬN BẢN ĐỒ GIẢI PHÁP PHÙ HỢP (BLUEPRINT)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* TẦNG 2: FULL-WIDTH EXECUTIVE FOUNDER CONSULTATION SHOWCASE (CHAIRMAN VICTOR CHUYEN) */}
        <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-gradient-to-r from-blue-950/95 via-indigo-950/80 to-slate-900/95 border border-blue-500/40 shadow-2xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left: Founder Photo & Credibility (7 cols) */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Founder Real Portrait with Verified Gold Frame */}
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-amber-400/80 p-1 bg-gradient-to-tr from-amber-500/20 to-blue-500/20 shadow-2xl shadow-amber-500/20">
                  <img
                    src="/images/chairman-victor-chuyen.jpg"
                    alt="Chairman Victor Chuyen"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider shadow-md flex items-center space-x-1 border border-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>ONLINE 1:1</span>
                </div>
              </div>

              {/* Founder Information & Value Statement */}
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>VIP FOUNDER ADVISORY</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Chairman Victor Chuyen
                </h3>

                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                  Founder TNC Group • Tác giả mô hình OPC-TNC & FCS AI Workforce OS
                </p>

                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  Trực tiếp cố vấn chiến lược 1:1 cho các Chủ doanh nghiệp cung ứng nhân lực & Chi nhánh tuyển dụng để chuẩn hóa quy trình, bịt kín điểm rò rỉ và nhân bản quy mô vận hành.
                </p>

                {/* 3 Real-world Proof Badges */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300">
                    <strong className="text-amber-400">12+ Năm</strong> Kinh nghiệm thực tế
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300">
                    <strong className="text-blue-400">30.000+</strong> Lao động điều phối
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300">
                    <strong className="text-emerald-400">100%</strong> Chuẩn VWW
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Direct Action Card & Buttons (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-blue-500/30 rounded-2xl p-5 sm:p-6 space-y-4 text-center sm:text-left shadow-xl">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 block mb-1">
                  ĐẶT LỊCH TRỰC TIẾP QUA GOOGLE MEET / ZOOM
                </span>
                <h4 className="text-base font-bold text-white leading-snug">
                  Phiên Tư Vấn Chiến Lược 20 Phút 1:1
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Khảo sát nhanh cấu trúc chi phí & luồng vận hành của doanh nghiệp bạn. Cam kết giải quyết bài toán rò rỉ ứng viên và trôi tin Zalo.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Cal.com Primary Button */}
                <a
                  href="https://cal.com/victorchuyen/coachai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-blue-900/50 transition-all cursor-pointer border border-blue-400/30"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>ĐẶT LỊCH DEMO 20P VỚI CHAIRMAN</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                {/* Zalo Direct Button */}
                <a
                  href="https://zalo.me/0989890022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-emerald-950/50 transition-all cursor-pointer border border-emerald-400/30"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>CHAT TRỰC TIẾP ZALO: 0989.890.022</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>

              <div className="text-[10px] text-slate-500 text-center font-mono">
                Ưu tiên xếp lịch cho Doanh nghiệp & Chi nhánh từ 100 - 3.000+ lao động
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
