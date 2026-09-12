import React, { useState } from 'react';
import { Worker, DuplicateWorkerInfo } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge, VWWBadge } from '../common/Badge';
import { formatPhone, formatCccd } from '../../utils/formatters';
import { AlertTriangle, Eye, X, ShieldAlert, Check } from 'lucide-react';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingWorker: DuplicateWorkerInfo | Worker | null;
  onViewProfile: (workerId: string) => void;
  onCancel: () => void;
  onOverrideCreate: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  onClose,
  existingWorker,
  onViewProfile,
  onCancel,
  onOverrideCreate,
}) => {
  const [confirmingForceCreate, setConfirmingForceCreate] = useState<boolean>(false);

  if (!existingWorker) return null;

  const currentStatus =
    (existingWorker as DuplicateWorkerInfo).currentStatus ||
    (existingWorker as Worker).status ||
    'NEW';

  const formatMatchReason = (reason?: string) => {
    switch (reason) {
      case 'PHONE':
        return 'Trùng số điện thoại (PHONE)';
      case 'CCCD':
        return 'Trùng số CCCD (CCCD)';
      case 'NAME_DOB':
        return 'Trùng họ tên và ngày sinh (NAME_DOB)';
      default:
        return reason || 'Trùng số điện thoại hoặc CCCD với hồ sơ nhân sự hiện có';
    }
  };

  const handleClose = () => {
    setConfirmingForceCreate(false);
    onClose();
  };

  const handleCancel = () => {
    setConfirmingForceCreate(false);
    onCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Có khả năng lao động này đã tồn tại"
      subtitle="Hệ thống phát hiện hồ sơ nhân sự trùng khớp trong cơ sở dữ liệu"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start space-x-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Cảnh báo trùng lặp:</span> Hệ thống không tự động tạo
            lao động thứ hai nếu phát hiện trùng thông tin định danh. Vui lòng kiểm tra hồ sơ hiện tại trước
            khi quyết định.
          </div>
        </div>

        {/* Existing Worker Profile Card */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold">Worker ID:</span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {existingWorker.workerId}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold">Trạng thái:</span>
              <StatusBadge status={currentStatus as any} size="sm" />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Họ tên:</div>
            <h4 className="text-base font-extrabold text-slate-900">{existingWorker.fullName}</h4>
            <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Số điện thoại:</span>{' '}
                <span className="font-semibold text-slate-800">{formatPhone(String(existingWorker.phone))}</span>
              </div>
              {'cccd' in existingWorker && existingWorker.cccd ? (
                <div>
                  <span className="text-slate-400">CCCD:</span>{' '}
                  <span className="font-semibold text-slate-800">{formatCccd(existingWorker.cccd)}</span>
                </div>
              ) : null}
              {'province' in existingWorker && existingWorker.province ? (
                <div>
                  <span className="text-slate-400">Tỉnh/Thành:</span>{' '}
                  <span className="font-semibold text-slate-800">{existingWorker.province}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Match Reason */}
          <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-lg text-xs text-amber-950">
            <span className="font-bold">Lý do trùng:</span> {formatMatchReason(existingWorker.matchReason)}
          </div>

          {existingWorker.isVerifiedWorking && (
            <div className="pt-2 border-t border-slate-100">
              <VWWBadge isVWW={true} size="sm" />
            </div>
          )}
        </div>

        {/* Confirmation State for TẠO RIÊNG */}
        {confirmingForceCreate ? (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  Xác nhận tạo hồ sơ riêng
                </h5>
                <p className="text-xs text-rose-800 mt-1 font-semibold">
                  Bạn chắc chắn muốn tạo một hồ sơ riêng?
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Hệ thống sẽ tạo mã lao động mới độc lập với cờ forceCreate: true.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-rose-200">
              <button
                type="button"
                onClick={() => setConfirmingForceCreate(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer"
              >
                QUAY LẠI
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingForceCreate(false);
                  onOverrideCreate();
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center space-x-1 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>XÁC NHẬN TẠO RIÊNG</span>
              </button>
            </div>
          </div>
        ) : (
          /* 3 Strict Actions: XEM HỒ SƠ | HỦY | TẠO RIÊNG */
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onViewProfile(existingWorker.workerId)}
              className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition-colors min-h-[40px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>XEM HỒ SƠ</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition-colors min-h-[40px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>HỦY</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmingForceCreate(true)}
              className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition-colors min-h-[40px]"
              title="Yêu cầu xác nhận trước khi tạo riêng"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>TẠO RIÊNG</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
