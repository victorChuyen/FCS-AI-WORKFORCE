import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PipelineFunnelData, Worker } from '../types';
import { WorkerTable } from '../components/workers/WorkerTable';
import {
  GitFork,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Award,
  ChevronDown,
  RefreshCw,
  Info,
  Briefcase,
} from 'lucide-react';

export const PipelinePage: React.FC = () => {
  const { navigateTo, refreshKey, showNotification, currentUser } = useApp();
  const [funnel, setFunnel] = useState<PipelineFunnelData[]>([]);
  const [selectedStageKey, setSelectedStageKey] = useState<string>('ALL');
  const [stageWorkers, setStageWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  const fetchFunnel = async () => {
    setLoading(true);
    try {
      const res = await api.getPipelineFunnel();
      if (res.data) {
        setFunnel(res.data);
      }
    } catch (err: any) {
      showNotification('Không thể tải dữ liệu Pipeline', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const fetchStageWorkers = async (stageKey: string) => {
    setLoadingWorkers(true);
    try {
      const res = await api.getWorkers({
        status: stageKey !== 'ALL' ? stageKey : undefined,
      });
      if (res.data) {
        setStageWorkers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    fetchFunnel();
  }, [refreshKey]);

  useEffect(() => {
    fetchStageWorkers(selectedStageKey);
  }, [selectedStageKey, refreshKey]);

  if (loading && funnel.length === 0) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Đang tải phễu tuyển dụng Pipeline...</p>
      </div>
    );
  }

  const selectedStageObj = funnel.find(s => s.stageKey === selectedStageKey);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
            <span className="inline-flex items-center space-x-1 font-extrabold text-blue-700 uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5" />
              <span>Phễu chuyển đổi</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.tenantId || 'FCS-000001'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pipeline tuyển dụng & VWW
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi dòng chảy lao động độc lập của {currentUser.companyName || 'FCS-000001'} qua 7 chặng tiêu chuẩn và cảnh báo điểm nghẽn SLA theo thời gian thực.
          </p>
        </div>

        <button
          onClick={fetchFunnel}
          className="self-start sm:self-center inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Cập nhật phễu</span>
        </button>
      </div>

      {/* Funnel Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {funnel.map((stage, idx) => {
          const isSelected = selectedStageKey === stage.stageKey;
          const isVWW = stage.stageKey === 'VWW';
          return (
            <div
              key={stage.stageKey}
              onClick={() => setSelectedStageKey(stage.stageKey)}
              className={`rounded-xl border p-4 transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs'
              } ${isVWW ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Chặng {idx + 1}
                  </span>
                  {isVWW && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                      ★ North Star
                    </span>
                  )}
                  {isSelected && !isVWW && (
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Đang xem</span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900">{stage.stageName}</h3>
                  <span className={`text-2xl font-black ${isVWW ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {stage.count}
                  </span>
                </div>

                {isVWW && (
                  <p className="text-[11px] text-emerald-700 font-medium tracking-tight mb-2">
                    Verified Working — VWW
                  </p>
                )}

                {/* SLA Warning if exists */}
                {stage.slaWarning ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start space-x-2 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium leading-snug">{stage.slaWarning}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>Thời gian luân chuyển ổn định</span>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
                <span>{isSelected ? 'Đang lọc danh sách' : 'Xem danh sách'}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail & Workers List */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Lao động thuộc chặng: {selectedStageObj ? selectedStageObj.stageName : 'Tất cả'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                {stageWorkers.length} người
              </span>
            </h3>
            {selectedStageObj?.slaWarning && (
              <p className="text-xs text-amber-700 font-medium mt-0.5">
                Điểm nghẽn cần lưu ý: {selectedStageObj.slaWarning}
              </p>
            )}
          </div>

          {selectedStageKey !== 'ALL' && (
            <button
              onClick={() => setSelectedStageKey('ALL')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-center cursor-pointer"
            >
              Xem toàn bộ lao động
            </button>
          )}
        </div>

        <WorkerTable
          workers={stageWorkers}
          onSelectWorker={workerId => navigateTo(`/workers/${workerId}`)}
          loading={loadingWorkers}
        />
      </div>
    </div>
  );
};
