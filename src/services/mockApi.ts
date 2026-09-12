import {
  Worker,
  WorkerStatus,
  PipelineEvent,
  PipelineEventType,
  Interview,
  Assignment,
  Attendance,
  MatchingReview,
  ActionQueueItem,
  DashboardMetrics,
  Partner,
  Job,
  Staff,
  Office,
  Priority,
  ActionStatus,
  MatchingStatus,
  ReviewStatus,
  ApiResponse,
  AttendanceReviewItem,
  FollowUpItem,
  DuplicateSuspect,
  PipelineFunnelData,
  OperationalResults,
} from '../types';

// Initial Mock Data
let MOCK_OFFICES: Office[] = [
  { id: 'OFF-01', name: 'Văn phòng Bắc Ninh', code: 'BN', address: 'Số 12 Lý Thái Tổ, TP. Bắc Ninh' },
  { id: 'OFF-02', name: 'Văn phòng Bắc Giang', code: 'BG', address: 'Số 88 Hùng Vương, TP. Bắc Giang' },
  { id: 'OFF-03', name: 'Văn phòng Hà Nội', code: 'HN', address: 'Tòa nhà FCS, Cầu Giấy, Hà Nội' },
];

let MOCK_STAFF: Staff[] = [
  { id: 'ST-00', name: 'Ban Giám Đốc FCS', email: 'ceo-fcs@breaths.live', role: 'ADMIN', officeId: 'OFF-03', officeName: 'Trụ sở Điều hành', activeCandidatesCount: 150 },
  { id: 'ST-01', name: 'Nguyễn Thu Trang', email: 'manager-fcs@breaths.live', role: 'MANAGER', officeId: 'OFF-01', officeName: 'Văn phòng Bắc Ninh', activeCandidatesCount: 42 },
  { id: 'ST-02', name: 'Lê Văn Đức', email: 'staff-fcs@breaths.live', role: 'STAFF', officeId: 'OFF-01', officeName: 'Văn phòng Bắc Ninh', activeCandidatesCount: 28 },
  { id: 'ST-03', name: 'Trần Minh Trí', email: 'tri.tm@breaths.live', role: 'STAFF', officeId: 'OFF-02', officeName: 'Văn phòng Bắc Giang', activeCandidatesCount: 35 },
  { id: 'ST-04', name: 'Vũ Hoàng Lan', email: 'lan.vh@breaths.live', role: 'STAFF', officeId: 'OFF-03', officeName: 'Văn phòng Hà Nội', activeCandidatesCount: 19 },
];

let MOCK_PARTNERS: Partner[] = [
  { id: 'PT-01', name: 'Foxconn Bắc Giang (KCN Quang Châu)', code: 'FOXCONN_BG', location: 'Bắc Giang', industry: 'Lắp ráp điện tử Apple', activeWorkersCount: 310 },
  { id: 'PT-02', name: 'Luxshare ICT Bắc Ninh (KCN VSIP)', code: 'LUXSHARE_BN', location: 'Bắc Ninh', industry: 'Linh kiện tai nghe & cáp sạc', activeWorkersCount: 245 },
  { id: 'PT-03', name: 'Goertek Vina (KCN Quế Võ)', code: 'GOERTEK_QV', location: 'Bắc Ninh', industry: 'Linh kiện âm thanh điện tử', activeWorkersCount: 180 },
  { id: 'PT-04', name: 'Samsung Electronics Thái Nguyên', code: 'SEVT_TN', location: 'Thái Nguyên', industry: 'Sản xuất điện thoại thông minh', activeWorkersCount: 420 },
];

let MOCK_JOBS: Job[] = [
  { id: 'JOB-01', partnerId: 'PT-01', partnerName: 'Foxconn Bắc Giang', title: 'Công nhân lắp ráp Module', salaryRange: '8.5 - 11.5 triệu', location: 'Bắc Giang', vacancies: 80 },
  { id: 'JOB-02', partnerId: 'PT-02', partnerName: 'Luxshare ICT Bắc Ninh', title: 'Công nhân dây chuyền tai nghe', salaryRange: '8.0 - 10.5 triệu', location: 'Bắc Ninh', vacancies: 50 },
  { id: 'JOB-03', partnerId: 'PT-03', partnerName: 'Goertek Vina', title: 'Kiểm tra chất lượng linh kiện (QA/QC)', salaryRange: '9.0 - 12.0 triệu', location: 'Bắc Ninh', vacancies: 35 },
  { id: 'JOB-04', partnerId: 'PT-04', partnerName: 'Samsung Thái Nguyên', title: 'Công nhân đóng gói bao bì điện thoại', salaryRange: '8.8 - 11.0 triệu', location: 'Thái Nguyên', vacancies: 120 },
];

