import React, { useState, useEffect } from 'react';
import { CrmDeal, LevelSaleCode } from '../../types/deal.types';
import { WorkerStatus } from '../../types/worker.types';
import { LEVEL_SALE_LIST, getStageMeta, VALID_STAGE_TRANSITIONS, validateDealStageTransition } from './kanbanData';
import { dealApi } from '../../services/api/dealApi';
import { workerApi } from '../../services/api/workerApi';
import { X, ArrowRight, CheckCircle, AlertCircle, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';

interface MoveDealStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: CrmDeal | null;
  onSuccess: () => void;
}

export const MoveDealStageModal: React.FC<MoveDealStageModalProps> = ({
  isOpen,
  onClose,
  deal,
  onSuccess,
}) => {
  const [selectedStage, setSelectedStage] = useState<LevelSaleCode>('C3');
  const [notes, setNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deal) {
      setSelectedStage(deal.level_sale_status);
      setNotes('');
      setInterviewDate(deal.interview_date || '');
      setStartDate(deal.start_date || '');
      setIsAdminOverride(false);
      setError(null);
    }
  }, [deal]);

  if (!isOpen || !deal) return null;

  const currentMeta = getStageMeta(deal.level_sale_status);
  const targetMeta = getStageMeta(selectedStage);
  const allowedNextStages = VALID_STAGE_TRANSITIONS[deal.level_sale_status] || [];
  const isDirectlyAllowed = allowedNextStages.includes(selectedStage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage) return;

    // Validate using Finite State Machine
    const validation = validateDealStageTransition(deal.level_sale_status, selectedStage, {
      interviewDate,
      startDate,
      notes,
      isAdminOverride,
    });

    if (!validation.isValid) {
      setError(validation.error || 'Chuyển trạng thái không hợp lệ theo quy trình phễu.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let finalNotes = notes.trim();
      if (isAdminOverride) {
        finalNotes = `[ADMIN OVERRIDE: ${finalNotes}]`;
      }
      if (selectedStage.startsWith('L2') && interviewDate) {
        finalNotes = `[Hẹn PV: ${interviewDate}] ${finalNotes}`.trim();
      } else if (selectedStage.startsWith('L3') && startDate) {
        finalNotes = `[Đi làm: ${startDate}] ${finalNotes}`.trim();
      }

      // 1. Move Deal Stage
      const res = await dealApi.moveDealStage(deal.deal_id, selectedStage, finalNotes);
      if (res.success) {
        // 2. Auto-conversion / Auto-sync worker status (Giai đoạn 3)
        const workerTargetId = deal.worker_id;
        if (workerTargetId) {
          try {
            if (selectedStage === 'L3') {
              // Deal đạt VWW -> Cập nhật trạng thái Worker sang WORKING & Đã xác minh
              await workerApi.updateWorkerStatus(
                workerTargetId,
                WorkerStatus.WORKING,
                `Auto-sync: Đạt mốc L3 (VWW) từ Deal ${deal.deal_id}. Ngày đi làm: ${startDate || 'Hôm nay'}`
              );
            } else if (selectedStage === 'L3.1') {
              // Nghỉ ngang -> Cập nhật trạng thái Worker sang QUIT
              await workerApi.updateWorkerStatus(
                workerTargetId,
                WorkerStatus.QUIT,
                `Auto-sync: Nghỉ ngang L3.1 từ Deal ${deal.deal_id}. Lý do: ${notes}`
              );
            } else if (selectedStage === 'L2.1') {
              // Đỗ phỏng vấn -> Cập nhật trạng thái Worker sang PASSED
              await workerApi.updateWorkerStatus(
                workerTargetId,
                WorkerStatus.PASSED,
                `Auto-sync: Đỗ phỏng vấn xưởng ${deal.target_company} từ Deal ${deal.deal_id}`
              );
            }
          } catch (syncErr) {
            console.warn('Lỗi auto-sync worker status từ deal:', syncErr);
          }
        }

        onSuccess();
        onClose();
      } else {
        setError(res.error?.message || 'Không thể chuyển trạng thái Level Sale');
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi hệ thống khi cập nhật Deal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <h3 className="text-base font-extrabold text-slate-900">
                Chuyển Trạng Thái 19 Level Sale
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deal: <strong className="font-mono text-teal-800">{deal.deal_id}</strong> • {deal.full_name} ({deal.target_company})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start space-x-2.5 shadow-2xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-[11px] text-red-900">Vi phạm quy tắc chuyển trạng thái:</span>
                <span className="text-xs leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {/* Current vs Target Preview */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Hiện tại</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${currentMeta.badgeBg}`}>
                {currentMeta.name}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Chuyển sang</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${targetMeta.badgeBg}`}>
                {targetMeta.name}
              </span>
            </div>
          </div>

          {/* Stage Dropdown Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                Chọn Trạng Thái Đích (19 Level Sale) *
              </label>
              {!isDirectlyAllowed && !isAdminOverride && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Nhảy cóc (Cần Admin)
                </span>
              )}
              {isDirectlyAllowed && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                  <span>✓</span>
                  <span>Đúng phễu BA 1.5</span>
                </span>
              )}
            </div>

            <select
              value={selectedStage}
              onChange={e => {
                setSelectedStage(e.target.value as LevelSaleCode);
                setError(null);
              }}
              className={`w-full px-3 py-2.5 border rounded-xl text-xs font-semibold focus:ring-2 bg-white transition-colors cursor-pointer ${
                !isDirectlyAllowed && !isAdminOverride
                  ? 'border-amber-400 bg-amber-50/20 focus:ring-amber-400'
                  : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
              }`}
            >
              {LEVEL_SALE_LIST.map(st => {
                const isNext = allowedNextStages.includes(st.code);
                return (
                  <option key={st.code} value={st.code}>
                    {isNext ? '🟢' : '⚪'} {st.name} ({st.group})
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {targetMeta.description}
            </p>
          </div>

          {/* Admin Override Toggle */}
          {!isDirectlyAllowed && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAdminOverride}
                  onChange={e => setIsAdminOverride(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-extrabold text-amber-900 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 inline" />
                  <span>Kích hoạt quyền Quản trị viên (Admin Override)</span>
                </span>
              </label>
              <p className="text-[11px] text-amber-800 leading-normal pl-6">
                Chuyển trạng thái nhảy cóc từ <strong>{deal.level_sale_status}</strong> sang <strong>{selectedStage}</strong> sẽ được ghi lại trong sổ cái <code>AUDIT_LOG</code> kèm danh tính tài khoản thao tác.
              </p>
            </div>
          )}

          {/* Conditional Input for Interview (L2) */}
          {selectedStage.startsWith('L2') && selectedStage === 'L2' && (
            <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-xl space-y-1">
              <label className="block font-bold text-blue-900">
                Ngày Hẹn Phỏng Vấn Tại Xưởng *
              </label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={e => setInterviewDate(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <p className="text-[10px] text-blue-700">
                Lịch phỏng vấn sẽ được đồng bộ sang hồ sơ Worker và gửi thông báo tới cán bộ hiện trường.
              </p>
            </div>
          )}

          {/* Conditional Input for Working (L3) */}
          {selectedStage === 'L3' && (
            <div className="p-3 bg-emerald-50/40 border border-emerald-300 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-900 font-extrabold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xác nhận Lao động Đi làm Thực tế (VWW) *</span>
              </div>
              <label className="block font-bold text-slate-700 text-[11px] mt-1">
                Ngày Bắt Đầu Đi Làm Chính Thức *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="text-[10px] text-emerald-800 leading-normal">
                Hệ thống sẽ tự động gán cờ <strong>VWW = TRUE</strong> và kích hoạt chu trình <strong>Chăm sóc Onboarding 1-3-7 ngày</strong>.
              </p>
            </div>
          )}

          {/* Conditional Input for Quit (L3.1) */}
          {selectedStage === 'L3.1' && (
            <div className="p-3 bg-rose-50/40 border border-rose-300 rounded-xl space-y-1">
              <label className="block font-bold text-rose-900">
                Lý Do Nghỉ Ngang / Nghỉ Việc *
              </label>
              <textarea
                rows={2}
                required
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="VD: Không quen làm ca đêm, gia đình có việc, đã về quê..."
                className="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 bg-white"
              />
              <p className="text-[10px] text-rose-700">
                Hồ sơ sẽ được chuyển vào hàng đợi Tái Kích Hoạt Zalo 0đ để phục vụ tuyển dụng lại sau 15-30 ngày.
              </p>
            </div>
          )}

          {/* General Notes / Reason for Audit Log */}
          {selectedStage !== 'L3.1' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Lý Do / Ghi Chú Cập Nhật {isAdminOverride ? '(Bắt buộc khi Override) *' : '(Audit Trail)'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="VD: Lao động đồng ý ca phỏng vấn sáng thứ 5 tuần này..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || selectedStage === deal.level_sale_status || (!isDirectlyAllowed && !isAdminOverride)}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang ghi nhận...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Lưu & Ghi Audit Log</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
