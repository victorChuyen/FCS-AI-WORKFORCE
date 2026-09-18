import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Sparkles, Phone, Building2, Mail, User, HelpCircle, ShieldCheck } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { submitConsultationRequest } from '../../services/consultation';

export interface LeadModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  show,
  onClose,
  title = 'Đăng ký Nhận AI Workforce Blueprint & Tư Vấn 1:1',
  subtitle = 'Nhận bản đồ phân tích luồng điều hành lao động thực tế từ đội ngũ chuyên gia FCS.',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    scale: '100 - 300 lao động',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại liên hệ.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sync to Google Sheets via realApi.registerLead
      await realApi.registerLead({
        fullName: formData.name.trim(),
        email: formData.email.trim() || `${formData.phone.replace(/\D/g, '')}@lead.fcs.vn`,
        phone: formData.phone.trim(),
        organization: formData.company.trim() || 'Doanh nghiệp Cung ứng Lao động',
        purpose: `Tư vấn AI Blueprint - Quy mô: ${formData.scale} - Ghi chú: ${formData.note}`,
      }).catch(err => console.warn('Sync lead to sheets warning:', err));

      // 2. Save consultation backup
      await submitConsultationRequest({
        fullName: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.phone.replace(/\D/g, '')}@lead.fcs.vn`,
        companyName: formData.company.trim() || 'Chưa ghi rõ',
        officeCount: '1',
        workforceScale: formData.scale,
        bottleneck: formData.note.trim() || 'Muốn chuẩn hóa quy trình điều hành theo chuẩn VWW',
      }).catch(err => console.warn('Consultation backup warning:', err));

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.2)'
        }}
      >
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Đăng Ký Thành Công!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thông tin của bạn đã được chuyển đến bộ phận chuyên gia tư vấn FCS. Chúng tôi sẽ kết nối và gửi bản phân tích quy trình trong vòng 24 giờ.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TƯ VẤN DOANH NGHIỆP CUNG ỨNG LAO ĐỘNG</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Họ và tên người đại diện *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn Quản"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Số điện thoại (Zalo) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912 345 678"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email làm việc</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="quanly@congty.vn"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tên Doanh nghiệp / Đơn vị</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Công ty Cung ứng Nhân lực ABC"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Quy mô lao động hiện tại</span>
                  </label>
                  <select
                    value={formData.scale}
                    onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="Dưới 100 lao động">Dưới 100 lao động</option>
                    <option value="100 - 300 lao động">100 - 300 lao động</option>
                    <option value="300 - 500 lao động">300 - 500 lao động</option>
                    <option value="500 - 1.000 lao động">500 - 1.000 lao động</option>
                    <option value="Trên 1.000 lao động">Trên 1.000 lao động</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Điểm nghẽn hoặc yêu cầu cần hỗ trợ
                </label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ví dụ: Bị trôi thông tin trên Zalo, muốn tự động đối soát chấm công ca đêm với Luxshare/Foxconn..."
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 glow-border-hover"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Đang kết nối hệ thống...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>GỬI YÊU CẦU &amp; NHẬN TƯ VẤN MIỄN PHÍ</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <span className="text-[11px] text-slate-500">
                  🔒 Dữ liệu được bảo mật 100% theo tiêu chuẩn doanh nghiệp.
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