let MOCK_WORKERS: Worker[] = [
  {
    workerId: 'WK-000101',
    fullName: 'Nguyễn Văn An',
    phone: '0912345678',
    cccd: '001200003456',
    dateOfBirth: '1998-05-14',
    gender: 'Nam',
    province: 'Bắc Giang',
    district: 'Việt Yên',
    address: 'Xã Tăng Tiến, Huyện Việt Yên',
    currentNeed: 'Cần việc có phụ cấp tăng ca và ký túc xá',
    desiredJob: 'Lắp ráp điện tử',
    source: 'Zalo Form',
    recruiterId: 'ST-02',
    recruiterName: 'Lê Văn Đức',
    officeId: 'OFF-02',
    officeName: 'Văn phòng Bắc Giang',
    partnerId: 'PT-01',
    partnerName: 'Foxconn Bắc Giang',
    status: WorkerStatus.WORKING,
    isVerifiedWorking: true,
    vwwAchievedAt: '2026-09-08T09:30:00Z',
    lastActivity: 'Khớp công tháng 9 (22 công) - Đạt chuẩn VWW',
    createdAt: '2026-08-25T08:00:00Z',
    updatedAt: '2026-09-08T09:30:00Z',
  },
  {
    workerId: 'WK-000102',
    fullName: 'Trần Thị Mai',
    phone: '0987654321',
    cccd: '034199008765',
    dateOfBirth: '2001-11-20',
    gender: 'Nữ',
    province: 'Bắc Ninh',
    district: 'Yên Phong',
    address: 'Thị trấn Chờ',
    currentNeed: 'Tìm việc ca ngày, bao ăn 2 bữa',
    desiredJob: 'Dây chuyền tai nghe',
    source: 'Người quen giới thiệu',
    recruiterId: 'ST-01',
    recruiterName: 'Nguyễn Thu Trang',
    officeId: 'OFF-01',
    officeName: 'Văn phòng Bắc Ninh',
    partnerId: 'PT-02',
    partnerName: 'Luxshare ICT Bắc Ninh',
    status: WorkerStatus.WAITING_START,
    isVerifiedWorking: false,
    lastActivity: 'Đã đỗ phỏng vấn >24h chưa xác nhận đi làm',
    createdAt: '2026-09-05T10:15:00Z',
    updatedAt: '2026-09-09T14:20:00Z',
  },
  {
    workerId: 'WK-000103',
    fullName: 'Lê Hoàng Nam',
    phone: '0903112233',
    cccd: '025095012345',
    dateOfBirth: '1995-03-08',
    gender: 'Nam',
    province: 'Lạng Sơn',
    district: 'Hữu Lũng',
    currentNeed: 'Cần việc ngay đầu tuần tới',
    desiredJob: 'Kiểm tra chất lượng QA/QC',
    source: 'Facebook',
    recruiterId: 'ST-03',
    recruiterName: 'Trần Minh Trí',
    officeId: 'OFF-02',
    officeName: 'Văn phòng Bắc Giang',
    partnerId: 'PT-03',
    partnerName: 'Goertek Vina',
    status: WorkerStatus.PASSED,
    isVerifiedWorking: false,
    lastActivity: 'Phỏng vấn đạt, chờ ký bàn giao ca',
    createdAt: '2026-09-07T09:00:00Z',
    updatedAt: '2026-09-10T16:00:00Z',
  },
  {
    workerId: 'WK-000104',
    fullName: 'Phạm Thị Hoa',
    phone: '0978334455',
    cccd: '038198005432',
    dateOfBirth: '1998-09-12',
    gender: 'Nữ',
    province: 'Thái Nguyên',
    district: 'Phổ Yên',
    currentNeed: 'Cần công việc có xe đưa đón',
    desiredJob: 'Đóng gói linh kiện',
    source: 'Điểm tuyển dụng trực tiếp',
    recruiterId: 'ST-04',
    recruiterName: 'Vũ Hoàng Lan',
    officeId: 'OFF-03',
    officeName: 'Văn phòng Hà Nội',
    partnerId: 'PT-04',
    partnerName: 'Samsung Thái Nguyên',
    status: WorkerStatus.INTERVIEW_PENDING,
    isVerifiedWorking: false,
    lastActivity: 'Lịch phỏng vấn lúc 14:00 hôm nay',
    createdAt: '2026-09-10T08:30:00Z',
    updatedAt: '2026-09-10T08:30:00Z',
  },
  {
    workerId: 'WK-000105',
    fullName: 'Đặng Văn Dũng',
    phone: '0966778899',
    province: 'Phú Thọ',
    district: 'Thanh Ba',
    currentNeed: 'Mới nộp biểu mẫu, cần tìm việc gấp',
    desiredJob: 'Lao động phổ thông',
    source: 'Zalo Form',
    recruiterId: 'ST-02',
    recruiterName: 'Lê Văn Đức',
    officeId: 'OFF-01',
    officeName: 'Văn phòng Bắc Ninh',
    status: WorkerStatus.NEW,
    isVerifiedWorking: false,
    lastActivity: 'Tiếp nhận hồ sơ từ Google Form',
    createdAt: '2026-09-11T01:45:00Z',
    updatedAt: '2026-09-11T01:45:00Z',
  },
  {
    workerId: 'WK-000106',
    fullName: 'Hoàng Minh Tuấn',
    phone: '0911223344',
    cccd: '019097004321',
    dateOfBirth: '1997-07-22',
    gender: 'Nam',
    province: 'Thái Nguyên',
    district: 'Sông Công',
    currentNeed: 'Đang làm ổn định ca 1',
    desiredJob: 'Lắp ráp điện tử',
    source: 'Điểm tuyển dụng trực tiếp',
    recruiterId: 'ST-04',
    recruiterName: 'Vũ Hoàng Lan',
    officeId: 'OFF-03',
    officeName: 'Văn phòng Hà Nội',
    partnerId: 'PT-04',
    partnerName: 'Samsung Thái Nguyên',
    status: WorkerStatus.WORKING,
    isVerifiedWorking: true,
    vwwAchievedAt: '2026-09-02T11:00:00Z',
    lastActivity: 'Đi làm tuần thứ 2, chấm công đạt chuẩn',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
  },
  {
    workerId: 'WK-000107',
    fullName: 'Vũ Thu Hà',
    phone: '0944556677',
    cccd: '030199009876',
    dateOfBirth: '1999-12-05',
    gender: 'Nữ',
    province: 'Hải Dương',
    district: 'Chí Linh',
    currentNeed: 'Chưa đạt test mắt màu Foxconn, cần tìm xưởng khác',
    desiredJob: 'May mặc hoặc đóng gói',
    source: 'Facebook',
    recruiterId: 'ST-01',
    recruiterName: 'Nguyễn Thu Trang',
    officeId: 'OFF-01',
    officeName: 'Văn phòng Bắc Ninh',
    status: WorkerStatus.FAILED,
    isVerifiedWorking: false,
    lastActivity: 'Không đạt phỏng vấn Foxconn vòng 1',
    createdAt: '2026-09-03T14:00:00Z',
    updatedAt: '2026-09-06T15:30:00Z',
  },
  {
    workerId: 'WK-000108',
    fullName: 'Bùi Quốc Bảo',
    phone: '0933221100',
    cccd: '026096001234',
    dateOfBirth: '1996-04-18',
    gender: 'Nam',
    province: 'Vĩnh Phúc',
    district: 'Bình Xuyên',
    currentNeed: 'Chờ ngày nhận việc nhà máy Quế Võ',
    desiredJob: 'Vận hành máy tự động',
    source: 'Người quen giới thiệu',
    recruiterId: 'ST-02',
    recruiterName: 'Lê Văn Đức',
    officeId: 'OFF-01',
    officeName: 'Văn phòng Bắc Ninh',
    partnerId: 'PT-03',
    partnerName: 'Goertek Vina',
    status: WorkerStatus.WAITING_START,
    isVerifiedWorking: false,
    lastActivity: 'Đã tạo Assignment, dự kiến đi làm thứ 2',
    createdAt: '2026-09-06T09:30:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
  },
  {
    workerId: 'WK-000109',
    fullName: 'Đỗ Kim Oanh',
    phone: '0922334455',
    province: 'Tuyên Quang',
    district: 'Sơn Dương',
    currentNeed: 'Cần tìm việc có hỗ trợ tiền trọ tháng đầu',
    desiredJob: 'Lao động phổ thông',
    source: 'Zalo Form',
    recruiterId: 'ST-03',
    recruiterName: 'Trần Minh Trí',
    officeId: 'OFF-02',
    officeName: 'Văn phòng Bắc Giang',
    status: WorkerStatus.NEW,
    isVerifiedWorking: false,
    lastActivity: 'Chờ nhân viên gọi tư vấn vị trí',
    createdAt: '2026-09-11T02:10:00Z',
    updatedAt: '2026-09-11T02:10:00Z',
  },
  {
    workerId: 'WK-000110',
    fullName: 'Trương Văn Hưng',
    phone: '0918776655',
    cccd: '037094002345',
    dateOfBirth: '1994-08-30',
    gender: 'Nam',
    province: 'Ninh Bình',
    district: 'Nho Quan',
    currentNeed: 'Đã nghỉ việc do bận việc gia đình',
    source: 'Zalo Form',
    recruiterId: 'ST-01',
    recruiterName: 'Nguyễn Thu Trang',
    officeId: 'OFF-01',
    officeName: 'Văn phòng Bắc Ninh',
    partnerId: 'PT-02',
    partnerName: 'Luxshare ICT Bắc Ninh',
    status: WorkerStatus.QUIT,
    isVerifiedWorking: false,
    lastActivity: 'Báo nghỉ việc sau 15 ngày làm',
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-09-01T17:00:00Z',
  },
  {
    workerId: 'WK-000111',
    fullName: 'Phan Văn Cường',
    phone: '0967889900',
    cccd: '031098007654',
    dateOfBirth: '1998-10-10',
    gender: 'Nam',
    province: 'Bắc Ninh',
    district: 'Thuận Thành',
    currentNeed: 'Đã phỏng vấn xong tại Luxshare',
    desiredJob: 'Lắp ráp điện tử',
    source: 'Facebook',
    recruiterId: 'ST-01',
    recruiterName: 'Nguyễn Thu Trang',
    officeId: 'OFF-01',
    officeName: 'Văn phòng Bắc Ninh',
    partnerId: 'PT-02',
    partnerName: 'Luxshare ICT Bắc Ninh',
    status: WorkerStatus.INTERVIEWED,
    isVerifiedWorking: false,
    lastActivity: 'Chờ kết quả đánh giá từ quản lý xưởng',
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-10T15:00:00Z',
  },
  {
    workerId: 'WK-000112',
    fullName: 'Nguyễn Thị Thảo',
    phone: '0982334411',
    cccd: '027199003322',
    dateOfBirth: '1999-01-15',
    gender: 'Nữ',
    province: 'Bắc Giang',
    district: 'Lục Nam',
    currentNeed: 'Làm việc ổn định gắn bó lâu dài',
    desiredJob: 'Lắp ráp điện tử',
    source: 'Điểm tuyển dụng trực tiếp',
    recruiterId: 'ST-03',
    recruiterName: 'Trần Minh Trí',
    officeId: 'OFF-02',
    officeName: 'Văn phòng Bắc Giang',
    partnerId: 'PT-01',
    partnerName: 'Foxconn Bắc Giang',
    status: WorkerStatus.WORKING,
    isVerifiedWorking: true,
    vwwAchievedAt: '2026-09-04T16:00:00Z',
    lastActivity: 'Đã xác nhận chấm công tháng 9 (20 công)',
    createdAt: '2026-08-20T09:00:00Z',
    updatedAt: '2026-09-04T16:00:00Z',
  },
];

let MOCK_PIPELINE_EVENTS: PipelineEvent[] = [
  // Events for WK-000101 (Golden Flow complete)
  {
    id: 'EV-101-1',
    workerId: 'WK-000101',
    eventType: PipelineEventType.REGISTERED,
    title: 'Đăng ký hồ sơ mới',
    description: 'Hồ sơ tiếp nhận tự động qua Google Form & chuẩn hóa dữ liệu',
    timestamp: '2026-08-25T08:00:00Z',
    performedBy: 'Hệ thống tự động',
  },
  {
    id: 'EV-101-2',
    workerId: 'WK-000101',
    eventType: PipelineEventType.INTERVIEW_SCHEDULED,
    title: 'Lên lịch phỏng vấn',
    description: 'Lịch phỏng vấn vị trí Lắp ráp Module tại Foxconn Bắc Giang',
    timestamp: '2026-08-27T10:00:00Z',
    performedBy: 'Lê Văn Đức',
  },
  {
    id: 'EV-101-3',
    workerId: 'WK-000101',
    eventType: PipelineEventType.PASSED,
    title: 'Đạt phỏng vấn',
    description: 'Đạt bài kiểm tra thao tác tay và đối chiếu hồ sơ CCCD',
    timestamp: '2026-08-28T14:30:00Z',
    performedBy: 'Foxconn HR',
  },
  {
    id: 'EV-101-4',
    workerId: 'WK-000101',
    eventType: PipelineEventType.ASSIGNMENT_CREATED,
    title: 'Tạo phân bổ đi làm (Assignment)',
    description: 'Phân bổ vào Xưởng F3 - Ca ngày (06:00 - 14:00)',
    timestamp: '2026-08-29T09:00:00Z',
    performedBy: 'Nguyễn Thu Trang',
  },
  {
    id: 'EV-101-5',
    workerId: 'WK-000101',
    eventType: PipelineEventType.STARTED,
    title: 'Xác nhận bắt đầu làm việc',
    description: 'Lao động đã có mặt tại cổng nhà máy và nhận thẻ chấm công',
    timestamp: '2026-09-01T06:00:00Z',
    performedBy: 'Quản lý điểm đón',
  },
  {
    id: 'EV-101-6',
    workerId: 'WK-000101',
    eventType: PipelineEventType.ATTENDANCE_IMPORTED,
    title: 'Import dữ liệu chấm công thô',
    description: 'Dữ liệu file chấm công từ đối tác Foxconn đợt 1',
    timestamp: '2026-09-07T18:00:00Z',
    performedBy: 'Google Apps Script Trigger',
  },
  {
    id: 'EV-101-7',
    workerId: 'WK-000101',
    eventType: PipelineEventType.ATTENDANCE_CONFIRMED,
    title: 'Khớp thành công 22 công',
    description: 'Trùng khớp chính xác SĐT 0912345678 và Tên (Độ tin cậy 95%)',
    timestamp: '2026-09-08T09:30:00Z',
    performedBy: 'Hệ thống Auto-Match',
  },
  {
    id: 'EV-101-8',
    workerId: 'WK-000101',
    eventType: PipelineEventType.VERIFIED_WORKING,
    title: 'Đạt chuẩn VERIFIED WORKING WORKER (VWW)',
    description: 'Thỏa mãn đầy đủ 4 tiêu chí North Star Metric',
    timestamp: '2026-09-08T09:30:00Z',
    performedBy: 'FCS AI Automation',
  },

  // Events for WK-000102 (PASSED > 24h waiting start)
  {
    id: 'EV-102-1',
    workerId: 'WK-000102',
    eventType: PipelineEventType.REGISTERED,
    title: 'Đăng ký hồ sơ',
    description: 'Nguồn người quen giới thiệu tại KCN VSIP',
    timestamp: '2026-09-05T10:15:00Z',
    performedBy: 'Nguyễn Thu Trang',
  },
  {
    id: 'EV-102-2',
    workerId: 'WK-000102',
    eventType: PipelineEventType.PASSED,
    title: 'Đạt phỏng vấn Luxshare',
    description: 'Đỗ vị trí dây chuyền tai nghe',
    timestamp: '2026-09-08T10:00:00Z',
    performedBy: 'Luxshare HR',
  },
  {
    id: 'EV-102-3',
    workerId: 'WK-000102',
    eventType: PipelineEventType.ASSIGNMENT_CREATED,
    title: 'Đã lên lịch phân bổ',
    description: 'Chờ xác nhận ngày xuất phát và đi xe tuyến',
    timestamp: '2026-09-09T14:20:00Z',
    performedBy: 'Nguyễn Thu Trang',
  },
];

