import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  GitFork,
  CalendarCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  PhoneCall,
  UserCheck,
  Calculator,
  Compass,
  Briefcase,
  HelpCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthProvider';
import { AppRole } from '../../types/auth.types';

interface SaaSRoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: AppRole;
}

interface StepDetail {
  stepNum: number;
  title: string;
  stageBadge?: string;
  shortDesc: string;
  checklist: string[];
  proTip?: string;
  warning?: string;
  actionRoute: string;
  actionLabel: string;
}

interface RolePlaybook {
  roleId: string;
  matchedRoles: AppRole[];
  title: string;
  shortTitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  mission: string;
  vwwImpact: string;
  steps: StepDetail[];
}

const PLAYBOOKS: RolePlaybook[] = [
  {
    roleId: 'SUPER_ADMIN',
    matchedRoles: ['PLATFORM_SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN'],
    title: 'Ban Điều Hành & Quản Trị Cấp Cao',
    shortTitle: 'Ban Điều Hành (CEO)',
    badge: 'SUPER ADMIN / CEO',
    badgeColor: 'bg-purple-950/80 text-purple-200 border-purple-600/50',
    icon: ShieldCheck,
    mission:
      'Kiểm soát toàn diện tăng trưởng doanh thu xưởng, bảo toàn chi phí hoa hồng, tối ưu tỷ lệ chuyển đổi C3 → VWW và giám sát an ninh dữ liệu đa doanh nghiệp.',
    vwwImpact:
      'Mỗi lao động đạt chuẩn VWW mang về 3.500.000đ doanh thu nghiệm thu xưởng và tạo ra 2.300.000đ lợi nhuận gộp sau hoa hồng.',
    steps: [
      {
        stepNum: 1,
        title: 'Giám sát Telemetry & North Star VWW',
        shortDesc: 'Nắm bắt nhịp thở hệ thống, số lượng lao động đang làm việc thực tế và cảnh báo tồn đọng.',
        checklist: [
          'Vào trang Hôm nay (/app) để xem tổng số VWW tích lũy trong tháng.',
          'Kiểm tra Live Ticker để phát hiện các Deal bị tắc nghẽn quá 48h tại phễu L1 hoặc L2.',
          'Quan sát biểu đồ phân bổ lao động theo các xưởng vệ tinh (Fuyu, Newwing, Luxshare...).',
        ],
        proTip: 'Ưu tiên xưởng có chu kỳ đối soát công nhanh và tỷ lệ giữ chân lao động trên 30 ngày.',
        warning: 'Không tự ý can thiệp vào dữ liệu chấm công gốc của nhà máy trên bảng tính.',
        actionRoute: '/app',
        actionLabel: 'Mở Dashboard Hôm Nay',
      },
      {
        stepNum: 2,
        title: 'Kiểm soát Phễu Chuyển Đổi 19 Level Sale',
        stageBadge: 'C3 → L1 → L2 → L4',
        shortDesc: 'Theo dõi tốc độ thẩm định hồ sơ, tỷ lệ phỏng vấn đỗ và số lượng nghỉ việc ngang.',
        checklist: [
          'Mở Pipeline Kanban (/app/pipeline) để xem toàn cảnh 19 cột trạng thái.',
          'Đánh giá tỷ lệ chuyển đổi từ C3 (Data thô) sang L1.8 (Chốt lịch phỏng vấn xưởng).',
          'Theo dõi số lượng lao động tại L2.3 (No Show) để yêu cầu Leader Sale tái phân bổ.',
        ],
        proTip: 'Nếu tỷ lệ No Show > 25%, cần rà soát lại kịch bản tư vấn và cam kết hỗ trợ xe đưa đón.',
        actionRoute: '/app/pipeline',
        actionLabel: 'Mở Pipeline Kanban',
      },
      {
        stepNum: 3,
        title: 'Quyết Toán Tài Chính & Phê Duyệt Chi Cấp 4',
        stageBadge: 'L4. Quyết Toán',
        shortDesc: 'Thẩm định báo cáo đối soát xưởng Foxconn và phê duyệt chi trả hoa hồng cuối cùng.',
        checklist: [
          'Vào phân hệ Phê duyệt & Đối soát (/app/confirmations).',
          'Kiểm tra báo cáo tài chính L4: Tổng doanh thu dự thu vs Tổng hoa hồng tuyển dụng.',
          'Thực hiện lệnh Phê duyệt chi Cấp 4 (Cấp cao nhất) để giải ngân hoa hồng cho các chi nhánh.',
        ],
        warning: 'Chỉ ký duyệt chi khi lao động đã có xác nhận chấm công thực tế đủ 15 ngày trở lên.',
        actionRoute: '/app/confirmations',
        actionLabel: 'Mở Phân Hệ Phê Duyệt',
      },
      {
        stepNum: 4,
        title: 'Quản Trị Workspace & Bảo Mật Đa Doanh Nghiệp',
        shortDesc: 'Quản lý Tenant, phân quyền chi nhánh và giám sát nhật ký vết kiểm toán Audit Trail.',
        checklist: [
          'Kiểm tra kết nối Google Sheets 12-Tab độc lập của doanh nghiệp.',
          'Phân bổ tài khoản Recruiter, Manager và Field Officer cho đúng văn phòng.',
          'Kiểm tra Audit Log tại trang Cài đặt để phát hiện hành vi xuất dữ liệu bất thường.',
        ],
        actionRoute: '/app/grid',
        actionLabel: 'Mở Lưới Excel Toàn Năng',
      },
    ],
  },
  {
    roleId: 'MANAGER',
    matchedRoles: ['TENANT_MANAGER', 'LEADER_SALE', 'MANAGER'],
    title: 'Trưởng Phòng Vận Hành & Trưởng Nhóm Tuyển Dụng',
    shortTitle: 'Quản Lý & Vận Hành',
    badge: 'MANAGER / LEADER',
    badgeColor: 'bg-emerald-950/80 text-emerald-200 border-emerald-600/50',
    icon: Building2,
    mission:
      'Phân bổ data C3 chuẩn xác cho chuyên viên, điều phối lịch hẹn phỏng vấn xưởng, quản lý phòng KTX và phê duyệt hoa hồng Cấp 1 & Cấp 2.',
    vwwImpact:
      'Đảm bảo 100% ứng viên tiềm năng được gọi điện trong 15 phút đầu và không bị bỏ rơi tại cổng xưởng.',
    steps: [
      {
        stepNum: 1,
        title: 'Tiếp Nhận & Chia Data C3 Cho Tuyển Dụng',
        stageBadge: 'C3 → L1',
        shortDesc: 'Sàng lọc data mới từ Marketing, chia đều cho các chuyên viên tư vấn theo văn phòng.',
        checklist: [
          'Vào Lưới Excel (/app/grid) hoặc Pipeline (/app/pipeline) lọc các Deal ở cột C3.',
          'Phân bổ số lượng hồ sơ cho từng Recruiter theo chỉ tiêu KPIs ngày.',
          'Nhắc nhở chuyên viên gọi ngay cho ứng viên trong vòng 15-30 phút kể từ khi data đổ về.',
        ],
        proTip: 'Ưu tiên gán ứng viên đã có CCCD gắn chip và sẵn sàng đi làm ngay cho các xưởng đang thiếu quân.',
        actionRoute: '/app/pipeline',
        actionLabel: 'Mở Pipeline Phân Bổ',
      },
      {
        stepNum: 2,
        title: 'Điều Phối Lịch Phỏng Vấn & Xếp Phòng KTX',
        stageBadge: 'L2 → L2.1',
        shortDesc: 'Khớp danh sách phỏng vấn theo ngày và điều phối chỗ ở KTX cho lao động đi làm.',
        checklist: [
          'Xem danh sách ứng viên đã chốt lịch phỏng vấn ngày mai tại cột L2.',
          'Liên hệ cán bộ hiện trường xưởng để thông báo số lượng ứng viên dự kiến đến cổng.',
          'Kiểm tra tình trạng phòng KTX còn trống (phòng Nam/Nữ) để chuẩn bị đón ứng viên đỗ.',
        ],
        actionRoute: '/app/workers',
        actionLabel: 'Xem Hồ Sơ Ứng Viên',
      },
      {
        stepNum: 3,
        title: 'Duyệt Kết Quả & Giám Sát Tỷ Lệ No-Show',
        stageBadge: 'L2.3 → L1.2',
        shortDesc: 'Kiểm soát chặt chẽ tỷ lệ bỏ hẹn phỏng vấn và kích hoạt quy trình cứu Lead.',
        checklist: [
          'Sau ca sáng (11:00) và ca chiều (16:00), kiểm tra danh sách lao động không đến (L2.3).',
          'Chuyển ngay các hồ sơ L2.3 về trạng thái L1.2 (Chăm sóc lại) để Telesale gọi điện tìm hiểu nguyên nhân.',
          'Hỗ trợ ứng viên gặp khó khăn về phương tiện đi lại hoặc giấy tờ tùy thân.',
        ],
        actionRoute: '/app/confirmations',
        actionLabel: 'Kiểm Tra Phê Duyệt',
      },
      {
        stepNum: 4,
        title: 'Duyệt Hoa Hồng Tuyển Dụng Cấp 1 & Cấp 2',
        stageBadge: 'Thẩm Định Chi',
        shortDesc: 'Xác nhận thành tích tuyển dụng của đội ngũ trước khi chuyển lên kế toán đối soát.',
        checklist: [
          'Rà soát danh sách lao động đã đi làm đủ công trong tháng của từng chuyên viên.',
          'Bấm Duyệt Cấp 1 (với Leader Sale) hoặc Duyệt Cấp 2 (với Manager chi nhánh).',
          'Ghi chú các trường hợp lao động có phát sinh nghỉ ngang để trừ hoa hồng theo quy chế.',
        ],
        actionRoute: '/app/confirmations',
        actionLabel: 'Mở Bảng Duyệt Hoa Hồng',
      },
    ],
  },
  {
    roleId: 'RECRUITER',
    matchedRoles: ['RECRUITER', 'STAFF'],
    title: 'Chuyên Viên Tuyển Dụng & Tư Vấn (Telesale)',
    shortTitle: 'Tuyển Dụng & Telesale',
    badge: 'RECRUITER / SALE',
    badgeColor: 'bg-amber-950/80 text-amber-200 border-amber-600/50',
    icon: PhoneCall,
    mission:
      'Chuyển đổi tối đa Data C3 thành lịch phỏng vấn L2 thành công, hướng dẫn ứng viên chuẩn bị hồ sơ VNeID và chăm sóc đồng hành đến cổng xưởng.',
    vwwImpact:
      'Tư vấn đúng việc - đúng xưởng giúp người lao động gắn bó lâu dài, vượt mốc 15 công để đạt chuẩn VWW.',
    steps: [
      {
        stepNum: 1,
        title: 'Nhận Data C3 & Kiểm Tra Trùng O(1)',
        stageBadge: 'C3 Nhận Lead',
        shortDesc: 'Bắt đầu ngày làm việc bằng việc nhận data được phân bổ và kiểm tra lịch sử ứng viên.',
        checklist: [
          'Mở Pipeline (/app/pipeline) xem các Deal mới tại cột C3 được phân bổ cho mình.',
          'Kiểm tra số điện thoại và CCCD của ứng viên xem đã từng ứng tuyển xưởng nào chưa.',
          'Bấm vào thẻ ứng viên để xem ghi chú hoặc lý do chưa đạt ở các đợt ứng tuyển trước.',
        ],
        proTip: 'Ứng viên từng làm tại Foxconn hoặc Luxshare có tay nghề sẽ được xưởng ưu tiên duyệt nhanh hơn.',
        actionRoute: '/app/pipeline',
        actionLabel: 'Mở Pipeline Nhận Việc',
      },
      {
        stepNum: 2,
        title: 'Gọi Tư Vấn & Cập Nhật Cấp Độ L1.1 - L1.8',
        stageBadge: 'L1 Chăm Sóc',
        shortDesc: 'Gọi điện trao đổi công việc, mức lương xưởng, chế độ KTX và cập nhật chính xác trạng thái.',
        checklist: [
          'Gọi điện thoại và ghi nhận kết quả ngay trên hệ thống.',
          'L1.1: Đã liên hệ - Đang trao đổi nguyện vọng và tay nghề.',
          'L1.3: Cân nhắc - Gửi bảng lương và hình ảnh KTX qua Zalo.',
          'L1.8: Chốt hẹn - Ứng viên đồng ý lên xưởng phỏng vấn.',
        ],
        warning: 'Tuyệt đối không hứa hẹn sai mức lương thực tế hoặc chế độ phụ cấp của nhà máy.',
        actionRoute: '/app/workers',
        actionLabel: 'Mở Danh Sách Ứng Viên',
      },
      {
        stepNum: 3,
        title: 'Chốt Lịch Phỏng Vấn Xưởng & Hướng Dẫn Hồ Sơ',
        stageBadge: 'L2 Đặt Lịch',
        shortDesc: 'Chuyển Deal sang L2, chọn ngày phỏng vấn và dặn dò giấy tờ VNeID.',
        checklist: [
          'Kéo thẻ Deal sang cột L2 (Hẹn phỏng vấn) và chọn xưởng đối tác (Fuyu/Newwing...).',
          'Dặn dò ứng viên mang CCCD gốc, kích hoạt định danh VNeID mức 2 trên điện thoại.',
          'Cung cấp số điện thoại cán bộ hiện trường đón tại cổng xưởng và hướng dẫn xe bus.',
        ],
        actionRoute: '/app/pipeline',
        actionLabel: 'Kéo Thẻ Lên L2',
      },
      {
        stepNum: 4,
        title: 'Theo Dõi Đỗ Phỏng Vấn & Cứu Lead Bỏ Hẹn',
        stageBadge: 'L2.3 → L1.2',
        shortDesc: 'Đồng hành đến khi ứng viên nhận việc và chủ động thu hồi các ca không đến.',
        checklist: [
          'Xem thông báo kết quả phỏng vấn từ cán bộ hiện trường (L2.1 Đỗ / L2.2 Trượt).',
          'Nếu ứng viên không đến (L2.3 No Show), gọi điện ngay để tìm hiểu lý do và hẹn lại.',
          'Theo dõi số ngày công của người lao động để đón đầu thời điểm đạt mốc VWW nhận thưởng.',
        ],
        actionRoute: '/app/today',
        actionLabel: 'Xem Bảng Theo Dõi Hôm Nay',
      },
    ],
  },
  {
    roleId: 'FIELD',
    matchedRoles: ['FIELD_OFFICER'],
    title: 'Cán Bộ Hiện Trường Xưởng KCN',
    shortTitle: 'Hiện Trường Cổng Xưởng',
    badge: 'HIỆN TRƯỜNG KCN',
    badgeColor: 'bg-indigo-950/80 text-indigo-200 border-indigo-600/50',
    icon: UserCheck,
    mission:
      'Đón ứng viên tại cổng xưởng Foxconn, đối chiếu CCCD thật 100%, thực hiện điểm danh 1 chạm (Passed / Failed / No-Show) và xếp phòng KTX.',
    vwwImpact:
      'Chốt chặn phòng thủ quan trọng nhất chống gian lận danh tính và đảm bảo tỷ lệ nhận việc thực tế.',
    steps: [
      {
        stepNum: 1,
        title: 'Xuất Danh Sách Điều Phối Cổng Xưởng',
        stageBadge: 'Dispatch Roster',
        shortDesc: 'Chuẩn bị danh sách ứng viên có lịch phỏng vấn hôm nay tại nhà máy phụ trách.',
        checklist: [
          'Mở phân hệ Hiện trường để lấy danh sách ứng viên có lịch hẹn hôm nay.',
          'Lọc theo xưởng phụ trách (ví dụ: Fuyu KCN Quang Châu hoặc Newwing KCN Vân Trung).',
          'In hoặc mở danh sách trên điện thoại/máy tính bảng sẵn sàng tại phòng bảo vệ.',
        ],
        actionRoute: '/app/workers',
        actionLabel: 'Xem Roster Hiện Trường',
      },
      {
        stepNum: 2,
        title: 'Đối Chiếu CCCD Gốc & Hồ Sơ Định Danh',
        shortDesc: 'Kiểm tra giấy tờ tùy thân thực tế của người lao động trước giờ vào phỏng vấn.',
        checklist: [
          'Yêu cầu ứng viên xuất trình CCCD gắn chip gốc còn hiệu lực.',
          'Đối chiếu khuôn mặt thật và thông tin định danh trên thẻ với hồ sơ VNeID.',
          'Kiểm tra tình trạng sức khỏe ban đầu (không xăm lộ vị trí nhạy cảm theo quy định xưởng).',
        ],
        warning: 'Nghiêm cấm cho thi hộ hoặc sử dụng giấy tờ photo không công chứng.',
        actionRoute: '/app/workers',
        actionLabel: 'Kiểm Tra Hồ Sơ Ứng Viên',
      },
      {
        stepNum: 3,
        title: 'Thực Hiện Điểm Danh 1 Chạm Tại Cổng',
        stageBadge: 'PASSED / FAILED / NO-SHOW',
        shortDesc: 'Cập nhật tức thời kết quả phỏng vấn vào hệ thống đám mây.',
        checklist: [
          'PASSED (Đỗ): Bấm duyệt đỗ → Hệ thống tự động chuyển Deal sang L2.1 và gợi ý xếp KTX.',
          'FAILED (Trượt): Ghi rõ lý do (mù màu/không đạt bài test) để gợi ý chuyển sang xưởng khác.',
          'NO-SHOW (Không đến): Đánh dấu vắng mặt → Hệ thống tự động trả về L1.2 cho Telesale.',
        ],
        proTip: 'Cập nhật ngay tại chỗ để đội tuyển dụng ở văn phòng nắm bắt quân số tức thời.',
        actionRoute: '/app/pipeline',
        actionLabel: 'Cập Nhật Kết Quả Pipeline',
      },
      {
        stepNum: 4,
        title: 'Bàn Giao KTX & Xác Nhận Vào Ca Đi Làm',
        stageBadge: 'L2.1 → L3',
        shortDesc: 'Bàn giao lao động cho quản lý xưởng và hướng dẫn ổn định chỗ ở KTX.',
        checklist: [
          'Đưa lao động đỗ về nhận phòng KTX (phát chìa khóa, giường, tủ đồ bảo hộ).',
          'Hướng dẫn nội quy KTX nhà máy và giờ giấc xe đưa đón ca làm việc.',
          'Xác nhận lao động đã vào ca làm việc chính thức để bắt đầu tính công.',
        ],
        actionRoute: '/app/workers',
        actionLabel: 'Quản Lý KTX Lao Động',
      },
    ],
  },
  {
    roleId: 'ACCOUNTANT',
    matchedRoles: ['ACCOUNTANT'],
    title: 'Kế Toán Đối Soát & Quản Trị Hoa Hồng',
    shortTitle: 'Kế Toán Đối Soát',
    badge: 'KẾ TOÁN ĐỐI SOÁT',
    badgeColor: 'bg-teal-950/80 text-teal-200 border-teal-600/50',
    icon: Calculator,
    mission:
      'Nạp bảng công nhà máy, thực hiện Cascade Matching 3 tầng, xác thực lao động chạm mốc 15 công VWW và xuất bảng thanh toán hoa hồng minh bạch.',
    vwwImpact:
      'Bảo vệ dòng tiền doanh thu 3.500.000đ/VWW và kiểm soát chặt chẽ 1.200.000đ chi phí hoa hồng.',
    steps: [
      {
        stepNum: 1,
        title: 'Tiếp Nhận File Bảng Chấm Công Nhà Máy',
        shortDesc: 'Nhận file Excel chấm công định kỳ (tuần/tháng) từ phòng nhân sự Foxconn.',
        checklist: [
          'Kiểm tra định dạng file công: Cột CCCD, Mã thẻ xưởng, Họ tên, Tổng số công đi làm.',
          'Lưu trữ file gốc vào kho chứng từ phục vụ đối soát kiểm toán độc lập.',
          'Mở màn hình Đối soát công tại phân hệ (/app/confirmations).',
        ],
        actionRoute: '/app/confirmations',
        actionLabel: 'Mở Màn Hình Đối Soát',
      },
      {
        stepNum: 2,
        title: 'Chạy Đối Soát Cascade Matching 3 Tầng',
        stageBadge: 'CCCD → Thẻ → SĐT',
        shortDesc: 'Hệ thống tự động khớp từng người lao động qua thuật toán nhận diện 3 cấp độ.',
        checklist: [
          'Tầng 1 (Độ tin cậy 100%): Khớp chính xác theo số CCCD 12 chữ số.',
          'Tầng 2: Khớp theo Mã thẻ nhân viên xưởng (factory_worker_id).',
          'Tầng 3: Khớp tương đối theo Số điện thoại và Họ tên nếu CCCD bị thiếu số 0.',
        ],
        proTip: 'Xem danh sách các ca cảnh báo không khớp để chỉnh sửa thủ công trước khi chốt số liệu.',
        actionRoute: '/app/confirmations',
        actionLabel: 'Khớp Dữ Liệu Bảng Công',
      },
      {
        stepNum: 3,
        title: 'Xác Thực North Star VWW (≥ 15 Ngày Công)',
        stageBadge: 'Kích Hoạt VWW',
        shortDesc: 'Chốt danh sách người lao động đủ điều kiện nghiệm thu thanh toán với nhà máy.',
        checklist: [
          'Lao động có tổng ngày công ≥ 15: Hệ thống tự động đóng dấu is_vww = TRUE.',
          'Deal tự động chuyển sang L4 (Lao động hết thời gian tính phí) và khóa chỉnh sửa.',
          'Tự động tính doanh thu nghiệm thu xưởng: Số VWW × 3.500.000 VNĐ.',
        ],
        warning: 'Lao động chưa đủ 15 ngày công tuyệt đối không được chuyển sang trạng thái L4.',
        actionRoute: '/app/today',
        actionLabel: 'Kiểm Tra Chỉ Số VWW',
      },
      {
        stepNum: 4,
        title: 'Lập Bảng Quyết Toán & Duyệt Hoa Hồng Cấp 3',
        stageBadge: 'Quyết Toán L4',
        shortDesc: 'Tính toán hoa hồng chi trả cho từng chuyên viên và trình ban giám đốc duyệt chi.',
        checklist: [
          'Hệ thống tự động tính hoa hồng chuẩn: Số VWW × 1.200.000 VNĐ cho từng Recruiter.',
          'Thực hiện Phê duyệt Cấp 3 (Kế toán trưởng kiểm tra).',
          'Xuất phiếu thanh toán kèm bảng kê ngày công chi tiết gửi cho Ban Giám đốc (Cấp 4).',
        ],
        actionRoute: '/app/confirmations',
        actionLabel: 'Mở Bảng Quyết Toán Hoa Hồng',
      },
    ],
  },
  {
    roleId: 'MARKETING',
    matchedRoles: ['MARKETING'],
    title: 'Chuyên Viên Marketing & Xử Lý Dữ Liệu Ads',
    shortTitle: 'Marketing & Nhập Data',
    badge: 'MARKETING / ADS',
    badgeColor: 'bg-rose-950/80 text-rose-200 border-rose-600/50',
    icon: Sparkles,
    mission:
      'Nạp dữ liệu hàng loạt từ chiến dịch quảng cáo, lọc trùng lặp O(1), loại bỏ số rác để cung cấp nguồn data C3 chất lượng cao nhất cho Telesale.',
    vwwImpact:
      'Data chuẩn ngay từ đầu giúp giảm 70% thời gian gọi số rác và tăng gấp đôi tỷ lệ chuyển đổi ra VWW.',
    steps: [
      {
        stepNum: 1,
        title: 'Nạp Data Hàng Loạt (Batch Import)',
        stageBadge: 'Batch Import C3',
        shortDesc: 'Tải lên danh sách 100 - 500 ứng viên từ các chiến dịch Facebook, TikTok, Zalo Ads.',
        checklist: [
          'Vào Lưới Excel (/app/grid) hoặc tính năng Đồng bộ / Nạp hàng loạt.',
          'Paste dữ liệu bảng gồm: Họ tên, Số điện thoại, CCCD (nếu có), Xưởng mong muốn, Nguồn Ads.',
          'Bấm Thực thi Nạp dữ liệu vào hàng đợi xử lý.',
        ],
        actionRoute: '/app/grid',
        actionLabel: 'Mở Lưới Nạp Excel',
      },
      {
        stepNum: 2,
        title: 'Hệ Thống Tự Động Lọc Trùng O(1)',
        stageBadge: 'C3 vs C3.1 vs C3.2',
        shortDesc: 'Thuật toán bóc tách dữ liệu và phân luồng tự động trong vài giây.',
        checklist: [
          'C3 (Data Hợp Lệ): Số điện thoại mới, định dạng chuẩn E.164, sẵn sàng gán cho Telesale.',
          'C3.1 (Số Trùng): Đã đăng ký trong vòng 30 ngày qua → Báo trùng, không tính chi phí mới.',
          'C3.2 (Số Rác): Số điện thoại sai đầu số, thiếu số, spam ảo → Đưa vào danh sách loại trừ.',
        ],
        proTip: 'Theo dõi tỷ lệ C3.2 để điều chỉnh Target đối tượng và biểu mẫu Form trên trình quản lý Ads.',
        actionRoute: '/app/pipeline',
        actionLabel: 'Xem Phân Loại Pipeline',
      },
      {
        stepNum: 3,
        title: 'Gắn Mã Chiến Dịch & Phân Bổ Nguồn',
        shortDesc: 'Định danh rõ nguồn gốc ứng viên để đo lường ROI của từng kênh quảng cáo.',
        checklist: [
          'Kiểm tra UTM Source: FB_ADS_BAC_GIANG, TIKTOK_LUXSHARE, ZALO_TUYEN_DUNG...',
          'Bàn giao kho data sạch đã phân loại cho Trưởng phòng vận hành để phân bổ.',
        ],
        actionRoute: '/app/workers',
        actionLabel: 'Kiểm Tra Kho Lao Động',
      },
      {
        stepNum: 4,
        title: 'Đo Lường Hiệu Quả Chi Phí / VWW (Cost Per VWW)',
        shortDesc: 'Đánh giá chi phí trên mỗi lao động thực tế đi làm đủ 15 ngày.',
        checklist: [
          'Xem báo cáo tỷ lệ chuyển đổi từ C3 ra L4 VWW theo từng chiến dịch.',
          'Tập trung ngân sách cho các chiến dịch có tỷ lệ người lao động gắn bó cao nhất.',
        ],
        actionRoute: '/app/today',
        actionLabel: 'Xem Dashboard Tăng Trưởng',
      },
    ],
  },
  {
    roleId: 'VIEWER',
    matchedRoles: ['VIEWER'],
    title: 'Khách Xem & Trải Nghiệm Hệ Thống',
    shortTitle: 'Người Xem (Viewer)',
    badge: 'CHỈ XEM (READ ONLY)',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: Eye,
    mission:
      'Làm quen với giao diện chuẩn mực quản trị nhân lực Foxconn, tìm hiểu quy trình 19 Level Sale và liên hệ ban quản trị để được phân quyền.',
    vwwImpact:
      'Tài khoản ở chế độ Chỉ đọc để bảo mật tuyệt đối dữ liệu định danh của người lao động doanh nghiệp.',
    steps: [
      {
        stepNum: 1,
        title: 'Trải Nghiệm Dashboard Hôm Nay',
        shortDesc: 'Khám phá cách hệ thống đo lường và hiển thị các chỉ số vận hành thời gian thực.',
        checklist: [
          'Xem các thẻ KPI: Tổng lao động, Deal đang chăm sóc, Lao động đang đi làm, Số đạt chuẩn VWW.',
          'Quan sát luồng vận hành mẫu để hiểu sự kết nối giữa tuyển dụng, hiện trường và kế toán.',
        ],
        actionRoute: '/app',
        actionLabel: 'Xem Dashboard',
      },
      {
        stepNum: 2,
        title: 'Khám Phá Bảng Kanban 19 Cấp Độ',
        shortDesc: 'Tìm hiểu chu trình khép kín từ C3 đến L4.',
        checklist: [
          'Xem cách các thẻ Deal di chuyển qua từng giai đoạn.',
          'Đọc thông tin minh họa về chuẩn định danh VNeID 34 cột.',
        ],
        actionRoute: '/app/pipeline',
        actionLabel: 'Khám Phá Pipeline',
      },
      {
        stepNum: 3,
        title: 'Liên Hệ Nâng Cấp Tài Khoản Nghiệp Vụ',
        shortDesc: 'Để được tạo hồ sơ, gọi tư vấn hoặc đối soát bảng công thật.',
        checklist: [
          'Liên hệ Quản trị viên (Admin) của doanh nghiệp bạn để được gán đúng vai trò.',
          'Sau khi được phê duyệt, đăng xuất và đăng nhập lại để nhận quyền thao tác đầy đủ.',
        ],
        actionRoute: '/app',
        actionLabel: 'Về Trang Chính',
      },
    ],
  },
];

