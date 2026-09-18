/**
 * ==============================================================================
 * FCS AI WORKFORCE OS V2 — VIETNAM PROVINCES & CITIES MASTER TAXONOMY
 * Toàn bộ 63 Tỉnh / Thành phố trực thuộc Trung ương của Việt Nam
 * Phân nhóm theo các vùng kinh tế trọng điểm & Khu công nghiệp (KCN)
 * ==============================================================================
 */

export interface ProvinceRegionGroup {
  region: string;
  provinces: string[];
}

export const VIETNAM_PROVINCES_BY_REGION: ProvinceRegionGroup[] = [
  {
    region: '🔥 KCN Miền Bắc Trọng Điểm',
    provinces: [
      'Bắc Giang',
      'Bắc Ninh',
      'Hà Nội',
      'Thái Nguyên',
      'Hải Phòng',
      'Vĩnh Phúc',
      'Phú Thọ',
      'Hải Dương',
      'Hưng Yên',
      'Hà Nam',
      'Nam Định',
      'Ninh Bình',
      'Quảng Ninh',
      'Lạng Sơn',
      'Tuyên Quang',
      'Thái Bình',
    ],
  },
  {
    region: '🔥 KCN Miền Nam & Đông Nam Bộ',
    provinces: [
      'Đồng Nai',
      'Bình Dương',
      'TP. Hồ Chí Minh',
      'Long An',
      'Bà Rịa - Vũng Tàu',
      'Tây Ninh',
      'Bình Phước',
      'Tiền Giang',
      'Cần Thơ',
    ],
  },
  {
    region: 'Miền Trung & Tây Nguyên',
    provinces: [
      'Thanh Hóa',
      'Nghệ An',
      'Hà Tĩnh',
      'Quảng Bình',
      'Quảng Trị',
      'Thừa Thiên Huế',
      'Đà Nẵng',
      'Quảng Nam',
      'Quảng Ngãi',
      'Bình Định',
      'Phú Yên',
      'Khánh Hòa',
      'Ninh Thuận',
      'Bình Thuận',
      'Kon Tum',
      'Gia Lai',
      'Đắk Lắk',
      'Đắk Nông',
      'Lâm Đồng',
    ],
  },
  {
    region: 'Đồng Bằng Sông Cửu Long (Miền Tây)',
    provinces: [
      'An Giang',
      'Bến Tre',
      'Bạc Liêu',
      'Cà Mau',
      'Đồng Tháp',
      'Hậu Giang',
      'Kiên Giang',
      'Sóc Trăng',
      'Trà Vinh',
      'Vĩnh Long',
    ],
  },
  {
    region: 'Miền Núi Phía Bắc',
    provinces: [
      'Hòa Bình',
      'Sơn La',
      'Lào Cai',
      'Yên Bái',
      'Điện Biên',
      'Lai Châu',
      'Hà Giang',
      'Cao Bằng',
      'Bắc Kạn',
    ],
  },
];

// Toàn bộ 63 tỉnh thành Việt Nam đã làm sạch và sắp xếp A-Z
export const ALL_VIETNAM_PROVINCES: string[] = Array.from(
  new Set(VIETNAM_PROVINCES_BY_REGION.flatMap(group => group.provinces))
).sort((a, b) => a.localeCompare(b, 'vi'));

/**
 * Kiểm tra xem một chuỗi có khớp với danh mục tỉnh thành chuẩn hay không
 */
export function isStandardVietnamProvince(name: string): boolean {
  if (!name) return false;
  const clean = name.trim().toLowerCase();
  return ALL_VIETNAM_PROVINCES.some(p => p.toLowerCase() === clean);
}