let MOCK_INTERVIEWS: Interview[] = [
  {
    id: 'INT-01',
    workerId: 'WK-000101',
    partnerId: 'PT-01',
    partnerName: 'Foxconn Bắc Giang',
    jobId: 'JOB-01',
    jobTitle: 'Công nhân lắp ráp Module',
    scheduledAt: '2026-08-28T14:00:00Z',
    conductedAt: '2026-08-28T14:30:00Z',
    interviewer: 'Phạm Văn Long (Foxconn HR)',
    result: 'PASSED',
    note: 'Sức khỏe tốt, mắt tinh, sẵn sàng tăng ca',
    createdAt: '2026-08-27T10:00:00Z',
  },
  {
    id: 'INT-02',
    workerId: 'WK-000102',
    partnerId: 'PT-02',
    partnerName: 'Luxshare ICT Bắc Ninh',
    jobId: 'JOB-02',
    jobTitle: 'Công nhân dây chuyền tai nghe',
    scheduledAt: '2026-09-08T09:30:00Z',
    conductedAt: '2026-09-08T10:00:00Z',
    interviewer: 'Trần Thị Thu (Luxshare)',
    result: 'PASSED',
    note: 'Đạt tiêu chuẩn tay nghề cơ bản',
    createdAt: '2026-09-06T11:00:00Z',
  },
  {
    id: 'INT-03',
    workerId: 'WK-000104',
    partnerId: 'PT-04',
    partnerName: 'Samsung Thái Nguyên',
    jobId: 'JOB-04',
    jobTitle: 'Công nhân đóng gói bao bì điện thoại',
    scheduledAt: '2026-09-11T14:00:00Z',
    interviewer: 'Bộ phận Tuyển dụng Samsung',
    result: 'PENDING',
    note: 'Đã nhắn tin thông báo địa điểm và chuẩn bị CCCD gốc',
    createdAt: '2026-09-10T08:30:00Z',
  },
  {
    id: 'INT-04',
    workerId: 'WK-000107',
    partnerId: 'PT-01',
    partnerName: 'Foxconn Bắc Giang',
    jobId: 'JOB-01',
    jobTitle: 'Công nhân lắp ráp Module',
    scheduledAt: '2026-09-06T14:00:00Z',
    conductedAt: '2026-09-06T15:30:00Z',
    interviewer: 'Phạm Văn Long (Foxconn HR)',
    result: 'FAILED',
    note: 'Không phân biệt được màu dây cáp trong bài test màu',
    createdAt: '2026-09-04T10:00:00Z',
  },
];

let MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'ASG-01',
    workerId: 'WK-000101',
    partnerId: 'PT-01',
    partnerName: 'Foxconn Bắc Giang',
    jobId: 'JOB-01',
    jobTitle: 'Công nhân lắp ráp Module',
    shift: 'Ca ngày (06:00 - 14:00)',
    startDate: '2026-09-01',
    startedWorkAt: '2026-09-01T06:00:00Z',
    hasStarted: true,
    status: 'WORKING',
    confirmedByManager: true,
    createdAt: '2026-08-29T09:00:00Z',
  },
  {
    id: 'ASG-02',
    workerId: 'WK-000102',
    partnerId: 'PT-02',
    partnerName: 'Luxshare ICT Bắc Ninh',
    jobId: 'JOB-02',
    jobTitle: 'Công nhân dây chuyền tai nghe',
    shift: 'Ca xoay tuần',
    startDate: '2026-09-12',
    hasStarted: false,
    status: 'SCHEDULED',
    confirmedByManager: true,
    createdAt: '2026-09-09T14:20:00Z',
  },
  {
    id: 'ASG-03',
    workerId: 'WK-000106',
    partnerId: 'PT-04',
    partnerName: 'Samsung Thái Nguyên',
    jobId: 'JOB-04',
    jobTitle: 'Công nhân đóng gói bao bì điện thoại',
    shift: 'Ca hành chính',
    startDate: '2026-08-25',
    startedWorkAt: '2026-08-25T07:30:00Z',
    hasStarted: true,
    status: 'WORKING',
    confirmedByManager: true,
    createdAt: '2026-08-22T10:00:00Z',
  },
  {
    id: 'ASG-04',
    workerId: 'WK-000112',
    partnerId: 'PT-01',
    partnerName: 'Foxconn Bắc Giang',
    jobId: 'JOB-01',
    jobTitle: 'Công nhân lắp ráp Module',
    shift: 'Ca 2 (14:00 - 22:00)',
    startDate: '2026-08-28',
    startedWorkAt: '2026-08-28T14:00:00Z',
    hasStarted: true,
    status: 'WORKING',
    confirmedByManager: true,
    createdAt: '2026-08-25T11:00:00Z',
  },
];

let MOCK_ATTENDANCES: Attendance[] = [
  {
    id: 'ATT-01',
    workerId: 'WK-000101',
    workerName: 'Nguyễn Văn An',
    rawWorkerName: 'NGUYEN VAN AN',
    rawPhone: '0912345678',
    rawCccd: '001200003456',
    partnerId: 'PT-01',
    partnerName: 'Foxconn Bắc Giang',
    workDate: '2026-09-08',
    shift: 'Ca 1',
    daysWorked: 22,
    matchingStatus: MatchingStatus.MATCHED,
    confidenceScore: 95,
    matchedAt: '2026-09-08T09:30:00Z',
    verifiedBy: 'Auto-Match Rule',
    importBatchId: 'BATCH-20260908-01',
    createdAt: '2026-09-08T09:00:00Z',
  },
  {
    id: 'ATT-02',
    rawWorkerName: 'TRAN THI MAI',
    rawPhone: '0987654321',
    partnerId: 'PT-02',
    partnerName: 'Luxshare ICT Bắc Ninh',
    workDate: '2026-09-10',
    shift: 'Ca 1',
    daysWorked: 18,
    matchingStatus: MatchingStatus.REVIEW,
    confidenceScore: 82,
    importBatchId: 'BATCH-20260910-02',
    createdAt: '2026-09-10T17:00:00Z',
  },
  {
    id: 'ATT-03',
    rawWorkerName: 'LE HOANG NAM',
    partnerId: 'PT-03',
    partnerName: 'Goertek Vina',
    workDate: '2026-09-10',
    shift: 'Ca 2',
    daysWorked: 20,
    matchingStatus: MatchingStatus.REVIEW,
    confidenceScore: 78,
    importBatchId: 'BATCH-20260910-03',
    createdAt: '2026-09-10T17:00:00Z',
  },
  {
    id: 'ATT-04',
    rawWorkerName: 'NGUYEN VAN TUAN',
    rawPhone: '0979998877',
    partnerId: 'PT-01',
    partnerName: 'Foxconn Bắc Giang',
    workDate: '2026-09-10',
    daysWorked: 24,
    matchingStatus: MatchingStatus.UNMATCHED,
    confidenceScore: 55,
    importBatchId: 'BATCH-20260910-04',
    createdAt: '2026-09-10T17:00:00Z',
  },
];

