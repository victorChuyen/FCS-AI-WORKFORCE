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
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
            {/* Left Column: Offer Details & Deliverables (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CHƯƠNG TRÌNH KHẢO SÁT & CHẨN ĐOÁN MIỄN PHÍ</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
                FCS AI WORKFORCE AUDIT & BLUEPRINT
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Chúng tôi không cố bán phần mềm cho bạn khi chưa hiểu rõ bài toán. Hãy bắt đầu từ việc chẩn đoán chính xác điểm rò rỉ lớn nhất trong quy trình cung ứng lao động hiện tại.
              </p>

              {/* What they get */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Những gì bạn sẽ nhận được (Hoàn toàn miễn phí):
                </div>

                <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Bản đồ luồng tiếp nhận:</strong> So sánh luồng tiếp nhận hiện tại của bạn với chuẩn mực Golden Flow 8 chặng.
                  </span>
                </div>

                <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Điểm rò rỉ ứng viên lớn nhất:</strong> Chỉ rõ bạn đang thất thoát bao nhiêu phần trăm ứng viên và chi phí ở khâu nào.
                  </span>
                </div>

                <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Chẩn đoán rủi ro đối soát công:</strong> Đánh giá mức độ sai lệch bảng công với nhà máy và CTV.
                  </span>
                </div>

                <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Đề xuất mô hình 1 Quản lý:</strong> Thiết kế định biên nhân sự để 1 người kiểm soát trọn vẹn 300+ lao động.
                  </span>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Thông tin được bảo mật tuyệt đối. Chúng tôi không bao giờ chia sẻ dữ liệu doanh nghiệp của bạn cho bên thứ ba.
                </p>
              </div>
            </div>

            {/* Right Column: Clean Consultation Form (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
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
      </div>
    </section>
  );
};
