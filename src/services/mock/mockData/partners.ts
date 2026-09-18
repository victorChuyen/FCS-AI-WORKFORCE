import { Office, Staff, Partner, Job } from '../../../types';

export let MOCK_OFFICES: Office[] = [
  { id: 'OFF-01', name: 'Văn phòng Bắc Ninh', code: 'BN', address: 'Số 12 Lý Thái Tổ, TP. Bắc Ninh' },
  { id: 'OFF-02', name: 'Văn phòng Bắc Giang', code: 'BG', address: 'Số 88 Hùng Vương, TP. Bắc Giang' },
  { id: 'OFF-03', name: 'Văn phòng Hà Nội', code: 'HN', address: 'Tòa nhà FCS, Cầu Giấy, Hà Nội' },
];

export let MOCK_STAFF: Staff[] = [
  { id: 'ST-00', name: 'Ban Giám Đốc FCS', email: 'ceo-fcs@breaths.live', role: 'ADMIN', officeId: 'OFF-03', officeName: 'Trụ sở Điều hành', activeCandidatesCount: 150 },
  { id: 'ST-01', name: 'Nguyễn Thu Trang', email: 'manager-fcs@breaths.live', role: 'MANAGER', officeId: 'OFF-01', officeName: 'Văn phòng Bắc Ninh', activeCandidatesCount: 42 },
  { id: 'ST-02', name: 'Lê Văn Đức', email: 'staff-fcs@breaths.live', role: 'STAFF', officeId: 'OFF-01', officeName: 'Văn phòng Bắc Ninh', activeCandidatesCount: 28 },
  { id: 'ST-03', name: 'Trần Minh Trí', email: 'tri.tm@breaths.live', role: 'STAFF', officeId: 'OFF-02', officeName: 'Văn phòng Bắc Giang', activeCandidatesCount: 35 },
  { id: 'ST-04', name: 'Vũ Hoàng Lan', email: 'lan.vh@breaths.live', role: 'STAFF', officeId: 'OFF-03', officeName: 'Văn phòng Hà Nội', activeCandidatesCount: 19 },
];

export let MOCK_PARTNERS: Partner[] = [
  { id: 'PT-01', name: 'Foxconn Bắc Giang (KCN Quang Châu)', code: 'FOXCONN_BG', location: 'Bắc Giang', industry: 'Lắp ráp điện tử Apple', activeWorkersCount: 310 },
  { id: 'PT-02', name: 'Luxshare ICT Bắc Ninh (KCN VSIP)', code: 'LUXSHARE_BN', location: 'Bắc Ninh', industry: 'Linh kiện tai nghe & cáp sạc', activeWorkersCount: 245 },
  { id: 'PT-03', name: 'Goertek Vina (KCN Quế Võ)', code: 'GOERTEK_QV', location: 'Bắc Ninh', industry: 'Linh kiện âm thanh điện tử', activeWorkersCount: 180 },
  { id: 'PT-04', name: 'Samsung Electronics Thái Nguyên', code: 'SEVT_TN', location: 'Thái Nguyên', industry: 'Sản xuất điện thoại thông minh', activeWorkersCount: 420 },
];

export let MOCK_JOBS: Job[] = [
  { id: 'JOB-01', partnerId: 'PT-01', partnerName: 'Foxconn Bắc Giang', title: 'Công nhân lắp ráp Module', salaryRange: '8.5 - 11.5 triệu', location: 'Bắc Giang', vacancies: 80 },
  { id: 'JOB-02', partnerId: 'PT-02', partnerName: 'Luxshare ICT Bắc Ninh', title: 'Công nhân dây chuyền tai nghe', salaryRange: '8.0 - 10.5 triệu', location: 'Bắc Ninh', vacancies: 50 },
  { id: 'JOB-03', partnerId: 'PT-03', partnerName: 'Goertek Vina', title: 'Kiểm tra chất lượng linh kiện (QA/QC)', salaryRange: '9.0 - 12.0 triệu', location: 'Bắc Ninh', vacancies: 35 },
  { id: 'JOB-04', partnerId: 'PT-04', partnerName: 'Samsung Thái Nguyên', title: 'Công nhân đóng gói bao bì điện thoại', salaryRange: '8.8 - 11.0 triệu', location: 'Thái Nguyên', vacancies: 120 },
];