let MOCK_MATCHING_REVIEWS: MatchingReview[] = [
  {
    id: 'MR-001',
    attendanceId: 'ATT-02',
    incomingRaw: {
      rawName: 'TRAN THI MAI',
      rawPhone: '0987654321',
      partnerName: 'Luxshare ICT Bắc Ninh',
      daysWorked: 18,
      workDate: '10/09/2026',
      shift: 'Ca ngày',
    },
    suggestedWorker: {
      workerId: 'WK-000102',
      fullName: 'Trần Thị Mai',
      phone: '0987654321',
      cccd: '034199008765',
      partnerName: 'Luxshare ICT Bắc Ninh',
      currentStatus: WorkerStatus.WAITING_START,
      assignmentId: 'ASG-02',
    },
    confidenceScore: 82,
    matchReasons: [
      'Trùng khớp số điện thoại chính xác (0987654321)',
      'Họ tên trùng khớp sau chuẩn hóa (TRAN THI MAI)',
      'Đúng đối tác nhận việc (Luxshare ICT Bắc Ninh)',
      'Cần người duyệt vì trạng thái hồ sơ đang là "Chờ đi làm", chưa kích hoạt ngày bắt đầu thực tế',
    ],
    reviewStatus: ReviewStatus.PENDING,
    createdAt: '2026-09-10T17:15:00Z',
  },
  {
    id: 'MR-002',
    attendanceId: 'ATT-03',
    incomingRaw: {
      rawName: 'LE HOANG NAM',
      rawPhone: undefined,
      rawCccd: undefined,
      partnerName: 'Goertek Vina',
      daysWorked: 20,
      workDate: '10/09/2026',
      shift: 'Ca chiều',
    },
    suggestedWorker: {
      workerId: 'WK-000103',
      fullName: 'Lê Hoàng Nam',
      phone: '0903112233',
      cccd: '025095012345',
      partnerName: 'Goertek Vina',
      currentStatus: WorkerStatus.PASSED,
    },
    confidenceScore: 78,
    matchReasons: [
      'Trùng khớp họ tên không dấu (LE HOANG NAM)',
      'Trùng khớp đối tác tiếp nhận (Goertek Vina)',
      'CẢNH BÁO: Bảng chấm công thiếu số điện thoại & CCCD',
      'Quy tắc hệ thống: Không được tự động khớp nếu chỉ khớp mỗi tên!',
    ],
    reviewStatus: ReviewStatus.PENDING,
    createdAt: '2026-09-10T17:20:00Z',
  },
  {
    id: 'MR-003',
    attendanceId: 'ATT-04',
    incomingRaw: {
      rawName: 'NGUYEN VAN TUAN',
      rawPhone: '0979998877',
      partnerName: 'Foxconn Bắc Giang',
      daysWorked: 24,
      workDate: '10/09/2026',
      shift: 'Ca hành chính',
    },
    confidenceScore: 55,
    matchReasons: [
      'Không tìm thấy số điện thoại 0979998877 trong Master Workers',
      'Độ tin cậy < 75% — Đánh dấu UNMATCHED',
      'Cần quản lý rà soát xem lao động đăng ký qua kênh nào hoặc tạo hồ sơ mới',
    ],
    reviewStatus: ReviewStatus.PENDING,
    createdAt: '2026-09-10T17:25:00Z',
  },
];

let MOCK_ACTION_QUEUE: ActionQueueItem[] = [
  {
    actionId: 'ACT-001',
    priority: Priority.P0,
    actionType: 'UNMATCHED_ATTENDANCE',
    title: '7 bản ghi chấm công chưa khớp',
    reason: 'File chấm công từ Foxconn & Luxshare gửi về có sai lệch SĐT hoặc không kèm CCCD gốc',
    recommendedAction: 'Mở tab CẦN XÁC NHẬN để đối chiếu danh sách đề xuất và duyệt khớp',
    status: ActionStatus.OPEN,
    dueAt: 'Hôm nay - Trước 17:00',
    createdAt: '2026-09-11T01:00:00Z',
    officeId: 'OFF-01',
  },
  {
    actionId: 'ACT-002',
    priority: Priority.P1,
    actionType: 'PASSED_NO_START_24H',
    workerId: 'WK-000102',
    workerName: 'Trần Thị Mai',
    title: '12 lao động đã đậu nhưng chưa xác nhận đi làm',
    reason: 'Đã có kết quả đỗ phỏng vấn quá 24 giờ nhưng chưa có sự kiện STARTED hoặc chưa đón xe',
    recommendedAction: 'Gọi điện cho lao động và trưởng ca để xác nhận lịch có mặt',
    status: ActionStatus.OPEN,
    dueAt: 'Hôm nay - Trong 4 giờ',
    createdAt: '2026-09-11T01:15:00Z',
    officeId: 'OFF-01',
  },
  {
    actionId: 'ACT-003',
    priority: Priority.P1,
    actionType: 'DUPLICATE_RECORD',
    workerId: 'WK-000105',
    workerName: 'Đặng Văn Dũng',
    title: '8 hồ sơ nghi trùng',
    reason: 'Phát hiện trùng lặp Số điện thoại hoặc CCCD từ lượt gửi Google Form lúc sáng nay',
    recommendedAction: 'Kiểm tra hồ sơ nghi trùng trong mục Xác nhận để quyết định Gộp hay Tạo mới',
    status: ActionStatus.OPEN,
    dueAt: 'Hôm nay - Trước 12:00',
    createdAt: '2026-09-11T01:45:00Z',
    officeId: 'OFF-02',
  },
  {
    actionId: 'ACT-004',
    priority: Priority.P2,
    actionType: 'INTERVIEW_PENDING',
    title: '23 lao động phỏng vấn hôm nay',
    reason: 'Lịch phỏng vấn trực tiếp tại các nhà máy Foxconn Bắc Giang và Samsung Thái Nguyên',
    recommendedAction: 'Gửi SMS/Zalo nhắc giờ xe đón và chuẩn bị hồ sơ gốc trước 2 giờ',
    status: ActionStatus.OPEN,
    dueAt: 'Hôm nay - Trước 13:30',
    createdAt: '2026-09-11T02:00:00Z',
    officeId: 'OFF-03',
  },
  {
    actionId: 'ACT-005',
    priority: Priority.P3,
    actionType: 'DATA_MISSING',
    workerId: 'WK-000103',
    workerName: 'Lê Hoàng Nam',
    title: '4 hồ sơ chưa có ảnh CCCD 2 mặt',
    reason: 'Hồ sơ tuyển dụng từ nguồn Facebook chưa bổ sung ảnh chụp CCCD để nộp nhân sự nhà máy',
    recommendedAction: 'Nhắc nhân viên tuyển sinh yêu cầu ứng viên gửi ảnh căn cước',
    status: ActionStatus.OPEN,
    dueAt: 'Ngày mai - 10:00',
    createdAt: '2026-09-10T14:00:00Z',
    officeId: 'OFF-02',
  },
];

// Helper to calculate dashboard metrics
function computeMetrics(): DashboardMetrics {
  const newCount = MOCK_WORKERS.filter(w => w.status === WorkerStatus.NEW).length;
  const interviewPending = MOCK_WORKERS.filter(w => w.status === WorkerStatus.INTERVIEW_PENDING).length;
  const passed = MOCK_WORKERS.filter(w => w.status === WorkerStatus.PASSED).length;
  const waitingStart = MOCK_WORKERS.filter(w => w.status === WorkerStatus.WAITING_START).length;
  const working = MOCK_WORKERS.filter(w => w.status === WorkerStatus.WORKING).length;
  const vwwCount = MOCK_WORKERS.filter(w => w.isVerifiedWorking).length;

  const openActions = MOCK_ACTION_QUEUE.filter(a => a.status === ActionStatus.OPEN);
  const p0 = openActions.filter(a => a.priority === Priority.P0).length;
  const p1 = openActions.filter(a => a.priority === Priority.P1).length;
  const p2 = openActions.filter(a => a.priority === Priority.P2).length;
  const p3 = openActions.filter(a => a.priority === Priority.P3).length;

  const pendingAttendanceCount = MOCK_MATCHING_REVIEWS.filter(r => r.reviewStatus === ReviewStatus.PENDING).length;
  const openFollowUpCount = MOCK_WORKERS.filter(
    w => w.status === WorkerStatus.PASSED || w.status === WorkerStatus.WAITING_START
  ).length;
  const duplicateSuspectCount = 2;
  const interviewsTodayCount = interviewPending;

  const totalPassedAndBeyond = passed + waitingStart + working;
  const startRate = totalPassedAndBeyond > 0 ? Math.round((working / totalPassedAndBeyond) * 100) : 0;
  const totalAtt = MOCK_ATTENDANCES.length;
  const matchedAtt = MOCK_ATTENDANCES.filter(a => a.matchingStatus === MatchingStatus.MATCHED).length;
  const matchRate = totalAtt > 0 ? Math.round((matchedAtt / totalAtt) * 100) : 75;

  return {
    totalActionsNeedAttention: openActions.length,
    priorityBreakdown: { p0, p1, p2, p3 },
    pipelineCounts: {
      newWorkers: newCount,
      interviewPending: interviewPending,
      passed: passed,
      waitingStart: waitingStart,
      working: working,
      verifiedWorkingWorkers: vwwCount,
    },
    rates: {
      startRate,
      matchRate,
      dropOffCount: MOCK_WORKERS.filter(w => w.status === WorkerStatus.FAILED || w.status === WorkerStatus.QUIT).length,
    },
    todayActionSummary: {
      unmatchedAttendanceCount: pendingAttendanceCount,
      passedWaitingStartCount: openFollowUpCount,
      duplicateSuspectCount: duplicateSuspectCount,
      interviewsTodayCount: interviewsTodayCount,
    },
    luckySuggestions: [
      {
        id: 'LUK-01',
        text: 'Ưu tiên xác nhận 7 bản ghi chấm công chưa khớp để kịp chốt dữ liệu công ngày cho đối tác Foxconn.',
        priority: Priority.P0,
        type: 'ATTENDANCE_MATCH',
        actionLabel: 'Xác nhận ngay',
        targetRoute: '/review?type=matching',
      },
      {
        id: 'LUK-02',
        text: '12 lao động đã đậu quá 24 giờ nhưng chưa có xác nhận đi làm. Cần gọi đôn đốc xe đón trước 11:30.',
        priority: Priority.P1,
        type: 'SLA_FOLLOWUP',
        actionLabel: 'Xem danh sách',
        targetRoute: '/review?type=followup',
      },
      {
        id: 'LUK-03',
        text: '8 hồ sơ nghi trùng số điện thoại vừa gửi qua Google Form. Kiểm tra trước khi gọi phỏng vấn.',
        priority: Priority.P1,
        type: 'DUPLICATE_CHECK',
        actionLabel: 'Xử lý trùng',
        targetRoute: '/review?type=duplicate',
      },
    ],
  };
}

