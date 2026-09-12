import React, { useState } from 'react';
import { Worker, Partner } from '../../types';
import { formatPhone } from '../../utils/formatters';
import {
  X,
  Sparkles,
  MessageSquare,
  Phone,
  Copy,
  Check,
  Building,
  Send,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

interface ReactivationInviteModalProps {
  isOpen: boolean;
  worker: Worker | null;
  partners: Partner[];
  onClose: () => void;
  onSuccess?: (note: string) => void;
}

export const ReactivationInviteModal: React.FC<ReactivationInviteModalProps> = ({
  isOpen,
  worker,
  partners,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !worker) return null;

  const [selectedPartnerId, setSelectedPartnerId] = useState(
    partners[0]?.id || 'Foxconn KCN Quang Châu'
  );
  const [selectedSalary, setSelectedSalary] = useState('9.000.000 - 13.000.000 VNĐ/tháng');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  const currentPartner =
    partners.find(p => p.id === selectedPartnerId)?.name || selectedPartnerId;
  const cleanPhone = (worker.phone || '').replace(/\D/g, '');

  const generatedMessage = `Chào anh/chị ${worker.fullName}, em là quản lý nhân sự tại FCS.
FCS hiện đang có đợt tuyển dụng ưu tiên tại đối tác ${currentPartner} với mức thu nhập ${selectedSalary} (bao cơm ca + xe đưa đón).

Vì anh/chị đã có lịch sử làm việc tốt tại FCS trước đây, hồ sơ của anh/chị được ĐẶC CÁCH ĐI LÀM NGAY mà không cần phỏng vấn lại.
Dự kiến có chuyến xe đón tại ${worker.province || 'tỉnh nhà'} vào đầu tuần tới.

Anh/chị có muốn đăng ký giữ vị trí đợt này không ạ? Anh/chị phản hồi tin nhắn này để em giữ suất ưu tiên nhé!`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenZalo = () => {
    handleCopy();
    if (cleanPhone) {
      window.open(`https://zalo.me/${cleanPhone}`, '_blank');
    }
  };

  const handleRecordFeedback = (status: 'AGREED' | 'CONSIDERING' | 'DECLINED') => {
    const labelMap = {
      AGREED: 'Lao động đồng ý quay lại làm việc',
      CONSIDERING: 'Lao động đang cân nhắc',
      DECLINED: 'Lao động bận chưa thể đi làm',
    };
    onSuccess?.(`${labelMap[status]} - Đơn hàng: ${currentPartner}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black bg-white/20 uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3 h-3" />
                <span>Re-activation Engine</span>
              </span>
              <span className="text-xs text-blue-100 font-medium">• Tuyển dụng 0đ</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Mời cựu lao động quay lại làm việc
            </h3>
            <p className="text-xs text-blue-100/90 mt-0.5">
              Hồ sơ: <span className="font-semibold text-white">{worker.fullName}</span> (
              <span className="font-mono">{worker.workerId}</span>)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Partner & Salary selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Chọn nhà máy / Xưởng
              </label>
              <select
                value={selectedPartnerId}
                onChange={e => setSelectedPartnerId(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {partners.length > 0 ? (
                  partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Foxconn KCN Quang Châu">Foxconn KCN Quang Châu</option>
                    <option value="Luxshare KCN Vân Trung">Luxshare KCN Vân Trung</option>
                    <option value="Hana Micron KCN Vân Trung">Hana Micron KCN Vân Trung</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Gói thu nhập chào mời
              </label>
              <select
                value={selectedSalary}
                onChange={e => setSelectedSalary(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="8.500.000 - 11.500.000 VNĐ/tháng">8.5 - 11.5 triệu/tháng</option>
                <option value="9.000.000 - 13.000.000 VNĐ/tháng">9.0 - 13.0 triệu/tháng (Chuyên cần)</option>
                <option value="10.000.000 - 14.500.000 VNĐ/tháng">10.0 - 14.5 triệu/tháng (Tăng ca cao)</option>
              </select>
            </div>
          </div>

          {/* AI Pre-filled message preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Kịch bản tin nhắn AI soạn riêng</span>
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép tin'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={generatedMessage}
              rows={6}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-sans leading-relaxed focus:outline-hidden"
            />
          </div>

          {/* Primary 1-Click Send Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleOpenZalo}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>GỬI QUA ZALO</span>
            </button>

            {worker.phone ? (
              <a
                href={`tel:${worker.phone}`}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>GỌI: {formatPhone(worker.phone)}</span>
              </a>
            ) : (
              <button
                disabled
                className="w-full py-2.5 px-3 bg-slate-200 text-slate-400 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>Chưa có SĐT</span>
              </button>
            )}
          </div>

          {/* Quick Record Response */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">
              Ghi nhận phản hồi nhanh của lao động:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRecordFeedback('AGREED')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Đồng ý đi làm
              </button>
              <button
                onClick={() => handleRecordFeedback('CONSIDERING')}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Đang cân nhắc
              </button>
              <button
                onClick={() => handleRecordFeedback('DECLINED')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Chưa có nhu cầu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