export const SaaSRoleGuideModal: React.FC<SaaSRoleGuideModalProps> = ({
  isOpen,
  onClose,
  defaultRole,
}) => {
  const { currentUser, navigateTo } = useApp();
  const userRole: AppRole = defaultRole || (currentUser?.role as AppRole) || 'VIEWER';

  // Find initial playbook matching user's role
  const initialPlaybook =
    PLAYBOOKS.find(p => p.matchedRoles.includes(userRole)) || PLAYBOOKS[0];

  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(
    initialPlaybook.roleId
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  // Sync with user's role when modal opens
  useEffect(() => {
    if (isOpen) {
      const pb =
        PLAYBOOKS.find(p => p.matchedRoles.includes(userRole)) || PLAYBOOKS[0];
      setSelectedPlaybookId(pb.roleId);
      setCurrentStepIndex(0);
      const isSaved = localStorage.getItem('fcs_hide_saas_onboarding') === 'true';
      setDontShowAgain(isSaved);
    }
  }, [isOpen, userRole]);

  // Active Playbook
  const activePlaybook =
    PLAYBOOKS.find(p => p.roleId === selectedPlaybookId) || PLAYBOOKS[0];

  // Active Step
  const totalSteps = activePlaybook.steps.length;
  const currentStep = activePlaybook.steps[currentStepIndex] || activePlaybook.steps[0];

  const handleRoleSelect = (roleId: string) => {
    setSelectedPlaybookId(roleId);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleActionNavigate = (route: string) => {
    handleSavePreference();
    onClose();
    navigateTo(route);
  };

  const handleSavePreference = () => {
    if (dontShowAgain) {
      localStorage.setItem('fcs_hide_saas_onboarding', 'true');
    } else {
      localStorage.removeItem('fcs_hide_saas_onboarding');
    }
  };

  const handleComplete = () => {
    handleSavePreference();
    onClose();
  };

  const handleSkip = () => {
    handleSavePreference();
    onClose();
  };

  if (!isOpen) return null;

  const ActiveRoleIcon = activePlaybook.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  HƯỚNG DẪN VẬN HÀNH SAAS THEO VAI TRÒ
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700/50 hidden sm:inline-block">
                  CHUẨN VWW
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Quy trình thực chiến chuẩn hóa cho từng nhóm chức năng • Không đoán mò, làm đúng ngay từ đầu
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Bỏ qua / Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Navigation Tabs (Horizontally Scrollable) */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-3 py-2 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1.5 min-w-max">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mr-1 shrink-0">
              Nhóm Vai Trò:
            </span>
            {PLAYBOOKS.map(pb => {
              const isSelected = pb.roleId === selectedPlaybookId;
              const isCurrentUserRole = pb.matchedRoles.includes(userRole);
              const Icon = pb.icon;
              return (
                <button
                  key={pb.roleId}
                  onClick={() => handleRoleSelect(pb.roleId)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{pb.shortTitle}</span>
                  {isCurrentUserRole && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Vai trò hiện tại của bạn" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Active Role Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                <ActiveRoleIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="text-base font-black text-white">{activePlaybook.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${activePlaybook.badgeColor}`}>
                    {activePlaybook.badge}
                  </span>
                  {activePlaybook.matchedRoles.includes(userRole) && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      ★ Vai trò của bạn
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {activePlaybook.mission}
                </p>
              </div>
            </div>

            {/* VWW Impact Card */}
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-[11px] leading-relaxed shrink-0 max-w-xs">
              <div className="font-bold flex items-center space-x-1 text-emerald-300 mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>MỤC TIÊU VWW</span>
              </div>
              <div>{activePlaybook.vwwImpact}</div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">
                Quy Trình 4 Bước Chuẩn Hóa
              </span>
              <span className="font-mono text-blue-400 font-bold">
                Bước {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {activePlaybook.steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <button
                    key={step.stepNum}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`py-2 px-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-950/60 border-blue-500/80 ring-1 ring-blue-500/40'
                        : isPassed
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isActive
                            ? 'bg-blue-500 text-white'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isPassed ? '✓' : step.stepNum}
                      </span>
                      <span className="text-[11px] font-bold truncate">
                        {step.title.split('&')[0]}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isActive
                            ? 'bg-blue-500 w-full'
                            : isPassed
                            ? 'bg-emerald-500 w-full'
                            : 'w-0'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Step Content Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                    BƯỚC {currentStep.stepNum}:
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    {currentStep.title}
                  </h4>
                  {currentStep.stageBadge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-amber-300">
                      {currentStep.stageBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{currentStep.shortDesc}</p>
              </div>

              {/* Direct Quick Action Button */}
              <button
                onClick={() => handleActionNavigate(currentStep.actionRoute)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-blue-600/20 shrink-0 self-start sm:self-auto"
                title={`Chuyển đến màn hình ${currentStep.actionRoute}`}
              >
                <span>{currentStep.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Checklist of Actions */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-300 tracking-wide flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Các Tác Vụ Cụ Thể Cần Thực Hiện:</span>
              </div>
              <div className="space-y-1.5">
                {currentStep.checklist.map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs text-slate-200 flex items-start space-x-2.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip & Warning Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {currentStep.proTip && (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-200 text-xs flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-300 font-bold block mb-0.5">Mẹo thực chiến:</strong>
                    <span>{currentStep.proTip}</span>
                  </div>
                </div>
              )}

              {currentStep.warning && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-bold block mb-0.5">Lưu ý tuân thủ:</strong>
                    <span>{currentStep.warning}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Ribbon & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 shrink-0">
          {/* Don't show again toggle */}
          <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Không tự động hiển thị lại khi đăng nhập</span>
          </label>

          {/* Stepper Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSkip}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Bỏ qua
            </button>

            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevStep}
                className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            )}

            {currentStepIndex < totalSteps - 1 ? (
              <button
                onClick={handleNextStep}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/25 flex items-center space-x-1.5"
              >
                <span>Bước tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/25 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bắt đầu làm việc ngay</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