// Simulated network delay
const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async getDashboard(): Promise<DashboardMetrics> {
    await delay();
    return computeMetrics();
  },

  async getTodayActions(): Promise<ActionQueueItem[]> {
    await delay();
    return MOCK_ACTION_QUEUE.filter(a => a.status === ActionStatus.OPEN);
  },

  async getWorkers(filters?: {
    search?: string;
    officeId?: string;
    recruiterId?: string;
    status?: string;
    partnerId?: string;
  }): Promise<Worker[]> {
    await delay();
    let result = [...MOCK_WORKERS];
    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          w =>
            w.workerId.toLowerCase().includes(q) ||
            w.fullName.toLowerCase().includes(q) ||
            w.phone.includes(q) ||
            (w.cccd && w.cccd.includes(q))
        );
      }
      if (filters.officeId && filters.officeId !== 'ALL') {
        result = result.filter(w => w.officeId === filters.officeId);
      }
      if (filters.recruiterId && filters.recruiterId !== 'ALL') {
        result = result.filter(w => w.recruiterId === filters.recruiterId);
      }
      if (filters.status && filters.status !== 'ALL') {
        if (filters.status === 'VWW') {
          result = result.filter(w => w.isVerifiedWorking);
        } else {
          result = result.filter(w => w.status === filters.status);
        }
      }
      if (filters.partnerId && filters.partnerId !== 'ALL') {
        result = result.filter(w => w.partnerId === filters.partnerId);
      }
    }
    return result;
  },

  async getWorker(workerId: string): Promise<Worker | null> {
    await delay();
    const worker = MOCK_WORKERS.find(w => w.workerId === workerId);
    return worker || null;
  },

  async createWorker(payload: {
    fullName: string;
    phone: string;
    province: string;
    currentNeed: string;
    needNote?: string;
    dateOfBirth?: string;
    gender?: 'Nam' | 'Nữ' | 'Khác';
    cccd?: string;
    district?: string;
    address?: string;
    source?: string;
    desiredJob?: string;
    officeId?: string;
    recruiterId?: string;
    overrideDuplicate?: boolean;
    forceCreate?: boolean;
  }): Promise<{ worker?: Worker; duplicateWarning?: boolean; existingWorker?: Worker }> {
    await delay();

    // Check duplicate if not overridden
    if (!payload.overrideDuplicate && !payload.forceCreate) {
      const cleanPhone = payload.phone.replace(/\D/g, '');
      const cleanCccd = payload.cccd ? payload.cccd.replace(/\D/g, '') : null;

      const dup = MOCK_WORKERS.find(w => {
        const pMatch = w.phone.replace(/\D/g, '') === cleanPhone;
        const cMatch = cleanCccd && w.cccd && w.cccd.replace(/\D/g, '') === cleanCccd;
        return pMatch || cMatch;
      });

      if (dup) {
        return {
          duplicateWarning: true,
          existingWorker: dup,
        };
      }
    }

    // Generate Worker ID automatically
    const nextNum = MOCK_WORKERS.length + 101;
    const workerId = `WK-${String(nextNum).padStart(6, '0')}`;
    const office = MOCK_OFFICES.find(o => o.id === payload.officeId) || MOCK_OFFICES[0];
    const recruiter = MOCK_STAFF.find(s => s.id === payload.recruiterId) || MOCK_STAFF[0];

    const newWorker: Worker = {
      workerId,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      cccd: payload.cccd?.trim(),
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
      province: payload.province.trim(),
      district: payload.district?.trim(),
      address: payload.address?.trim(),
      currentNeed: payload.currentNeed.trim(),
      desiredJob: payload.desiredJob?.trim() || 'Lao động phổ thông',
      source: payload.source || 'Zalo Form',
      recruiterId: recruiter.id,
      recruiterName: recruiter.name,
      officeId: office.id,
      officeName: office.name,
      status: WorkerStatus.NEW,
      isVerifiedWorking: false,
      lastActivity: 'Hồ sơ mới tiếp nhận, chờ tư vấn',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_WORKERS.unshift(newWorker);

    // Create REGISTERED event
    MOCK_PIPELINE_EVENTS.push({
      id: `EV-${workerId}-REG`,
      workerId,
      eventType: PipelineEventType.REGISTERED,
      title: 'Đăng ký hồ sơ mới',
      description: `Hồ sơ tiếp nhận từ nguồn ${newWorker.source}. Hệ thống cấp mã ${workerId}`,
      timestamp: new Date().toISOString(),
      performedBy: 'Hệ thống tự động',
    });

    return { worker: newWorker };
  },

  async updateWorker(workerId: string, payload: Partial<Worker>): Promise<Worker | null> {
    await delay();
    const index = MOCK_WORKERS.findIndex(w => w.workerId === workerId);
    if (index === -1) return null;
    MOCK_WORKERS[index] = {
      ...MOCK_WORKERS[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return MOCK_WORKERS[index];
  },

  async getPipelineEvents(workerId: string): Promise<PipelineEvent[]> {
    await delay();
    return MOCK_PIPELINE_EVENTS.filter(e => e.workerId === workerId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  async createInterview(payload: {
    workerId: string;
    partnerId: string;
    jobId: string;
    scheduledAt: string;
    interviewer: string;
    note?: string;
  }): Promise<Interview> {
    await delay();
    const partner = MOCK_PARTNERS.find(p => p.id === payload.partnerId) || MOCK_PARTNERS[0];
    const job = MOCK_JOBS.find(j => j.id === payload.jobId) || MOCK_JOBS[0];

    const interview: Interview = {
      id: `INT-${Date.now().toString().slice(-4)}`,
      workerId: payload.workerId,
      partnerId: partner.id,
      partnerName: partner.name,
      jobId: job.id,
      jobTitle: job.title,
      scheduledAt: payload.scheduledAt,
      interviewer: payload.interviewer,
      result: 'PENDING',
      note: payload.note,
      createdAt: new Date().toISOString(),
    };

    MOCK_INTERVIEWS.unshift(interview);

    // Update worker status to INTERVIEW_PENDING
    const worker = MOCK_WORKERS.find(w => w.workerId === payload.workerId);
    if (worker) {
      worker.status = WorkerStatus.INTERVIEW_PENDING;
      worker.partnerId = partner.id;
      worker.partnerName = partner.name;
      worker.lastActivity = `Lên lịch phỏng vấn tại ${partner.name}`;
      worker.updatedAt = new Date().toISOString();
    }

    MOCK_PIPELINE_EVENTS.push({
      id: `EV-${payload.workerId}-${Date.now()}`,
      workerId: payload.workerId,
      eventType: PipelineEventType.INTERVIEW_SCHEDULED,
      title: 'Lên lịch phỏng vấn',
      description: `Phỏng vấn vị trí ${job.title} tại ${partner.name}`,
      timestamp: new Date().toISOString(),
      performedBy: payload.interviewer || 'Quản lý',
    });

    return interview;
  },

  async recordInterviewResult(
    interviewId: string,
    result: 'PASSED' | 'FAILED',
    note?: string
  ): Promise<Interview | null> {
    await delay();
    const intIndex = MOCK_INTERVIEWS.findIndex(i => i.id === interviewId);
    if (intIndex === -1) return null;

    MOCK_INTERVIEWS[intIndex].result = result;
    MOCK_INTERVIEWS[intIndex].conductedAt = new Date().toISOString();
    if (note) MOCK_INTERVIEWS[intIndex].note = note;

    const workerId = MOCK_INTERVIEWS[intIndex].workerId;
    const worker = MOCK_WORKERS.find(w => w.workerId === workerId);
    if (worker) {
      worker.status = result === 'PASSED' ? WorkerStatus.PASSED : WorkerStatus.FAILED;
      worker.lastActivity =
        result === 'PASSED'
          ? `Đã đỗ phỏng vấn tại ${MOCK_INTERVIEWS[intIndex].partnerName}`
          : `Không đạt phỏng vấn tại ${MOCK_INTERVIEWS[intIndex].partnerName}`;
      worker.updatedAt = new Date().toISOString();
    }

    MOCK_PIPELINE_EVENTS.push({
      id: `EV-${workerId}-${Date.now()}`,
      workerId,
      eventType: result === 'PASSED' ? PipelineEventType.PASSED : PipelineEventType.FAILED,
      title: result === 'PASSED' ? 'Đạt phỏng vấn (PASSED)' : 'Không đạt phỏng vấn (FAILED)',
      description: note || (result === 'PASSED' ? 'Đủ điều kiện tiếp nhận đi làm' : 'Chưa đạt yêu cầu'),
      timestamp: new Date().toISOString(),
      performedBy: 'Bộ phận phỏng vấn',
    });

    return MOCK_INTERVIEWS[intIndex];
  },

  async getWorkerInterviews(workerId: string): Promise<Interview[]> {
    await delay();
    return MOCK_INTERVIEWS.filter(i => i.workerId === workerId);
  },

  async createAssignment(payload: {
    workerId: string;
    partnerId: string;
    jobId: string;
    shift: string;
    startDate: string;
    markAsStartedNow?: boolean;
  }): Promise<Assignment> {
    await delay();
    const partner = MOCK_PARTNERS.find(p => p.id === payload.partnerId) || MOCK_PARTNERS[0];
    const job = MOCK_JOBS.find(j => j.id === payload.jobId) || MOCK_JOBS[0];

    const assignment: Assignment = {
      id: `ASG-${Date.now().toString().slice(-4)}`,
      workerId: payload.workerId,
      partnerId: partner.id,
      partnerName: partner.name,
      jobId: job.id,
      jobTitle: job.title,
      shift: payload.shift,
      startDate: payload.startDate,
      startedWorkAt: payload.markAsStartedNow ? new Date().toISOString() : undefined,
      hasStarted: !!payload.markAsStartedNow,
      status: payload.markAsStartedNow ? 'WORKING' : 'SCHEDULED',
      confirmedByManager: true,
      createdAt: new Date().toISOString(),
    };

    MOCK_ASSIGNMENTS.unshift(assignment);

    const worker = MOCK_WORKERS.find(w => w.workerId === payload.workerId);
    if (worker) {
      worker.status = payload.markAsStartedNow ? WorkerStatus.WORKING : WorkerStatus.WAITING_START;
      worker.partnerId = partner.id;
      worker.partnerName = partner.name;
      worker.lastActivity = payload.markAsStartedNow
        ? `Đã bắt đầu đi làm tại ${partner.name}`
        : `Chờ đi làm tại ${partner.name} (${payload.startDate})`;
      worker.updatedAt = new Date().toISOString();
    }

    MOCK_PIPELINE_EVENTS.push({
      id: `EV-${payload.workerId}-${Date.now()}-1`,
      workerId: payload.workerId,
      eventType: PipelineEventType.ASSIGNMENT_CREATED,
      title: 'Tạo phân bổ đi làm (Assignment)',
      description: `Phân bổ xưởng: ${partner.name} - ${job.title} (${payload.shift})`,
      timestamp: new Date().toISOString(),
      performedBy: 'Quản lý vận hành',
    });

    if (payload.markAsStartedNow) {
      MOCK_PIPELINE_EVENTS.push({
        id: `EV-${payload.workerId}-${Date.now()}-2`,
        workerId: payload.workerId,
        eventType: PipelineEventType.STARTED,
        title: 'Bắt đầu đi làm thực tế',
        description: `Lao động đã nhận ca và bắt đầu làm việc tại xưởng`,
        timestamp: new Date().toISOString(),
        performedBy: 'Quản lý điểm đón',
      });
    }

    return assignment;
  },

  async confirmWorkerStarted(assignmentId: string): Promise<Assignment | null> {
    await delay();
    const asg = MOCK_ASSIGNMENTS.find(a => a.id === assignmentId);
    if (!asg) return null;

    asg.hasStarted = true;
    asg.startedWorkAt = new Date().toISOString();
    asg.status = 'WORKING';

    const worker = MOCK_WORKERS.find(w => w.workerId === asg.workerId);
    if (worker) {
      worker.status = WorkerStatus.WORKING;
      worker.lastActivity = `Đã bắt đầu đi làm tại ${asg.partnerName}`;
      worker.updatedAt = new Date().toISOString();

      MOCK_PIPELINE_EVENTS.push({
        id: `EV-${worker.workerId}-${Date.now()}`,
        workerId: worker.workerId,
        eventType: PipelineEventType.STARTED,
        title: 'Xác nhận bắt đầu làm việc',
        description: 'Lao động đã có mặt tại nhà máy nhận ca',
        timestamp: new Date().toISOString(),
        performedBy: 'Quản lý vận hành',
      });
    }

    return asg;
  },

  async getWorkerAssignments(workerId: string): Promise<Assignment[]> {
    await delay();
    return MOCK_ASSIGNMENTS.filter(a => a.workerId === workerId);
  },

  async getWorkerAttendance(workerId: string): Promise<Attendance[]> {
    await delay();
    return MOCK_ATTENDANCES.filter(a => a.workerId === workerId);
  },

  async getMatchingQueue(): Promise<MatchingReview[]> {
    await delay();
    return [...MOCK_MATCHING_REVIEWS];
  },

  async confirmMatch(reviewId: string, workerId: string): Promise<boolean> {
    await delay();
    const revIndex = MOCK_MATCHING_REVIEWS.findIndex(r => r.id === reviewId);
    if (revIndex === -1) return false;

    const review = MOCK_MATCHING_REVIEWS[revIndex];
    review.reviewStatus = ReviewStatus.CONFIRMED;
    review.reviewedAt = new Date().toISOString();
    review.reviewedBy = 'Quản lý vận hành';

    // Update attendance record
    const att = MOCK_ATTENDANCES.find(a => a.id === review.attendanceId);
    if (att) {
      att.matchingStatus = MatchingStatus.MATCHED;
      att.workerId = workerId;
      att.matchedAt = new Date().toISOString();
      att.verifiedBy = 'Quản lý duyệt';
    }

    // Check North Star Metric VWW rule:
    // 1. Unique Worker ID exists (Yes)
    // 2. Valid assignment exists (check or create)
    // 3. Worker started work (mark started if not yet)
    // 4. At least one attendance record verified (Yes!)
    const worker = MOCK_WORKERS.find(w => w.workerId === workerId);
    if (worker) {
      let asg = MOCK_ASSIGNMENTS.find(a => a.workerId === workerId);
      if (!asg) {
        asg = {
          id: `ASG-${Date.now().toString().slice(-4)}`,
          workerId,
          partnerId: 'PT-01',
          partnerName: review.incomingRaw.partnerName,
          jobId: 'JOB-01',
          jobTitle: 'Lao động phổ thông',
          shift: review.incomingRaw.shift || 'Ca hành chính',
          startDate: new Date().toISOString().slice(0, 10),
          startedWorkAt: new Date().toISOString(),
          hasStarted: true,
          status: 'WORKING',
          confirmedByManager: true,
          createdAt: new Date().toISOString(),
        };
        MOCK_ASSIGNMENTS.unshift(asg);
      } else {
        asg.hasStarted = true;
        asg.status = 'WORKING';
      }

      worker.status = WorkerStatus.WORKING;
      worker.isVerifiedWorking = true;
      worker.vwwAchievedAt = new Date().toISOString();
      worker.lastActivity = `Khớp ${review.incomingRaw.daysWorked} công - Đạt chuẩn VWW`;
      worker.updatedAt = new Date().toISOString();

      MOCK_PIPELINE_EVENTS.push({
        id: `EV-${workerId}-${Date.now()}-CONF`,
        workerId,
        eventType: PipelineEventType.ATTENDANCE_CONFIRMED,
        title: `Khớp thành công ${review.incomingRaw.daysWorked} công`,
        description: `Đối chiếu thành công dữ liệu từ ${review.incomingRaw.partnerName}`,
        timestamp: new Date().toISOString(),
        performedBy: 'Quản lý xác nhận',
      });

      MOCK_PIPELINE_EVENTS.push({
        id: `EV-${workerId}-${Date.now()}-VWW`,
        workerId,
        eventType: PipelineEventType.VERIFIED_WORKING,
        title: 'Đạt chuẩn VERIFIED WORKING WORKER (VWW)',
        description: 'Đã hoàn tất chu trình vàng: Có Worker ID + Assignment + Đi làm + Đã xác nhận chấm công',
        timestamp: new Date().toISOString(),
        performedBy: 'Hệ thống FCS',
      });
    }

    return true;
  },

  async rejectMatch(reviewId: string, reason?: string): Promise<boolean> {
    await delay();
    const rev = MOCK_MATCHING_REVIEWS.find(r => r.id === reviewId);
    if (!rev) return false;
    rev.reviewStatus = ReviewStatus.REJECTED;
    rev.resolutionNote = reason || 'Quản lý xác nhận không khớp hồ sơ';
    rev.reviewedAt = new Date().toISOString();

    const att = MOCK_ATTENDANCES.find(a => a.id === rev.attendanceId);
    if (att) {
      att.matchingStatus = MatchingStatus.UNMATCHED;
    }
    return true;
  },

  async assignDifferentWorker(reviewId: string, newWorkerId: string): Promise<boolean> {
    await delay();
    const rev = MOCK_MATCHING_REVIEWS.find(r => r.id === reviewId);
    const worker = MOCK_WORKERS.find(w => w.workerId === newWorkerId);
    if (!rev || !worker) return false;

    rev.suggestedWorker = {
      workerId: worker.workerId,
      fullName: worker.fullName,
      phone: worker.phone,
      cccd: worker.cccd,
      partnerName: worker.partnerName,
      currentStatus: worker.status,
    };
    rev.confidenceScore = 90;
    rev.matchReasons = ['Đã được Quản lý chỉ định ghép thủ công'];

    return mockApi.confirmMatch(reviewId, newWorkerId);
  },

  async resolveAction(actionId: string, resolution: string): Promise<boolean> {
    await delay();
    const item = MOCK_ACTION_QUEUE.find(a => a.actionId === actionId);
    if (!item) return false;
    item.status = ActionStatus.DONE;
    return true;
  },

  async dismissAction(actionId: string): Promise<boolean> {
    await delay();
    const item = MOCK_ACTION_QUEUE.find(a => a.actionId === actionId);
    if (!item) return false;
    item.status = ActionStatus.DISMISSED;
    return true;
  },

  async getPartners(): Promise<Partner[]> {
    await delay();
    return [...MOCK_PARTNERS];
  },

  async getJobs(): Promise<Job[]> {
    await delay();
    return [...MOCK_JOBS];
  },

  async getStaff(): Promise<Staff[]> {
    await delay();
    return [...MOCK_STAFF];
  },

  async getOffices(): Promise<Office[]> {
    await delay();
    return [...MOCK_OFFICES];
  },

  // Golden Flow Simulator Helpers for Testing & Acceptance
  async runGoldenFlow(flowId: 'GF-001' | 'GF-002' | 'GF-003' | 'GF-004' | 'GF-005'): Promise<{
    message: string;
    workerId?: string;
  }> {
    await delay(300);
    if (flowId === 'GF-001') {
      // Happy Path: Create worker -> Interview -> Assignment -> Attendance Match -> VWW!
      const wRes = await mockApi.createWorker({
        fullName: 'Nguyễn Văn An (Demo GF-001)',
        phone: '0919888777',
        province: 'Bắc Giang',
        currentNeed: 'Tìm việc gấp tại Foxconn',
        overrideDuplicate: true,
      });
      const wId = wRes.worker!.workerId;

      const int = await mockApi.createInterview({
        workerId: wId,
        partnerId: 'PT-01',
        jobId: 'JOB-01',
        scheduledAt: new Date().toISOString(),
        interviewer: 'Foxconn HR',
        note: 'Bài test chuẩn mực',
      });
      await mockApi.recordInterviewResult(int.id, 'PASSED', 'Đạt yêu cầu xuất sắc');

      await mockApi.createAssignment({
        workerId: wId,
        partnerId: 'PT-01',
        jobId: 'JOB-01',
        shift: 'Ca ngày',
        startDate: new Date().toISOString().slice(0, 10),
        markAsStartedNow: true,
      });

      // Confirm attendance match
      const revId = `MR-GF001-${Date.now()}`;
      MOCK_MATCHING_REVIEWS.unshift({
        id: revId,
        attendanceId: `ATT-GF001-${Date.now()}`,
        incomingRaw: {
          rawName: 'NGUYEN VAN AN',
          rawPhone: '0919888777',
          partnerName: 'Foxconn Bắc Giang',
          daysWorked: 22,
          workDate: new Date().toISOString().slice(0, 10),
          shift: 'Ca ngày',
        },
        suggestedWorker: {
          workerId: wId,
          fullName: 'Nguyễn Văn An (Demo GF-001)',
          phone: '0919888777',
          currentStatus: WorkerStatus.WORKING,
        },
        confidenceScore: 98,
        matchReasons: ['Trùng khớp SĐT 100%', 'Trùng tên sau chuẩn hóa', 'Trùng đối tác Foxconn'],
        reviewStatus: ReviewStatus.PENDING,
        createdAt: new Date().toISOString(),
      });

      await mockApi.confirmMatch(revId, wId);

      return {
        message: 'Hoàn tất GF-001 Happy Path: Lao động đạt chuẩn VERIFIED WORKING WORKER (VWW)!',
        workerId: wId,
      };
    }

    if (flowId === 'GF-002') {
      return {
        message: 'GF-002: Thử tạo lao động với SĐT 0912345678 hoặc CCCD 001200003456 để thấy cảnh báo trùng!',
      };
    }

    if (flowId === 'GF-003') {
      return {
        message: 'GF-003: Bản ghi MR-002 (Trùng tên, không có SĐT) đang đợi người duyệt tại trang CẦN XÁC NHẬN!',
      };
    }

    if (flowId === 'GF-004') {
      return {
        message: 'GF-004: Bản ghi MR-003 (Không khớp danh sách) đã tạo Action Item và không tự động xác nhận!',
      };
    }

    if (flowId === 'GF-005') {
      return {
        message: 'GF-005: Lao động WK-000102 (Trần Thị Mai) đã đậu >24h chưa đi làm, tự động tạo cảnh báo P1!',
        workerId: 'WK-000102',
      };
    }

    return { message: 'Đã hoàn tất quy trình kiểm thử' };
  },

  async getAttendanceReviews(): Promise<any[]> {
    await delay();
    return MOCK_MATCHING_REVIEWS
      .filter(r => r.reviewStatus === ReviewStatus.PENDING)
      .map(r => ({
        id: r.id,
        attendanceId: r.attendanceId,
        rawWorkerName: r.incomingRaw.rawName,
        rawPhone: r.incomingRaw.rawPhone,
        rawCccd: r.incomingRaw.rawCccd,
        partnerName: r.incomingRaw.partnerName,
        workDate: r.incomingRaw.workDate,
        daysWorked: r.incomingRaw.daysWorked,
        confidenceScore: r.confidenceScore,
        reason: r.matchReasons.join('; '),
        suggestedWorker: r.suggestedWorker
          ? {
              workerId: r.suggestedWorker.workerId,
              fullName: r.suggestedWorker.fullName,
              phone: r.suggestedWorker.phone,
              assignedPartner: r.suggestedWorker.partnerName,
              status: r.suggestedWorker.currentStatus,
              isVerifiedWorking: MOCK_WORKERS.find(w => w.workerId === r.suggestedWorker?.workerId)?.isVerifiedWorking || false,
            }
          : undefined,
      }));
  },

  async confirmAttendanceMatch(reviewId: string, matchedWorkerId?: string): Promise<{ success: boolean; message: string }> {
    const rev = MOCK_MATCHING_REVIEWS.find(r => r.id === reviewId);
    const targetWorkerId = matchedWorkerId || rev?.suggestedWorker?.workerId;
    if (!targetWorkerId) {
      throw new Error('Chưa có mã lao động để khớp');
    }
    await mockApi.confirmMatch(reviewId, targetWorkerId);
    return {
      success: true,
      message: `Đã khớp thành công cho lao động ${targetWorkerId} và mở khóa tiêu chuẩn VWW!`,
    };
  },

  async ignoreAttendance(reviewId: string): Promise<boolean> {
    return mockApi.rejectMatch(reviewId, 'Tạm hoãn xác nhận');
  },

  async getFollowUpQueue(): Promise<any[]> {
    await delay();
    const passedWorkers = MOCK_WORKERS.filter(
      w => w.status === WorkerStatus.PASSED || w.status === WorkerStatus.WAITING_START
    );
    return passedWorkers.map(w => ({
      id: `FOL-${w.workerId}`,
      workerId: w.workerId,
      workerName: w.fullName,
      phone: w.phone,
      partnerName: w.partnerName || 'Chưa gán xưởng',
      currentStatus: w.status,
      slaHours: 26,
      reason: 'Đã có kết quả đậu phỏng vấn quá 24h nhưng chưa chốt ngày đi làm',
      dueAt: '17:00 hôm nay',
    }));
  },

  async resolveFollowUp(itemId: string, resolution: string): Promise<boolean> {
    await delay();
    return true;
  },

  async updateWorkerStatus(workerId: string, status: WorkerStatus, note?: string): Promise<boolean> {
    await delay();
    const worker = MOCK_WORKERS.find(w => w.workerId === workerId);
    if (!worker) return false;
    worker.status = status;
    if (note) worker.lastActivity = note;
    worker.updatedAt = new Date().toISOString();
    return true;
  },

  async getDuplicateSuspects(): Promise<any[]> {
    await delay();
    return [
      {
        id: 'DUP-001',
        workerA: {
          workerId: 'WK-000101',
          fullName: 'Nguyễn Văn An',
          phone: '0912345678',
          cccd: '001200003456',
          province: 'Bắc Giang',
          recruiterName: 'Nguyễn Thu Trang',
        },
        workerB: {
          workerId: 'WK-000108',
          fullName: 'Nguyễn Văn An',
          phone: '0912345678',
          cccd: '001200003456',
          province: 'Bắc Giang',
          recruiterName: 'Lê Văn Đức',
        },
        reason: 'Trùng khớp 100% Số điện thoại và số CCCD',
        detectedAt: '10:30 hôm nay',
      },
      {
        id: 'DUP-002',
        workerA: {
          workerId: 'WK-000103',
          fullName: 'Lê Văn Cường',
          phone: '0934567890',
          cccd: '025200005678',
          province: 'Phú Thọ',
          recruiterName: 'Trần Minh Trí',
        },
        workerB: {
          workerId: 'WK-000109',
          fullName: 'Lê Cường',
          phone: '0934567890',
          province: 'Phú Thọ',
          recruiterName: 'Nguyễn Thu Trang',
        },
        reason: 'Trùng khớp Số điện thoại (Tên gần đúng)',
        detectedAt: 'Hôm qua',
      },
    ];
  },

  async mergeDuplicates(primaryWorkerId: string, secondaryWorkerId: string): Promise<boolean> {
    await delay();
    const secWorkerIndex = MOCK_WORKERS.findIndex(w => w.workerId === secondaryWorkerId);
    if (secWorkerIndex !== -1) {
      MOCK_WORKERS.splice(secWorkerIndex, 1);
    }
    return true;
  },

  async dismissDuplicate(suspectId: string): Promise<boolean> {
    await delay();
    return true;
  },

  async getPipelineFunnel(): Promise<any[]> {
    await delay();
    const totalNew = MOCK_WORKERS.filter(w => w.status === WorkerStatus.NEW).length;
    const totalInterviewPending = MOCK_WORKERS.filter(w => w.status === WorkerStatus.INTERVIEW_PENDING).length;
    const totalPassed = MOCK_WORKERS.filter(w => w.status === WorkerStatus.PASSED).length;
    const totalWaitingStart = MOCK_WORKERS.filter(w => w.status === WorkerStatus.WAITING_START).length;
    const totalWorking = MOCK_WORKERS.filter(w => w.status === WorkerStatus.WORKING).length;
    const totalVww = MOCK_WORKERS.filter(w => w.isVerifiedWorking).length;
    const totalQuit = MOCK_WORKERS.filter(w => w.status === WorkerStatus.QUIT).length;

    return [
      { stageKey: 'NEW', stageName: 'LAO ĐỘNG MỚI', count: totalNew },
      { stageKey: 'INTERVIEW_PENDING', stageName: 'PHỎNG VẤN', count: totalInterviewPending, slaWarning: '5 lao động đang chờ phỏng vấn > 48h' },
      { stageKey: 'PASSED', stageName: 'ĐÃ ĐẬU', count: totalPassed, slaWarning: '3 lao động đã đậu > 24h chưa chốt xe' },
      { stageKey: 'WAITING_START', stageName: 'CHỜ ĐI LÀM', count: totalWaitingStart },
      { stageKey: 'WORKING', stageName: 'ĐANG LÀM', count: totalWorking },
      { stageKey: 'VWW', stageName: 'ĐI LÀM ĐÃ XÁC MINH', count: totalVww, sublabel: 'Verified Working — VWW' },
    ];
  },

  async getOperationalResults(): Promise<any> {
    await delay();
    const totalVwwAllTime = 412;
    const totalVwwThisMonth = MOCK_WORKERS.filter(w => w.isVerifiedWorking).length + 80;

    return {
      totalVwwThisMonth,
      totalVwwAllTime,
      interviewPassRate: 74.2,
      offerToStartRate: 82.5,
      retention7DaysRate: 91.0,
      retention30DaysRate: 78.4,
      partnerPerformance: [
        { partnerName: 'Foxconn Bắc Giang', totalStarted: 120, vwwCount: 112, vwwRate: 93, retention7DaysRate: 94 },
        { partnerName: 'Luxshare ICT Bắc Ninh', totalStarted: 95, vwwCount: 86, vwwRate: 90, retention7DaysRate: 89 },
        { partnerName: 'Samsung Thái Nguyên', totalStarted: 140, vwwCount: 128, vwwRate: 91, retention7DaysRate: 92 },
        { partnerName: 'Goertek Vina Quế Võ', totalStarted: 60, vwwCount: 52, vwwRate: 86, retention7DaysRate: 88 },
      ],
      recruiterPerformance: [
        { recruiterName: 'Nguyễn Thu Trang', officeName: 'Văn phòng Bắc Ninh', totalAssigned: 85, passedCount: 68, vwwCount: 62 },
        { recruiterName: 'Lê Văn Đức', officeName: 'Văn phòng Bắc Ninh', totalAssigned: 60, passedCount: 45, vwwCount: 41 },
        { recruiterName: 'Trần Minh Trí', officeName: 'Văn phòng Bắc Giang', totalAssigned: 75, passedCount: 58, vwwCount: 52 },
        { recruiterName: 'Vũ Hoàng Lan', officeName: 'Văn phòng Hà Nội', totalAssigned: 45, passedCount: 34, vwwCount: 31 },
      ],
    };
  },
};

const wrapMock = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  error: null,
  requestId: `MOCK-${Date.now()}`,
});

export const mockApiService = {
  isMock: true,

  async checkHealth(): Promise<ApiResponse<{ status: string; service: string; version: string; endpoints?: string[] }>> {
    return wrapMock({
      status: 'ok',
      service: 'FCS AI Workforce API (Mock)',
      version: '3.0.0',
      endpoints: ['system.health', 'dashboard.summary', 'action.list', 'worker.list', 'worker.get', 'worker.create'],
    });
  },

  async getSystemHealth(): Promise<ApiResponse<{ status: string; service: string; version: string; endpoints?: string[] }>> {
    return this.checkHealth();
  },

  async getDashboard(): Promise<ApiResponse<DashboardMetrics>> {
    const data = await mockApi.getDashboard();
    return wrapMock(data);
  },

  async getTodayActions(): Promise<ApiResponse<ActionQueueItem[]>> {
    const data = await mockApi.getTodayActions();
    return wrapMock(data);
  },

  async getWorkers(filters?: {
    search?: string;
    officeId?: string;
    recruiterId?: string;
    status?: string;
    partnerId?: string;
  }): Promise<ApiResponse<Worker[]>> {
    const data = await mockApi.getWorkers(filters);
    return wrapMock(data);
  },

  async getWorker(workerId: string): Promise<ApiResponse<Worker | null>> {
    const data = await mockApi.getWorker(workerId);
    return wrapMock(data);
  },

  async getPipelineEvents(workerId: string): Promise<ApiResponse<PipelineEvent[]>> {
    const data = await mockApi.getPipelineEvents(workerId);
    return wrapMock(data);
  },

  async createWorker(payload: {
    fullName: string;
    phone: string;
    province: string;
    currentNeed: string;
    needNote?: string;
    dateOfBirth?: string;
    gender?: 'Nam' | 'Nữ' | 'Khác';
    cccd?: string;
    district?: string;
    address?: string;
    source?: string;
    desiredJob?: string;
    officeId?: string;
    recruiterId?: string;
    overrideDuplicate?: boolean;
    forceCreate?: boolean;
    preferredJob?: string;
    currentUser?: any;
  }): Promise<ApiResponse<{ worker?: Worker; duplicateWarning?: boolean; existingWorker?: Worker }>> {
    const data = await mockApi.createWorker(payload);
    return wrapMock(data);
  },

  async updateWorker(workerId: string, payload: Partial<Worker>): Promise<ApiResponse<Worker | null>> {
    const data = await mockApi.updateWorker(workerId, payload);
    return wrapMock(data);
  },

  async getPipeline(filters?: {
    officeId?: string;
    recruiterId?: string;
    partnerId?: string;
    source?: string;
  }): Promise<ApiResponse<any>> {
    const workers = await mockApi.getWorkers(filters);
    const metrics = await mockApi.getDashboard();
    return wrapMock({
      workers,
      metrics,
      counts: metrics.pipelineCounts,
      rates: metrics.rates,
    });
  },

  async createInterview(payload: {
    workerId: string;
    partnerId: string;
    jobId: string;
    scheduledAt: string;
    interviewer: string;
    note?: string;
  }): Promise<ApiResponse<Interview>> {
    const data = await mockApi.createInterview(payload);
    return wrapMock(data);
  },

  async recordInterviewResult(
    interviewId: string,
    result: 'PASSED' | 'FAILED',
    note?: string
  ): Promise<ApiResponse<Interview | null>> {
    const data = await mockApi.recordInterviewResult(interviewId, result, note);
    return wrapMock(data);
  },

  async getWorkerInterviews(workerId: string): Promise<ApiResponse<Interview[]>> {
    const data = await mockApi.getWorkerInterviews(workerId);
    return wrapMock(data);
  },

  async createAssignment(payload: {
    workerId: string;
    partnerId: string;
    jobId: string;
    shift: string;
    startDate: string;
    markAsStartedNow?: boolean;
  }): Promise<ApiResponse<Assignment>> {
    const data = await mockApi.createAssignment(payload);
    return wrapMock(data);
  },

  async confirmWorkerStarted(assignmentId: string): Promise<ApiResponse<Assignment | null>> {
    const data = await mockApi.confirmWorkerStarted(assignmentId);
    return wrapMock(data);
  },

  async getWorkerAssignments(workerId: string): Promise<ApiResponse<Assignment[]>> {
    const data = await mockApi.getWorkerAssignments(workerId);
    return wrapMock(data);
  },

  async getWorkerAttendance(workerId: string): Promise<ApiResponse<any[]>> {
    const data = await mockApi.getWorkerAttendance(workerId);
    return wrapMock(data);
  },

  async getMatchingQueue(): Promise<ApiResponse<MatchingReview[]>> {
    const data = await mockApi.getMatchingQueue();
    return wrapMock(data);
  },

  async confirmMatch(reviewId: string, workerId: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.confirmMatch(reviewId, workerId);
    return wrapMock(data);
  },

  async rejectMatch(reviewId: string, reason?: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.rejectMatch(reviewId, reason);
    return wrapMock(data);
  },

  async assignDifferentWorker(reviewId: string, workerId: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.assignDifferentWorker(reviewId, workerId);
    return wrapMock(data);
  },

  async resolveAction(actionId: string, resolution: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.resolveAction(actionId, resolution);
    return wrapMock(data);
  },

  async dismissAction(actionId: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.dismissAction(actionId);
    return wrapMock(data);
  },

  async getPartners(): Promise<ApiResponse<Partner[]>> {
    const data = await mockApi.getPartners();
    return wrapMock(data);
  },

  async getJobs(): Promise<ApiResponse<Job[]>> {
    const data = await mockApi.getJobs();
    return wrapMock(data);
  },

  async getStaff(): Promise<ApiResponse<Staff[]>> {
    const data = await mockApi.getStaff();
    return wrapMock(data);
  },

  async getOffices(): Promise<ApiResponse<Office[]>> {
    const data = await mockApi.getOffices();
    return wrapMock(data);
  },

  async runGoldenFlow(flowId: 'GF-001' | 'GF-002' | 'GF-003' | 'GF-004' | 'GF-005'): Promise<{
    message: string;
    workerId?: string;
  }> {
    return mockApi.runGoldenFlow(flowId);
  },

  async getAttendanceReviews(): Promise<ApiResponse<AttendanceReviewItem[]>> {
    const data = await mockApi.getAttendanceReviews();
    return wrapMock(data);
  },

  async confirmAttendanceMatch(
    reviewId: string,
    matchedWorkerId?: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const data = await mockApi.confirmAttendanceMatch(reviewId, matchedWorkerId);
    return wrapMock(data);
  },

  async ignoreAttendance(reviewId: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.ignoreAttendance(reviewId);
    return wrapMock(data);
  },

  async getFollowUpQueue(): Promise<ApiResponse<FollowUpItem[]>> {
    const data = await mockApi.getFollowUpQueue();
    return wrapMock(data);
  },

  async resolveFollowUp(itemId: string, resolution: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.resolveFollowUp(itemId, resolution);
    return wrapMock(data);
  },

  async updateWorkerStatus(workerId: string, status: WorkerStatus, note?: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.updateWorkerStatus(workerId, status, note);
    return wrapMock(data);
  },

  async getDuplicateSuspects(): Promise<ApiResponse<DuplicateSuspect[]>> {
    const data = await mockApi.getDuplicateSuspects();
    return wrapMock(data);
  },

  async mergeDuplicates(primaryWorkerId: string, secondaryWorkerId: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.mergeDuplicates(primaryWorkerId, secondaryWorkerId);
    return wrapMock(data);
  },

  async dismissDuplicate(suspectId: string): Promise<ApiResponse<boolean>> {
    const data = await mockApi.dismissDuplicate(suspectId);
    return wrapMock(data);
  },

  async getPipelineFunnel(): Promise<ApiResponse<PipelineFunnelData[]>> {
    const data = await mockApi.getPipelineFunnel();
    return wrapMock(data);
  },

  async getOperationalResults(): Promise<ApiResponse<OperationalResults>> {
    const data = await mockApi.getOperationalResults();
    return wrapMock(data);
  },
};
