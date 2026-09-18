import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AttendanceReviewItem, FollowUpItem, DuplicateSuspect } from '../types';
import { AttendanceReviewTab } from '../components/review/AttendanceReviewTab';
import { FollowupReviewTab } from '../components/review/FollowupReviewTab';
import { DuplicateReviewTab } from '../components/review/DuplicateReviewTab';
import {
  CheckCircle2,
  FileCheck2,
  Clock,
  Copy,
  RefreshCw,
  Briefcase,
} from 'lucide-react';

export const ReviewPage: React.FC = () => {
  const { currentRoute, navigateTo, routeParams, refreshKey, currentUser } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab selection: 'matching' | 'followup' | 'duplicate' from search params or routeParams
  const urlParam = (searchParams.get('tab') || searchParams.get('type') || routeParams.type || routeParams.tab) as string;
  const initialTab = (urlParam === 'followup' || urlParam === 'duplicate') ? urlParam : 'matching';
  const [activeTab, setActiveTab] = useState<'matching' | 'followup' | 'duplicate'>(initialTab);

  const [attendanceReviews, setAttendanceReviews] = useState<AttendanceReviewItem[]>([]);
  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>([]);
  const [duplicateItems, setDuplicateItems] = useState<DuplicateSuspect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const param = (searchParams.get('tab') || searchParams.get('type') || routeParams.type || routeParams.tab) as string;
    if (param === 'matching' || param === 'followup' || param === 'duplicate') {
      setActiveTab(param);
    }
  }, [searchParams, routeParams.type, routeParams.tab]);

  const fetchReviewData = async () => {
    setLoading(true);
    try {
      const [attRes, folRes, dupRes] = await Promise.all([
        api.getAttendanceReviews(),
        api.getFollowUpQueue(),
        api.getDuplicateSuspects(),
      ]);

      if (attRes.data) setAttendanceReviews(attRes.data);
      if (folRes.data) setFollowUpItems(folRes.data);
      if (dupRes.data) setDuplicateItems(dupRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
  }, [refreshKey]);

  const tabs = [
    {
      id: 'matching',
      label: '1. KHỚP CHẤM CÔNG',
      sublabel: 'Mở khóa VWW',
      icon: FileCheck2,
      count: attendanceReviews.length,
      badgeColor: 'bg-red-100 text-red-800',
    },
    {
      id: 'followup',
      label: '2. LAO ĐỘNG CẦN FOLLOW-UP',
      sublabel: 'Cảnh báo SLA trễ',
      icon: Clock,
      count: followUpItems.length,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'duplicate',
      label: '3. HỒ SƠ NGHI TRÙNG',
      sublabel: 'Đối chiếu CCCD/SĐT',
      icon: Copy,
      count: duplicateItems.length,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
            <span className="inline-flex items-center space-x-1 font-extrabold text-blue-700 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hàng đợi xác nhận</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.tenantId || 'FCS-000001'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Việc cần xác nhận
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chỉ những bản ghi có độ bất định hoặc quá hạn SLA của {currentUser.companyName || 'FCS-000001'} mới được đẩy vào đây để người quản lý ra quyết định.
          </p>
        </div>

        <button
          onClick={fetchReviewData}
          className="self-start sm:self-center inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* 3 Main Tab Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchParams({ tab: tab.id });
                navigateTo('/app/confirmations', { tab: tab.id });
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                active
                  ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">{tab.label}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{tab.sublabel}</div>
                </div>
              </div>

              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${tab.badgeColor}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content per Tab */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-7 h-7 mx-auto text-blue-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu xác nhận...</p>
          </div>
        ) : (
          <>
            {activeTab === 'matching' && (
              <AttendanceReviewTab items={attendanceReviews} onRefresh={fetchReviewData} />
            )}
            {activeTab === 'followup' && (
              <FollowupReviewTab items={followUpItems} onRefresh={fetchReviewData} />
            )}
            {activeTab === 'duplicate' && (
              <DuplicateReviewTab items={duplicateItems} onRefresh={fetchReviewData} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
