import React, { useState } from 'react';
import { Modal } from './Modal';
import { Database, Shield, Server, Copy, Check, Lock, Layers } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'architecture' | 'multitenant' | 'goldenflow'>('architecture');

  const gasSampleCode = `/**
 * FCS AI WORKFORCE OS - V4 MULTI-TENANT SAAS ENGINE
 * Phase 1 Production Pilot Architecture
 */
function doPost(e) {
  var request = JSON.parse(e.postData.contents);
  var action = request.action;
  var payload = request.payload || {};
  
  // 1. Identity & Tenant Resolver (Server-Side Only)
  // Browser-supplied tenantId is NEVER trusted.
  var tenantContext = resolveTenantContext_(request);
  
  // 2. Dispatch to tenant-aware repositories
  switch (action) {
    case "system.health":
      return jsonResponse_({
        success: true,
        data: {
          version: "4.0.0",
          architecture: "MULTI_TENANT",
          tenantIsolation: "ENABLED",
          activeTenant: tenantContext.tenantId,
          company: tenantContext.companyName
        }
      });

    case "worker.list":
      return jsonResponse_(listWorkers_(tenantContext, payload));

    case "worker.create":
      return jsonResponse_(createWorker_(tenantContext, payload));

    case "interview.update":
      return jsonResponse_(updateInterview_(tenantContext, payload));

    case "assignment.start":
      return jsonResponse_(startAssignment_(tenantContext, payload));

    case "attendance.match":
      return jsonResponse_(matchAttendance_(tenantContext, payload));

    default:
      return jsonResponse_({ success: false, error: { code: "UNKNOWN_ACTION", message: "Action không hợp lệ." } });
  }
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(gasSampleCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kiến trúc V4 Multi-Tenant SaaS & Phân lập dữ liệu"
      subtitle="FCS AI WORKFORCE OS • 3 Data Layers • Tenant-Isolated Architecture"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveDocTab('architecture')}
            className={`pb-2 px-3 border-b-2 cursor-pointer ${
              activeDocTab === 'architecture'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Kiến trúc 3 Tầng Dữ Liệu
          </button>
          <button
            onClick={() => setActiveDocTab('multitenant')}
            className={`pb-2 px-3 border-b-2 cursor-pointer ${
              activeDocTab === 'multitenant'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Cơ chế phân giải Tenant Resolver
          </button>
          <button
            onClick={() => setActiveDocTab('goldenflow')}
            className={`pb-2 px-3 border-b-2 cursor-pointer ${
              activeDocTab === 'goldenflow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Chuẩn xác minh VWW (Golden Flow)
          </button>
        </div>

        {/* Tab 1: 3 Data Layers */}
        {activeDocTab === 'architecture' && (
          <div className="space-y-4 text-xs text-slate-700">
            <p className="leading-relaxed">
              Hệ thống V4 Multi-Tenant SaaS loại bỏ hoàn toàn mô hình dùng chung bảng tính. Mỗi khách hàng được cấp phát
              <span className="font-bold text-blue-700"> 2 Google Sheets vật lý hoàn toàn riêng biệt</span>, tuyệt đối không lưu chung hồ sơ người lao động:
            </p>

            <div className="space-y-3.5">
              {/* Layer 1: FCS SaaS Master */}
              <div className="border border-indigo-200 rounded-xl p-3.5 bg-indigo-50/40">
                <div className="flex items-center justify-between font-bold text-indigo-950 mb-2 border-b border-indigo-200 pb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <span>TẦNG 1: FCS_SAAS_MASTER (Quản trị Nền tảng Tập trung)</span>
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">10 BẢNG LÕI</span>
                </div>
                <p className="text-[11px] text-indigo-800 mb-2 font-medium">
                  Sở hữu bởi nhà phát triển FCS, không chứa thông tin giao dịch người lao động của khách hàng.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] font-mono">
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">01_TENANTS</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">02_TENANT_FILES</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">03_GLOBAL_USERS</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">04_USER_TENANT_ACCESS</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">05_PLANS</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">06_SUBSCRIPTIONS</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">07_FEATURE_FLAGS</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">08_USAGE_LIMITS</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">09_SYSTEM_AUDIT</span>
                  <span className="p-1.5 bg-white border border-indigo-100 rounded text-slate-700">10_PLATFORM_CONFIG</span>
                </div>
              </div>

              {/* Layer 2: Tenant DATA File */}
              <div className="border border-blue-200 rounded-xl p-3.5 bg-blue-50/40">
                <div className="flex items-center justify-between font-bold text-blue-950 mb-2 border-b border-blue-200 pb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>TẦNG 2: FCS-XXXXXX_&lt;COMPANY&gt;_DATA (Giao dịch Nhân lực Riêng)</span>
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">12 BẢNG GIAO DỊCH</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">01_WORKER_INBOX</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">02_INTERVIEW_INBOX</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">03_ASSIGNMENT_INBOX</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700 font-bold text-blue-800">04_WORKERS_MASTER</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">05_PIPELINE_EVENTS</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">06_INTERVIEWS</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">07_ASSIGNMENTS</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">08_ATTENDANCE_RAW</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">09_ATTENDANCE</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">10_MATCHING_REVIEW</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">11_ACTION_QUEUE</span>
                  <span className="p-1.5 bg-white border border-blue-100 rounded text-slate-700">12_AUDIT_LOG</span>
                </div>
              </div>

              {/* Layer 3: Tenant MANAGEMENT File */}
              <div className="border border-emerald-200 rounded-xl p-3.5 bg-emerald-50/40">
                <div className="flex items-center justify-between font-bold text-emerald-950 mb-2 border-b border-emerald-200 pb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>TẦNG 3: FCS-XXXXXX_&lt;COMPANY&gt;_MANAGEMENT (Cấu hình Doanh nghiệp)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">12 BẢNG CẤU HÌNH</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">01_COMPANY_PROFILE</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">02_OFFICES</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">03_STAFF</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">04_PARTNERS</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">05_JOBS</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">06_ROLES</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">07_ROLE_PERMISSIONS</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">08_CONFIG</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">09_SLA_RULES</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">10_FEATURE_CONFIG</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">11_INTEGRATIONS</span>
                  <span className="p-1.5 bg-white border border-emerald-100 rounded text-slate-700">12_SUBSCRIPTION_INFO</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tenant Resolver & Security */}
        {activeDocTab === 'multitenant' && (
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <span className="font-bold flex items-center space-x-1">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Quy tắc bảo mật bất khả xâm phạm (Non-negotiable Tenant Isolation):</span>
              </span>
              <p className="text-[11px] leading-relaxed">
                Máy chủ Google Apps Script <span className="font-bold underline">không bao giờ tin tưởng</span> tham số tenantId hay role do trình duyệt gửi lên. Mọi quyền truy cập được suy luận bắt buộc từ danh tính Firebase đã xác thực:
              </p>
              <div className="p-2 bg-white rounded border border-amber-200 font-mono text-[11px] text-slate-800">
                Firebase UID ➔ 04_USER_TENANT_ACCESS ➔ tenant_id ➔ 02_TENANT_FILES ➔ Mở tệp DATA &amp; MANAGEMENT riêng
              </div>
            </div>

            <div className="relative mt-3">
              <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-3 py-1.5 rounded-t-lg text-[11px] font-mono">
                <span>Google Apps Script V4 - Multi-Tenant Router</span>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center space-x-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-slate-200 p-3 rounded-b-lg overflow-x-auto font-mono text-[11px] leading-relaxed max-h-56">
                {gasSampleCode}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Golden Flow */}
        {activeDocTab === 'goldenflow' && (
          <div className="space-y-3 text-xs text-slate-700">
            <p className="leading-relaxed">
              Quy trình 8 bước Golden Flow tạo ra giá trị độc bản cho nhà quản trị nhân lực:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                <span>ĐĂNG KÝ (Tạo mã Worker ID duy nhất dạng WK-XXXXXX)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                <span>PHỎNG VẤN (Ghi nhận lịch và kết quả ĐẬU / TRƯỢT)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                <span>PHÂN BỔ (Gán đối tác nhà máy tiếp nhận và ca làm)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">4</span>
                <span>ĐI LÀM (Xác nhận lao động đã có mặt tại nhà máy)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">5</span>
                <span>CHẤM CÔNG (Nhận file đối soát công từ nhà máy)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">6</span>
                <span>KHỚP CÔNG (Tự động đối soát theo Worker ID / CCCD)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">7</span>
                <span>XÁC THỰC VWW (Verified Working Worker = Có công thực tế)</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </Modal>
  );
};
