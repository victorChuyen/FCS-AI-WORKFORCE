# ĐỀ XUẤT NÂNG CẤP & FIX LỖI TỪ fcs-astra

**Thời gian:** 2026-09-18T00:57:59.970Z

### 1. KIỂM TOÁN LỖI LOGIC HỆ THỐNG

1. **Sai lệch North Star Metric (VWW)**: `is_vww` chỉ bật tại `L4`. Lỗi nghiệp vụ. North Star Metric là L3 (Bắt đầu đi làm / Verified Working Worker). Bỏ sót ghi nhận doanh thu, tính thưởng sai lệch.
2. **Đứt gãy chuỗi dữ liệu (Funnel Pipeline Broken)**: Bỏ qua `05_PIPELINE_EVENTS`. Không tính được conversion rate theo thời gian thực.
3. **Mất toàn vẹn dữ liệu đa bảng (Data Inconsistency)**: Chuyển Deal nhưng giữ nguyên trạng thái Worker tại `01_MASTER_WORKERS`. Trực tiếp gây sai lệch điều phối nhân sự.
4. **Thiếu trường dữ liệu thực tế**: Deal thiếu `actual_work_status`, `start_date`, `interview_result` khi đổi trạng thái.

---

### 2. MÃ NGUỒN BACKEND GOOGLE APPS SCRIPT (Code.gs)

Bản vá `handleMoveStageV2_` bảo đảm toàn vẹn giao dịch (ACID mô phỏng qua ScriptLock).

