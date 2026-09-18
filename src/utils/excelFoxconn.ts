import * as XLSX from 'xlsx';
import { Worker, WorkerStatus, WORKER_STATUS_LABEL } from '../types';

export const FOXCONN_EXCEL_HEADERS = [
  'TTNo',
  'BỘ PHẬN (Dept)',
  'HỌ TÊN (Full name)',
  'GIỚI TÍNH (Gender)',
  'NGÀY SINH (Date of birth)',
  'SỐ CMTND (ID number card)',
  'NGÀY CẤP (Issuing date)',
  'TRƯỜNG TỐT NGHIỆP (School)',
  'CHUYÊN NGÀNH (Major)',
  'Năm tốt nghiệp (Graduation Year)',
  'QUÊ QUÁN (Home town)',
  'DÂN TỘC (Nation)',
  'NƠI SINH (Birth Place)',
  'Địa chỉ thường trú (theo VNEID)',
  'NƠI Ở HIỆN NAY (Permanent)',
  'SỐ SỔ BHXH (Social Insurance)',
  'TÌNH TRẠNG HÔN NHÂN',
  'NGƯỜI LIÊN LẠC KHẨN CẤP',
  'SĐT NGƯỜI THÂN',
  'SỐ ĐIỆN THOẠI LAO ĐỘNG',
  'SỐ TÀI KHOẢN VIETCOMBANK',
  'MÃ TRẠNG THÁI FOXCONN',
];

export const SAMPLE_VIETNAM_WORKERS: Partial<Worker>[] = [
  {
    fullName: 'TRẦN VĂN HẢI',
    department: 'FCS-SMT-01',
    gender: 'Nam',
    dateOfBirth: '1993-09-20',
    cccd: '031093016262',
    cccdIssuedDate: '09/05/2021',
    school: 'Cao đẳng Hàng hải 1',
    major: 'Điện tàu thủy',
    graduationYear: '2011',
    hometown: 'Thủy Nguyên, Hải Phòng',
    ethnicity: 'Kinh',
    birthPlace: 'An Lư, Thủy Nguyên, Hải Phòng',
    permanentAddress: 'Tổ dân phố Vạn Chánh 1, Phường Nhị Chiểu, Hải Phòng',
    currentAddress: 'KTX KCN Quang Châu, Việt Yên, Bắc Giang',
    socialInsuranceNo: '3015039193',
    maritalStatus: '2',
    emergencyContactName: 'TRẦN VĂN HÙNG (Anh trai)',
    emergencyContactPhone: '0988028658',
    phone: '0902026826',
    bankAccountNo: '1031495682',
    status: WorkerStatus.WORKING,
  },
  {
    fullName: 'NGUYỄN VĂN AN',
    department: 'FCS-QC-02',
    gender: 'Nam',
    dateOfBirth: '1996-04-12',
    cccd: '027196008432',
    cccdIssuedDate: '15/08/2021',
    school: 'Đại học Sư phạm Kỹ thuật Hưng Yên',
    major: 'Cơ điện tử',
    graduationYear: '2018',
    hometown: 'Yên Phong, Bắc Ninh',
    ethnicity: 'Kinh',
    birthPlace: 'Thị trấn Chờ, Yên Phong, Bắc Ninh',
    permanentAddress: 'Khu 2, Thị trấn Chờ, Huyện Yên Phong, Tỉnh Bắc Ninh',
    currentAddress: 'Thôn Chùa, Tăng Tiến, Việt Yên, Bắc Giang',
    socialInsuranceNo: '2716098124',
    maritalStatus: '1',
    emergencyContactName: 'NGUYỄN THỊ HOA (Vợ)',
    emergencyContactPhone: '0978345612',
    phone: '0986416596',
    bankAccountNo: '1018947231',
    status: WorkerStatus.WAITING_START,
  },
  {
    fullName: 'LÊ THỊ MAI',
    department: 'FCS-ASSY-03',
    gender: 'Nữ',
    dateOfBirth: '1999-11-05',
    cccd: '024099015782',
    cccdIssuedDate: '20/12/2021',
    school: 'Cao đẳng Công nghệ Bắc Giang',
    major: 'Kế toán doanh nghiệp',
    graduationYear: '2020',
    hometown: 'Lạng Giang, Bắc Giang',
    ethnicity: 'Kinh',
    birthPlace: 'Xã Tiên Lục, Huyện Lạng Giang, Bắc Giang',
    permanentAddress: 'Thôn Giếng, Xã Tiên Lục, Huyện Lạng Giang, Tỉnh Bắc Giang',
    currentAddress: 'Nhà trọ số 18, KCN Vân Trung, Việt Yên, Bắc Giang',
    socialInsuranceNo: '2419082341',
    maritalStatus: '2',
    emergencyContactName: 'LÊ VĂN TUẤN (Bố)',
    emergencyContactPhone: '0983214567',
    phone: '0983436432',
    bankAccountNo: '1025893147',
    status: WorkerStatus.PASSED,
  },
  {
    fullName: 'PHẠM QUANG HUY',
    department: 'FCS-CNC-01',
    gender: 'Nam',
    dateOfBirth: '1995-07-28',
    cccd: '038195007329',
    cccdIssuedDate: '10/03/2022',
    school: 'Cao đẳng Nghề Thanh Hóa',
    major: 'Cắt gọt kim loại',
    graduationYear: '2016',
    hometown: 'Tĩnh Gia, Thanh Hóa',
    ethnicity: 'Kinh',
    birthPlace: 'Phường Hải Hòa, Thị xã Nghi Sơn, Thanh Hóa',
    permanentAddress: 'Tổ dân phố Tân Phong, Phường Hải Hòa, TX Nghi Sơn, Thanh Hóa',
    currentAddress: 'KTX Đình Trám, Việt Yên, Bắc Giang',
    socialInsuranceNo: '3815092147',
    maritalStatus: '1',
    emergencyContactName: 'PHẠM VĂN THÀNH (Bố)',
    emergencyContactPhone: '0977894561',
    phone: '0984905119',
    bankAccountNo: '1034928175',
    status: WorkerStatus.WORKING,
  },
  {
    fullName: 'HOÀNG THỊ THU',
    department: 'FCS-PACKING',
    gender: 'Nữ',
    dateOfBirth: '2001-02-18',
    cccd: '019201004518',
    cccdIssuedDate: '14/06/2022',
    school: 'THPT Hiệp Hòa số 2',
    major: 'THPT',
    graduationYear: '2019',
    hometown: 'Hiệp Hòa, Bắc Giang',
    ethnicity: 'Kinh',
    birthPlace: 'Xã Hoàng An, Huyện Hiệp Hòa, Bắc Giang',
    permanentAddress: 'Thôn Hoàng Liên, Xã Hoàng An, Huyện Hiệp Hòa, Bắc Giang',
    currentAddress: 'KCN Đình Trám, Việt Yên, Bắc Giang',
    socialInsuranceNo: '2420091834',
    maritalStatus: '2',
    emergencyContactName: 'HOÀNG VĂN ĐỨC (Bố)',
    emergencyContactPhone: '0912457896',
    phone: '0983375547',
    bankAccountNo: '1019284756',
    status: WorkerStatus.INTERVIEW_PENDING,
  },
];

