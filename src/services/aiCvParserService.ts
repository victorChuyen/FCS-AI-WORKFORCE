/**
 * 🚀 FCS AI WORKFORCE OS V2 — AI CV & CCCD PARSER SERVICE
 * Powered by 9Router AI Gateway: Combo `fcs-astra` (`cx/gpt-6-astra`)
 * 
 * Tự động bóc tách tin nhắn văn bản, ảnh quét CCCD, hoặc CV ứng viên
 * thành cấu trúc 34 cột chuẩn VNeID của Master Worker Profile.
 */

import { callAiRouter } from './aiRouterService';
import { Worker } from '../types/worker.types';

export interface ParsedWorkerProfile {
  full_name: string;
  phone: string;
  cccd: string;
  birth_date: string;
  gender: 'NAM' | 'NỮ' | 'KHÁC';
  ethnicity?: string;
  hometown_province?: string;
  current_residence?: string;
  target_company?: string;
  branch?: string;
  education_level?: string;
  skills_experience?: string;
  health_status?: string;
  marital_status?: string;
  notes?: string;
  confidence_score: number;
}

const SYSTEM_PARSER_PROMPT = `Bạn là Chuyên gia AI Tuyển dụng & Thẩm định Hồ sơ Lao động cấp cao của FCS AI Workforce OS V2.
Nhiệm vụ của bạn là đọc thông tin thô từ người dùng (tin nhắn Zalo, tóm tắt CCCD 2 mặt, CV, thông tin tuyển dụng) và chuẩn hóa thành đối tượng JSON hồ sơ công nhân theo quy chuẩn Việt Nam:

CÁC NGUYÊN TẮC BẮT BUỘC:
1. full_name: Viết hoa toàn bộ, có dấu tiếng Việt (ví dụ: NGUYỄN VĂN AN).
2. phone: 10 chữ số chuẩn Việt Nam bắt đầu bằng 0 (ví dụ: 0987654321).
3. cccd: 12 chữ số căn cước công dân (ví dụ: 037202008912).
4. birth_date: Định dạng YYYY-MM-DD. Nếu chỉ có năm sinh, điền YYYY-01-01.
5. gender: 'NAM' hoặc 'NỮ'.
6. target_company: Khớp với 1 trong các nhà máy trọng điểm nếu có nhắc đến (ví dụ: FOXCONN_QC, LUXSHARE_BG, WNC_HN, PEGATRON_HP, SAMSUNG_TN...).
7. branch: Khớp với chi nhánh quản lý (BẮC GIANG, BẮC NINH, HÀ NAM, HẢI PHÒNG, THÁI NGUYÊN, HÀ NỘI...).
8. confidence_score: Điểm tin cậy từ 0.0 đến 1.0 dựa trên độ đầy đủ thông tin.

CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON HỢP LỆ (Không có markdown backticks, không kèm văn bản giải thích).`;

/**
 * Trích xuất và chuẩn hóa thông tin lao động từ văn bản thô bằng GPT-6 Astra
 */
export async function parseWorkerRawText(rawText: string): Promise<ParsedWorkerProfile> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Vui lòng cung cấp nội dung thông tin lao động để trích xuất.');
  }

  const messages = [
    { role: 'system' as const, content: SYSTEM_PARSER_PROMPT },
    { role: 'user' as const, content: `Dưới đây là thông tin lao động cần bóc tách:\n\n"""\n${rawText.trim()}\n"""\n\nHãy phân tích và trả về đối tượng JSON.` }
  ];

  try {
    const rawResponse = await callAiRouter(messages, {
      modelKey: 'coreAstra', // Combo fcs-astra (cx/gpt-6-astra)
      temperature: 0.1,
      maxTokens: 1024,
    });

    // Clean JSON response (strip markdown fences if present)
    const cleanedJson = rawResponse
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedJson) as ParsedWorkerProfile;

    // Safety normalizations
    if (parsed.full_name) parsed.full_name = parsed.full_name.toUpperCase().trim();
    if (parsed.phone) parsed.phone = parsed.phone.replace(/[^0-9]/g, '');
    if (parsed.cccd) parsed.cccd = parsed.cccd.replace(/[^0-9]/g, '');

    return parsed;
  } catch (err: any) {
    console.error('[AI CV Parser] Lỗi bóc tách thông tin:', err);
    throw new Error(`AI bóc tách thất bại: ${err.message || 'Lỗi không xác định'}`);
  }
}

/**
 * Tự động phân tích độ phù hợp giữa công nhân và nhà máy (Matching Score 0-100)
 */
export async function analyzeWorkerCompanyMatching(
  worker: Partial<Worker> & Record<string, any>,
  companyName: string,
  requirements: string = 'Lao động phổ thông, sức khỏe tốt, tăng ca được'
): Promise<{ score: number; reason: string; recommendations: string[] }> {
  const name = worker.fullName || worker.full_name || 'Ứng viên';
  const birth = worker.dateOfBirth || worker.birth_date || 'Chưa rõ';
  const gender = worker.gender || 'Chưa rõ';
  const hometown = worker.hometown || worker.hometown_province || worker.address || 'Chưa rõ';
  const exp = worker.skills || worker.skills_experience || worker.notes || 'Chưa có';

  const prompt = `Đánh giá độ phù hợp của người lao động sau với nhà máy ${companyName}:
- Họ tên: ${name}
- Năm sinh: ${birth}
- Giới tính: ${gender}
- Quê quán: ${hometown}
- Kinh nghiệm: ${exp}
- Yêu cầu xưởng: ${requirements}

Trả về JSON duy nhất định dạng:
{
  "score": 85,
  "reason": "Lý do tóm tắt",
  "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2"]
}`;

  const messages = [
    { role: 'system' as const, content: 'Bạn là chuyên gia phân bổ lao động sản xuất công nghiệp.' },
    { role: 'user' as const, content: prompt }
  ];

  const res = await callAiRouter(messages, {
    modelKey: 'coreAstra',
    temperature: 0.2,
    maxTokens: 512,
  });

  const cleaned = res.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}