```javascript
function handleMoveStageV2_(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Hệ thống bận, không lấy được lock. Thử lại sau."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) throw new Error("Missing POST payload");
    var body = JSON.parse(rawData);

    var dealId = body.deal_id;
    var toStage = body.to_stage;
    var actorEmail = body.actor_email || "system@fcs.vn";
    var notes = body.notes || "";
    var payloadExtra = body.extra || {}; // startDate, interviewDate, interviewResult, reason

    if (!dealId || !toStage) {
      throw new Error("deal_id và to_stage là bắt buộc.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var nowIso = new Date().toISOString();

    // 1. ĐỌC SHEET 02_CRM_DEALS_2026
    var dealSheet = ss.getSheetByName("02_CRM_DEALS_2026");
    if (!dealSheet) throw new Error("Sheet 02_CRM_DEALS_2026 không tồn tại");
    var dealData = dealSheet.getDataRange().getValues();
    var dealHeaders = dealData[0];

    var dIdx = {
      deal_id: dealHeaders.indexOf("deal_id"),
      worker_id: dealHeaders.indexOf("worker_id"),
      level: dealHeaders.indexOf("level_sale_status"),
      work_status: dealHeaders.indexOf("actual_work_status"),
      is_vww: dealHeaders.indexOf("is_vww"),
      start_date: dealHeaders.indexOf("start_date"),
      interview_date: dealHeaders.indexOf("interview_date"),
      interview_result: dealHeaders.indexOf("interview_result"),
      notes: dealHeaders.indexOf("notes"),
      updated_at: dealHeaders.indexOf("updated_at"),
      updated_by: dealHeaders.indexOf("updated_by")
    };

    if (dIdx.deal_id === -1 || dIdx.level === -1) {
      throw new Error("Cột deal_id hoặc level_sale_status không hợp lệ");
    }

    var targetRow = -1;
    var currentDeal = null;

    for (var r = 1; r < dealData.length; r++) {
      if (dealData[r][dIdx.deal_id] === dealId) {
        targetRow = r + 1;
        currentDeal = dealData[r];
        break;
      }
    }

    if (targetRow === -1) throw new Error("Không tìm thấy Deal: " + dealId);

    var fromStage = currentDeal[dIdx.level];
    var workerId = currentDeal[dIdx.worker_id];

    // Map trạng thái công việc và cờ VWW
    var isVww = ["L3", "L3.2", "L4"].indexOf(toStage) !== -1;
    var actualWorkStatus = "PENDING";
    var workerStatusUpdate = "";

    if (toStage === "L2.1") {
      actualWorkStatus = "INTERVIEW_PASSED";
      workerStatusUpdate = "PASSED";
    } else if (toStage === "L3" || toStage === "L3.2") {
      actualWorkStatus = "WORKING";
      workerStatusUpdate = "WORKING";
    } else if (toStage === "L3.1") {
      actualWorkStatus = "QUIT";
      workerStatusUpdate = "QUIT";
    } else if (toStage === "L4") {
      actualWorkStatus = "RETENTION_SUCCESS";
      workerStatusUpdate = "STABLE";
    } else if (toStage === "L5") {
      actualWorkStatus = "FAILED";
      workerStatusUpdate = "FAILED";
    }

    // GHI CẬP NHẬT DEAL
    if (dIdx.level !== -1) dealSheet.getRange(targetRow, dIdx.level + 1).setValue(toStage);
    if (dIdx.work_status !== -1) dealSheet.getRange(targetRow, dIdx.work_status + 1).setValue(actualWorkStatus);
    if (dIdx.is_vww !== -1) dealSheet.getRange(targetRow, dIdx.is_vww + 1).setValue(isVww);
    if (dIdx.notes !== -1 && notes) dealSheet.getRange(targetRow, dIdx.notes + 1).setValue(notes);
    if (dIdx.updated_at !== -1) dealSheet.getRange(targetRow, dIdx.updated_at + 1).setValue(nowIso);
    if (dIdx.updated_by !== -1) dealSheet.getRange(targetRow, dIdx.updated_by + 1).setValue(actorEmail);

    if (payloadExtra.startDate && dIdx.start_date !== -1) {
      dealSheet.getRange(targetRow, dIdx.start_date + 1).setValue(payloadExtra.startDate);
    }
    if (payloadExtra.interviewDate && dIdx.interview_date !== -1) {
      dealSheet.getRange(targetRow, dIdx.interview_date + 1).setValue(payloadExtra.interviewDate);
    }
    if (payloadExtra.interviewResult && dIdx.interview_result !== -1) {
      dealSheet.getRange(targetRow, dIdx.interview_result + 1).setValue(payloadExtra.interviewResult);
    }

    // 2. ĐỒNG BỘ 01_MASTER_WORKERS
    if (workerId && workerStatusUpdate !== "") {
      var workerSheet = ss.getSheetByName("01_MASTER_WORKERS");
      if (workerSheet) {
        var wData = workerSheet.getDataRange().getValues();
        var wHeaders = wData[0];
        var wIdIdx = wHeaders.indexOf("worker_id");
        var wStatusIdx = wHeaders.indexOf("status");
        var wVwwIdx = wHeaders.indexOf("is_verified_working");
        var wUpdatedIdx = wHeaders.indexOf("updated_at");

        for (var w = 1; w < wData.length; w++) {
          if (wData[w][wIdIdx] === workerId) {
            var wRow = w + 1;
            if (wStatusIdx !== -1) workerSheet.getRange(wRow, wStatusIdx + 1).setValue(workerStatusUpdate);
            if (wVwwIdx !== -1 && isVww) workerSheet.getRange(wRow, wVwwIdx + 1).setValue(true);
            if (wUpdatedIdx !== -1) workerSheet.getRange(wRow, wUpdatedIdx + 1).setValue(nowIso);
            break;
          }
        }
      }
    }

    // 3. GHI EVENT VÀO 05_PIPELINE_EVENTS
    var eventSheet = ss.getSheetByName("05_PIPELINE_EVENTS");
    if (eventSheet) {
      var eventId = "EV-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      eventSheet.appendRow([
        eventId,
        dealId,
        workerId,
        fromStage,
        toStage,
        "STAGE_TRANSITION",
        actorEmail,
        "CRM_UI",
        JSON.stringify(payloadExtra),
        nowIso
      ]);
    }

    // 4. GHI AUDIT VÀO 03_AUDIT_LOG
    var auditSheet = ss.getSheetByName("03_AUDIT_LOG");
    if (auditSheet) {
      var logId = "LOG-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      auditSheet.appendRow([
        logId,
        "MOVE_STAGE",
        "CRM_DEALS",
        dealId,
        actorEmail,
        nowIso,
        JSON.stringify({ from: fromStage, to: toStage, worker_id: workerId, is_vww: isVww })
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      deal_id: dealId,
      from_stage: fromStage,
      to_stage: toStage,
      is_vww: isVww,
      worker_synced: !!workerId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

---

### 3. FRONTEND INTEGRATION

#### `dealApi.ts`
```typescript
export interface MoveStagePayload {
  deal_id: string;
  to_stage: string;
  actor_email: string;
  notes?: string;
  extra?: {
    startDate?: string;
    interviewDate?: string;
    interviewResult?: string;
    reason?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export const dealApi = {
  moveStage: async (payload: MoveStagePayload): Promise<ApiResponse<any>> => {
    const GAS_ENDPOINT = process.env.NEXT_PUBLIC_GAS_WEBAPP_URL;
    if (!GAS_ENDPOINT) throw new Error("Missing NEXT_PUBLIC_GAS_WEBAPP_URL");

    const res = await fetch(`${GAS_ENDPOINT}?action=moveDealStageV2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }
};
```

#### `MoveDealStageModal.tsx`
```tsx
import React, { useState } from "react";
import { dealApi } from "./dealApi";

interface Props {
  dealId: string;
  currentStage: string;
  workerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STAGE_RULES: Record<string, string[]> = {
  L0: ["L1", "L5"],
  L1: ["L2", "L5"],
  L2: ["L2.1", "L5"],
  L2.1: ["L3", "L5"],
  L3: ["L3.1", "L3.2", "L4"],
  "L3.1": ["L3.2", "L5"],
  "L3.2": ["L4", "L5"],
  L4: [],
  L5: []
};

export const MoveDealStageModal: React.FC<Props> = ({
  dealId,
  currentStage,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [toStage, setToStage] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [interviewResult, setInterviewResult] = useState<string>("PASS");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isOpen) return null;

  const validNextStages = STAGE_RULES[currentStage] || [];

  const handleExecute = async () => {
    try {
      setLoading(true);
      setErr(null);

      if (!toStage) throw new Error("Chưa chọn stage mục tiêu");
      if ((toStage === "L3" || toStage === "L3.2") && !startDate) {
        throw new Error("Bắt buộc nhập ngày bắt đầu đi làm cho L3");
      }

      const res = await dealApi.moveStage({
        deal_id: dealId,
        to_stage: toStage,
        actor_email: "operator@fcs.vn",
        notes,
        extra: {
          startDate: startDate || undefined,
          interviewDate: interviewDate || undefined,
          interviewResult: toStage === "L2.1" ? interviewResult : undefined
        }
      });

      if (!res.success) {
        throw new Error(res.error || "Cập nhật thất bại");
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold mb-1">Chuyển Stage: {dealId}</h3>
        <p className="text-sm text-gray-500 mb-4">Stage hiện tại: <span className="font-semibold text-blue-600">{currentStage}</span></p>

        {err && <div className="p-2 mb-3 bg-red-100 text-red-700 text-sm rounded">{err}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stage đích</label>
            <select
              value={toStage}
              onChange={(e) => setToStage(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Chọn Stage --</option>
              {validNextStages.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {(toStage === "L3" || toStage === "L3.2") && (
            <div>
              <label className="block text-sm font-medium mb-1">Ngày bắt đầu làm việc (VWW)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
          )}

          {toStage === "L2.1" && (
            <div>
              <label className="block text-sm font-medium mb-1">Kết quả phỏng vấn</label>
              <select
                value={interviewResult}
                onChange={(e) => setInterviewResult(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="PASS">PASS (Đỗ)</option>
                <option value="FAIL">FAIL (Trượt)</option>
                <option value="CONSIDER">CONSIDER (Xem xét)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border p-2 rounded h-20"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleExecute}
            disabled={loading || !toStage}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận chuyển"}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 4. KẾ HOẠCH HÀNH ĐỘNG GIAI ĐOẠN TIẾP THEO

#### Pha 1: Golden Flow E2E Test
1. **L0 -> L1 -> L2**: Chọn Deal `DL-2026-T001` (Worker `WK-T001`). Move stage qua UI. Check sheet `05_PIPELINE_EVENTS` kiểm tra event tạo mới.
2. **L2 -> L2.1**: Xác nhận `01_MASTER_WORKERS` cập nhật trạng thái `PASSED`.
3. **L2.1 -> L3**: Nhập `startDate`. Kiểm tra:
   - Deal: `level_sale_status = 'L3'`, `is_vww = TRUE`, `actual_work_status = 'WORKING'`.
   - Worker: `status = 'WORKING'`, `is_verified_working = TRUE`.
   - Pipeline Event: Sinh dòng `EV-XXXX` tương ứng.

#### Pha 2: Worker 360 Onboarding Care 1-3-7
1. **Trigger Engine**: Viết hàm `triggerCareSchedule_()` trong AppScript chạy theo Time-driven trigger hàng ngày (08:00 AM).
2. **Quét dữ liệu**: Lọc các deal có `level_sale_status = 'L3'` và `start_date` cách ngày hiện tại 1 ngày, 3 ngày, 7 ngày.
3. **Action Queue**: Bơm task nhắc nhở vào sheet `11_ACTION_QUEUE` (cột: `task_id`, `worker_id`, `type`, `due_date`, `assigned_to`, `status`).
   - Ngày 1: Gọi điện kiểm tra ngày đầu nhận việc, hỗ trợ di chuyển/ký túc xá.
   - Ngày 3: Đánh giá thích nghi công việc, áp lực ca kíp.
   - Ngày 7: Check chuyên cần tuần đầu, đối soát giờ công sơ bộ.