/**
 * Xuất danh sách Worker ra file Excel .xlsx chuẩn
 */
export function exportWorkersToFoxconnXlsx(workers: Worker[], filename = 'DANH_SACH_LAO_DONG_FOXCONN_FCS.xlsx') {
  const rows: any[][] = [];
  rows.push(FOXCONN_EXCEL_HEADERS);

  const list = workers.length > 0 ? workers : (SAMPLE_VIETNAM_WORKERS as Worker[]);

  list.forEach((w, idx) => {
    const statusText = WORKER_STATUS_LABEL[w.status] || w.status;
    rows.push([
      idx + 1,
      w.department || 'FCS-PROD',
      w.fullName.toUpperCase(),
      w.gender || 'Nam',
      w.dateOfBirth || '',
      w.cccd || '',
      w.cccdIssuedDate || '',
      w.school || 'THPT',
      w.major || 'THPT',
      w.graduationYear || '',
      w.hometown || w.province || 'Bắc Giang',
      w.ethnicity || 'Kinh',
      w.birthPlace || w.province || 'Bắc Giang',
      w.permanentAddress || w.address || '',
      w.currentAddress || w.address || '',
      w.socialInsuranceNo || '',
      w.maritalStatus || 'Chưa kết hôn',
      w.emergencyContactName || '',
      w.emergencyContactPhone || '',
      w.phone,
      w.bankAccountNo || '',
      statusText,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Đặt độ rộng cột tự động
  ws['!cols'] = [
    { wch: 6 },  // TTNo
    { wch: 16 }, // Bộ phận
    { wch: 25 }, // Họ tên
    { wch: 10 }, // Giới tính
    { wch: 14 }, // Ngày sinh
    { wch: 16 }, // CCCD
    { wch: 14 }, // Ngày cấp
    { wch: 30 }, // Trường
    { wch: 22 }, // Chuyên ngành
    { wch: 14 }, // Năm TN
    { wch: 25 }, // Quê quán
    { wch: 10 }, // Dân tộc
    { wch: 28 }, // Nơi sinh
    { wch: 45 }, // Thường trú
    { wch: 35 }, // Nơi ở hiện nay
    { wch: 16 }, // BHXH
    { wch: 16 }, // Hôn nhân
    { wch: 22 }, // Người thân
    { wch: 15 }, // SĐT thân
    { wch: 15 }, // SĐT lao động
    { wch: 16 }, // Vietcombank
    { wch: 18 }, // Trạng thái
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DANH_SACH_LAO_DONG');
  XLSX.writeFile(wb, filename);
}

/**
 * Tải file Excel mẫu .xlsx chuẩn 22 cột có sẵn 5 lao động Việt Nam thật
 */
export function downloadFoxconnTemplate() {
  exportWorkersToFoxconnXlsx(SAMPLE_VIETNAM_WORKERS as Worker[], 'MAU_NHAP_LIEU_LAO_DONG_FOXCONN_22_COT.xlsx');
}

/**
 * Xuất file CSV UTF-8 dự phòng
 */
export function exportWorkersToFoxconnExcel(workers: Worker[], filename = 'DANH_SACH_LAO_DONG_FOXCONN_FCS.xlsx') {
  exportWorkersToFoxconnXlsx(workers, filename);
}
