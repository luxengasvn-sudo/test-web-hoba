const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateUUID() {
  return crypto.randomUUID();
}

const rawMembersData = [
  {
    stt: 1,
    category: 'Trạm chiết',
    role: 'Chủ tịch',
    name: 'Đinh Văn Hiểu',
    company: 'Công ty TNHH Long Thuận',
    email: 'hieudinh@luxen.vn',
    birthYear: '1968',
    address: '27/11 ĐT743, khu phố Đông Chiêu, phường Tân Đông Hiệp, thành phố Dĩ An, tỉnh Bình Dương',
    phone: '0852 369 369',
    bch: true,
    btv: true,
    feeStatus: 'Đủ',
    avatarUrl: '/uploads/committees/ban-chap-hanh/5jvacq8esdh.jpg'
  },
  {
    stt: 2,
    category: 'Trạm chiết',
    role: 'Phó Chủ tịch',
    name: 'Trần Đức Nhã',
    company: 'Công ty TNHH Phước Thiên',
    email: 'nha.td@vietgas.vn',
    birthYear: '1981',
    address: 'Số 88 đường số 6, Cityland Park Hills, phường 10, quận Gò Vấp, TP Hồ Chí Minh.',
    phone: '0918 114 468',
    bch: true,
    btv: true,
    feeStatus: 'Đủ',
    avatarUrl: '/uploads/committees/ban-chap-hanh/ce32dwz0txo.png'
  },
  {
    stt: 3,
    category: 'Trạm chiết',
    role: 'Phó Chủ tịch',
    name: 'Lê Khắc Huy',
    company: 'Công ty TNHH MTV Ga Việt',
    email: '',
    birthYear: '1973',
    address: 'Thửa đất số 197, Tờ bản đồ số 12, Tổ 13, khu phố Khánh Hội, thành phố Tân Uyên, tỉnh Bình Dương',
    phone: '0937 440 481',
    bch: true,
    btv: true,
    feeStatus: 'Chưa nộp',
    avatarUrl: '/uploads/committees/ban-chap-hanh/oks5eaec2w.png'
  },
  {
    stt: 4,
    category: 'NPP',
    role: 'Phó Chủ tịch',
    name: 'Phan Thị Huệ',
    company: 'Công ty CP Hoàng Gia Việt Luxen’s Care',
    email: '',
    birthYear: '1987',
    address: 'Số 24, Block -J4 A, khu phố thương mại Đông Đô Đại Phố, phường Hòa Phú, thành phố Thủ Dầu Một, tỉnh Bình Dương',
    phone: '0983 183 251',
    bch: true,
    btv: true,
    feeStatus: 'Đủ',
    avatarUrl: '/uploads/committees/ban-chap-hanh/mo1d734pum8.png'
  },
  {
    stt: 5,
    category: 'Trạm chiết',
    role: 'Phó Chủ tịch',
    name: 'Nguyễn Vĩnh Lộc',
    company: 'Công ty TNHH Thành Vĩnh Phú',
    email: 'nguyenvinhloc79@gmail.com',
    birthYear: '1982',
    address: 'Số 80 - 82 Huỳnh Tịnh Của, Phường Bà Rịa, TP Hồ Chí Minh',
    phone: '0909 394 979',
    bch: true,
    btv: true,
    feeStatus: 'Đủ',
    avatarUrl: '/uploads/committees/ban-chap-hanh/oks5eaec2w.png'
  },
  {
    stt: 6,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Thường vụ',
    name: 'Trần Công Anh Tuấn',
    company: 'Công ty TNHH Phúc Võ',
    email: '',
    birthYear: '1985',
    address: '67/5 khu phố Đông Tác, phường Tân Đông Hiệp, thành phố Dĩ An, tỉnh Bình Dương.',
    phone: '0982 612 217',
    bch: true,
    btv: true,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 7,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Thường vụ',
    name: 'Đinh Huy Long',
    company: 'Công ty CP Ubergas',
    email: 'longdinh@luxen.vn',
    birthYear: '1999',
    address: 'Số 7, đường Nguyễn Trung Trực, khu phố Bình Minh 1, phường Dĩ An, thành phố Dĩ An, tỉnh Bình Dương.',
    phone: '0988 20 26 79',
    bch: true,
    btv: true,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 8,
    category: 'Trạm chiết',
    role: 'Ủy viên Ban Thường vụ',
    name: 'Phạm Trung Kiên',
    company: 'Công ty CP khí hóa lỏng Hoàng Anh',
    email: '',
    birthYear: '1972',
    address: 'Số 148/1A, đường Tân An, khu phố Đông An, phường Tân Đông Hiệp, thành phố Dĩ An, tỉnh Bình Dương',
    phone: '0919 698 519',
    bch: true,
    btv: true,
    feeStatus: 'Chưa nộp',
    avatarUrl: ''
  },
  {
    stt: 9,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Lê Văn Hoàng',
    company: 'CH Điện-Gas Lê Hoàng',
    email: 'levanhoang2.250269@gmail.com',
    birthYear: '1970',
    address: '203 Hồ Văn Cống, Tương Bình Hiệp, Thành phố Thủ Dầu Một, tỉnh Bình Dương.',
    phone: '0964 686 700',
    bch: true,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 10,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Trần Thanh Bằng',
    company: 'CH Gas Thanh Phong',
    email: 'Thanhphonggas@gmail.com',
    birthYear: '1981',
    address: 'B170 Nguyễn Đức Thuận, phường Hiệp Thành, thành phố Thủ Dầu Một, tỉnh Bình Dương.',
    phone: '0987 885 139',
    bch: true,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 11,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Nguyễn Thanh Tùng',
    company: 'Công ty TNHH MTV Gas Nước Khoáng Thanh Tùng',
    email: '',
    birthYear: '1970',
    address: 'Số 53, đường số 19, Khu Phố 2, phường Hòa Phú, thành phố Thủ Dầu Một, tỉnh Bình Dương.',
    phone: '0919 642 854',
    bch: true,
    btv: false,
    feeStatus: 'Chưa nộp',
    avatarUrl: ''
  },
  {
    stt: 12,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Tô Văn Dương',
    company: 'Chủ đại lý gas và bếp gas Phong Thái',
    email: 'gasxanh24h@gmail.com',
    birthYear: '1983',
    address: '255F/2 khu phố 1B, An Phú, Thuận An, Bình Dương.',
    phone: '0903 723 367',
    bch: true,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 13,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Đinh Quang Dương',
    company: 'HKD Phạm Thị Thu Hiền',
    email: '',
    birthYear: '1978',
    address: 'Thửa đất số 99, tờ bản đồ số 2, tổ 4, ấp Cầu Sắt, xã Lai Hưng, huyện Bàu Bàng, tỉnh Bình Dương.',
    phone: '0974 463 016',
    bch: true,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 14,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Đoàn Xuân Hiền',
    company: 'Công ty CP vận tải Biển Đông',
    email: 'hienbiendong@gmail.com',
    birthYear: '',
    address: '206  Nguyễn Văn Linh, phường Tân Thuận, thành phố Hồ Chí Minh',
    phone: '0987 899 899',
    bch: true,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 15,
    category: 'Trạm chiết',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Trương Hữu Phước',
    company: 'Công ty CP MT Gas',
    email: '',
    birthYear: '',
    address: '1591 Phạm Thế Hiển, phường Bình Đông, TP. Hồ Chí Minh',
    phone: '0913 928 218',
    bch: true,
    btv: false,
    feeStatus: 'Còn thiếu',
    avatarUrl: '/uploads/member-assets/arrxbs6eyn.png'
  },
  {
    stt: 16,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Nguyễn Văn Chính',
    company: 'HKD Phạm Thị Ngát',
    email: '',
    birthYear: '1986',
    address: 'ĐT749, ấp Long Hưng, xã Long Nguyên, huyện Bàu Bàng, tỉnh Bình Dương.',
    phone: '0768 777 099',
    bch: true,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 17,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Đoàn Văn Tuyên',
    company: 'HKD Đoàn Văn Tuyên',
    email: '',
    birthYear: '1980',
    address: '454 đường Lê Hồng Phong, phường Phú Hòa, thành phố Thủ Dầu Một, tỉnh Bình Dương',
    phone: '0345 274 107',
    bch: true,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 18,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Nguyễn Thiện Nhân',
    company: 'HKD gas Thiện Nhân',
    email: '',
    birthYear: '1985',
    address: 'Số 202, đường ĐT741, Xã Tiến Hưng, thành phố Đồng Xoài, tỉnh Bình Phước.',
    phone: '0938 463 323',
    bch: true,
    btv: false,
    feeStatus: 'Chưa nộp',
    avatarUrl: ''
  },
  {
    stt: 19,
    category: 'ĐL/CH',
    role: 'Trưởng Ban Kiểm tra',
    name: 'Bùi An Bình',
    company: 'CH Gas Thanh Dương',
    email: '',
    birthYear: '1978',
    address: '38 Ngô Thị Nhậm, phường Dĩ An, thành phố Dĩ An, tỉnh Bình Dương.',
    phone: '0977 521 312',
    bch: true,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 20,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Kiểm tra',
    name: 'Nguyễn Thị Minh Phụng',
    company: 'CH gas Quỳnh Bảo',
    email: 'nthiminhphung0408@gmail.com',
    birthYear: '1972',
    address: 'Thửa đất số 190D, tờ bản đồ số 03, tổ 19A, Đông Chiêu, Tân Đông Hiệp, Dĩ An.',
    phone: '0919 223 494',
    bch: false,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 21,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Kiểm tra',
    name: 'Nguyễn Thị Đào',
    company: 'ĐL gas Hoàng Vũ',
    email: '',
    birthYear: '1981',
    address: 'Ô1, lôB, khu nhà ở TM Đại Ngàn, Khu Phố Hòa Lân 2, Thuận Giao, Thuận An, Bình Dương.',
    phone: '0365 866 388',
    bch: false,
    btv: false,
    feeStatus: 'Đủ',
    avatarUrl: ''
  },
  {
    stt: 22,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Xuân Thạnh',
    company: 'CH Gas An Thạnh',
    email: '',
    birthYear: '1960',
    address: '25/16A KP Đông Chiêu, phường Tân Đông Hiệp, thành phố Dĩ An, tỉnh Bình Dương.',
    phone: '0937 850 041',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 23,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Trần Văn Ba',
    company: 'ĐL Vy Duyên',
    email: '',
    birthYear: '1962',
    address: '891 đường Lê Hồng Phong, phường Phú Hòa, thành phố Thủ Dầu Một, tỉnh Bình Dương',
    phone: '0919 312 640',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 24,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Trần Thế Anh',
    company: 'HKD Trần Văn Chi',
    email: '',
    birthYear: '1968',
    address: '23/7 K9, phường Phú Hòa, thành phố Thủ Dầu Một, tỉnh Bình Dương',
    phone: '0767 766 599',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 25,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Thanh Tú',
    company: 'ĐL Gas Dũng',
    email: '',
    birthYear: '1969',
    address: 'số 62, Ấp Lai Khê, Lai Hưng, huyện Bàu Bàng, tỉnh Bình Dương',
    phone: '0919 141 117',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 26,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Võ Đình Tùng',
    company: 'HKD Tùng Loan',
    email: '',
    birthYear: '1966',
    address: '22/01 tổ 72, Bùi Văn Bình, phường Phú Lợi, thành phố Thủ Dầu Một, tỉnh Bình Dương.',
    phone: '0918 063 428',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 27,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Văn Hòa',
    company: 'CH Gas Phương',
    email: '',
    birthYear: '1969',
    address: '110 đường ĐT743c, khu phố Tân Long, phường Tân Đông Hiệp, thành phố Dĩ An, tỉnh Bình Dương.',
    phone: '0908 583 035',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 28,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Trịnh Xuân Cương',
    company: 'CH gas Xuân Cương',
    email: '',
    birthYear: '1982',
    address: 'Thửa đất số 415, Tờ bản đồ số 8, Ấp 2, Xã Tân Lập, Bắc Tân Uyên, tỉnh Bình Dương.',
    phone: '0368 244 112',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 29,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Khánh Hưng',
    company: 'HKD Anh Thy',
    email: 'hungnguyen29071973@gmail.com',
    birthYear: '1973',
    address: 'phường Tương bình Hiệp , thành phố Thủ Dầu Một, tỉnh Bình Dương.',
    phone: '0919 163 747',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 30,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Văn Hải',
    company: 'CH Gas Tiến Thành',
    email: '',
    birthYear: '1979',
    address: 'Số nhà 228 ấp 4, xã Thường Tân, Bắc Tân Uyên',
    phone: '0949 177 505',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 31,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Quách Đông Hưng',
    company: 'HKD Quách Đông Hưng',
    email: '',
    birthYear: '1970',
    address: '163 KP đông ba, P. Bình Hòa, TX Thuận An, Bình Dương',
    phone: '0987 683 883',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 32,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Chí Phong',
    company: 'ĐL gas Lửa Việt',
    email: '',
    birthYear: '1995',
    address: '6/8 Khu phố Ngãi Thắng, Bình Thắng, TP Dĩ An, tỉnh Bình Dương',
    phone: '0989 836 562',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 33,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Trần Chung',
    company: 'ĐL/CH Trần Thiện Đạt',
    email: '',
    birthYear: '1957',
    address: 'Thửa đất số 699, tờ bản đồ số 38, ấp Tân Lợi, Đất Cuốc, Bắc Tân Uyên, Bình Dương.',
    phone: '0978 872 437',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 34,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Văn Màng',
    company: 'ĐL Nên Tấn Tài',
    email: '',
    birthYear: '1975',
    address: 'Thửa đất số 415, tờ bản đồ số 10, Phú Trung, Phú Chánh, Tân Uyên, Bình Dương',
    phone: '0919 351 737',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 35,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Lê Hoàng Trọng',
    company: 'ĐL Gas Minh Trí',
    email: '',
    birthYear: '1964',
    address: '85/5 Quốc lộ 13, ấp 3, Tân Định, Bến Cát, Bình Dương',
    phone: '0274 224 2008',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 36,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Hữu Tấn',
    company: 'HKD Duy Tân',
    email: '',
    birthYear: '1969',
    address: '14/28 Hồ Văn Cống, ấp 6, Tương Bình Hiệp, Thành phố Thủ Dầu Một, tỉnh Bình Dương',
    phone: '0274 3 826 585',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 37,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Phạm Thúy Hằng',
    company: 'ĐL gas Huy Hoàng',
    email: '',
    birthYear: '1983',
    address: 'Số 11, tổ 1, ấp Suối Tre, Long Nguyên, Bàu Bàng, Bình Dương',
    phone: '02743 590 027',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 38,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Thanh Tâm',
    company: 'HKD Nguyễn Thanh Tâm',
    email: '',
    birthYear: '1978',
    address: '58/2 Tổ 2, khu phố Khánh Lợi, Tân Phước Khánh, Tân Uyên , Bình Dương',
    phone: '0908 803 036',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 39,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Đào Thị Lê',
    company: 'HKD vật liệu xây dựng Hồng Quảng',
    email: '',
    birthYear: '1979',
    address: 'Thửa đất số 157, tờ bản đồ số 36, ấp Lồ Ồ, An Tây, Bến Cát, Bình Dương',
    phone: '0933 894 747',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 40,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Trương Hữu Phùng',
    company: 'HKD Trương Hữu Phùng',
    email: '',
    birthYear: '1976',
    address: '75/8 khu phố Long Thới, Lái Thiêu, Thuận An, Bình Dương',
    phone: '0355 945 545',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 41,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Lê Thành Nhân',
    company: 'HKD Lê Thành Nhân',
    email: '',
    birthYear: '1970',
    address: '44/47 ấp 5, Định Hòa, Thủ Dầu Một, Bình Dương',
    phone: '0987 075 587',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 42,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Thị Sáng',
    company: 'CH gas Sáu Của',
    email: '',
    birthYear: '1970',
    address: 'Khu phố Khánh Long, Tân Phước Khanh, Tân Uyên, Bình Dương',
    phone: '0907 173 721',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 43,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Đinh Quang Dũng',
    company: 'HKD Đinh Quang Dũng',
    email: '',
    birthYear: '1977',
    address: '17/4B ấp Đông An, Tân Đông Hiệp, Dĩ An, Bình Dương',
    phone: '0919 400 615',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 44,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Thanh Thành Thái',
    company: 'HKD Gas Thành Thái II',
    email: '',
    birthYear: '1974',
    address: '484 A, Hưng Lộc, Hưng Định, Thuận An, Bình Dương.',
    phone: '0274 3 720 797',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 45,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Thị Ngọc Loan',
    company: 'HKD Ngọc Lan',
    email: '',
    birthYear: '1979',
    address: 'Thửa đất số 821, tờ bản đồ số 11, khu phố An Thành, Thái Hòa, Tân Uyên, Bình Dương.',
    phone: '0919 098 715',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 46,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Lê Thị Thu Hà',
    company: 'ĐL gas Giá Rẻ',
    email: '',
    birthYear: '1982',
    address: 'Block B, ô 01, khu dân cư Minh Ngọc, Khu phố Đông Tân, Dĩ An, Bình Dương.',
    phone: '0986 192 128',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 47,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Thành Hà',
    company: 'ĐL gas Nguyễn Thành Hà',
    email: '',
    birthYear: '1975',
    address: '33/1C Nguyễn Thị Tươi, Khu phố Tân Hiệp, Tân Bình, Dĩ An, Bình Dương.',
    phone: '0363 366 034',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 48,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Lê Phú Hải',
    company: 'HKD Lê Phú Hải',
    email: '',
    birthYear: '1975',
    address: '62B/3, Khu phố 2, An Phú, Thuận An, Bình Dương.',
    phone: '0908 912 439',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 49,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Khắc Dương',
    company: 'HKD Gia Đình Việt',
    email: '',
    birthYear: '1994',
    address: '797, ĐT 743B, Khu phố Đông Tân, Dĩ An, Bình Dương.',
    phone: '0896 906 673',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 50,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Văn Dĩ',
    company: 'HKD Nguyễn Văn Dĩ',
    email: '',
    birthYear: '1982',
    address: 'Số 259, đường ĐT 741, khu phố An Lợi, Hòa Lợi, Bến Cát, Bình Dương.',
    phone: '0978 246 388',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 51,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Đặng Văn Lưu',
    company: 'HKD Trung Nguyên .TG',
    email: '',
    birthYear: '1985',
    address: '1/DC74/ô 84, tổ 2, khu phố Hòa Lân 2, Thuận Giao, Thuận An, Bình Dương.',
    phone: '0977 792 048',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 52,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Văn Vượng',
    company: 'Công ty TNHH khí hóa lỏng An Trường Phát',
    email: '',
    birthYear: '1979',
    address: 'Tân Thắng, Tân Bình, Dĩ An, Bình Dương.',
    phone: '0985 417 772',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 53,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Trịnh Lâm Hưng',
    company: 'HKD đại lý gas Gia Bảo',
    email: '',
    birthYear: '1989',
    address: 'Thửa đất số 524, tờ bản đồ số 33, tổ 1, KP 6, Uyên Hưng, Tân Uyên, Bình Dương.',
    phone: '0387 616 121',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 54,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Huỳnh Vĩ Hùng',
    company: 'HKD Lê Minh',
    email: '',
    birthYear: '1970',
    address: '158 khu phố Đông Tư, phường Lái Thiêu, Thuận An, Bình Dương.',
    phone: '0918 556 686',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 55,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Phúc Hưng',
    company: 'HKD Hải Huyền',
    email: '',
    birthYear: '2001',
    address: '108/8 Cộng Hòa, Quận Tân Phú, TP.HCM',
    phone: '0775 142 258',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 56,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Nguyễn Phúc Hưng',
    company: 'HKD gas Việt Thủ Đức',
    email: '',
    birthYear: '1989',
    address: '8A, Đường 12, phường Long Thạnh Mỹ, thành phố Thủ Đức, thành phố Hồ Chí Minh',
    phone: '0909 094 089',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 57,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Hà Ngọc Vũ',
    company: 'Công ty TNHH TMDV LPG Long Phước',
    email: '',
    birthYear: '1990',
    address: '151/5 đường Long Phước, phường Long Phước, Hồ Chí Minh',
    phone: '0938 079 190',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 58,
    category: 'ĐL/CH',
    role: 'Hội viên chính thức',
    name: 'Phạm Vũ Anh Tuấn',
    company: 'Công ty TNHH Dầu khí Tuấn Khang',
    email: '',
    birthYear: '',
    address: '155/6 Đường Nguyễn Thị Kiểu, Phường Tân Thới Hiệp, Thành phố Hồ Chí Minh',
    phone: '0949 937 171',
    bch: false,
    btv: false,
    feeStatus: '',
    avatarUrl: ''
  },
  {
    stt: 59,
    category: 'ĐL/CH',
    role: 'Ủy viên Ban Chấp hành',
    name: 'Nguyễn Tấn Đạt',
    company: 'HKD Gas Tấn Đạt',
    email: '',
    birthYear: '1990',
    address: '311 ấp Bến Liễu, xã Phú An, thành phố Bến Cát, tỉnh Bình Dương',
    phone: '0366 120 130',
    bch: true,
    btv: false,
    feeStatus: 'Chưa nộp',
    avatarUrl: ''
  }
];

async function syncAll() {
  const client = new Client({
    connectionString: 'postgresql://user_dc4dbdfce69c:kFm4SnCtamVOG4I5kupsG6bBxkgAAY8h@tinhgon.xyz:30013/hoba_test'
  });

  await client.connect();
  console.log('Connected to PostgreSQL successfully.');

  // 1. Create a backup of existing members and configs
  const oldMembers = await client.query('SELECT * FROM members');
  const oldConfigs = await client.query('SELECT * FROM website_config WHERE key LIKE \'%committee%\' OR key = \'memberspage\'');

  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `backup_before_sync_2026_${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify({ members: oldMembers.rows, configs: oldConfigs.rows }, null, 2));
  console.log(`✓ Safety backup created with ${oldMembers.rows.length} existing members: ${backupFile}`);

  // 2. Prepare 59 member records with generated UUIDs and enum-valid business_type
  const membersWithIds = rawMembersData.map(m => {
    // business_type mapping
    let bType = 'Phân phối & Bán lẻ';
    if (m.category === 'Trạm chiết') {
      bType = 'Sản xuất & Chiết nạp';
    }

    return {
      ...m,
      id: generateUUID(),
      businessType: bType
    };
  });

  // 3. Clear and insert all 59 members into `members` table
  await client.query('BEGIN');
  try {
    await client.query('DELETE FROM members');
    console.log('Cleared old members from database.');

    const insertQuery = `
      INSERT INTO members (
        id, company_name, representative_name, representative_role, 
        email, phone, address, business_type, association_role, 
        status, join_date, created_at, representative_avatar_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12
      )
    `;

    for (const m of membersWithIds) {
      await client.query(insertQuery, [
        m.id,
        m.company,
        m.name,
        m.role,
        m.email || null,
        m.phone || null,
        m.address || null,
        m.businessType,
        m.role,
        'Active',
        '2025-11-25',
        m.avatarUrl || null
      ]);
    }
    console.log(`✓ Inserted ${membersWithIds.length} new members into DB.`);

    // 4. Construct Ban Thường vụ config (8 members)
    const btvChairmanRaw = membersWithIds.find(m => m.stt === 1);
    const btvViceChairmenRaw = membersWithIds.filter(m => [2, 3, 4, 5].includes(m.stt));
    const btvMembersRaw = membersWithIds.filter(m => [6, 7, 8].includes(m.stt));

    const configBtv = {
      term: 'NHIỆM KỲ 2025 - 2029',
      title: 'Ban Thường vụ Hiệp hội HOBA LPG',
      subtitle: 'Cơ quan thường trực điều hành và triển khai mọi quyết nghị hoạt động của Hiệp hội HOBA LPG.',
      chairman: {
        name: btvChairmanRaw.name,
        role: 'Chủ tịch Hiệp hội',
        company: btvChairmanRaw.company,
        avatarUrl: btvChairmanRaw.avatarUrl,
        memberId: btvChairmanRaw.id,
        isVerified: true
      },
      viceChairmen: btvViceChairmenRaw.map(v => ({
        name: v.name,
        role: 'Phó Chủ tịch Hiệp hội',
        company: v.company,
        avatarUrl: v.avatarUrl || '',
        memberId: v.id
      })),
      members: btvMembersRaw.map(m => ({
        name: m.name,
        role: 'Ủy viên Ban Thường vụ',
        company: m.company,
        avatarUrl: m.avatarUrl || '',
        memberId: m.id
      })),
      chairmanSectionTitle: 'Chủ tịch Ban Thường vụ',
      viceChairmanSectionTitle: 'Phó Chủ tịch Ban Thường vụ',
      memberSectionTitle: 'Ủy viên Ban Thường vụ',
      showChairman: true,
      showViceChairmen: true,
      showMembers: true
    };

    // 5. Construct Ban Kiểm tra config (3 members)
    const bktChairmanRaw = membersWithIds.find(m => m.stt === 19);
    const bktMembersRaw = membersWithIds.filter(m => [20, 21].includes(m.stt));

    const configBkt = {
      term: 'NHIỆM KỲ 2025 - 2029',
      title: 'Ban Kiểm tra Hiệp hội HOBA LPG',
      subtitle: 'Cơ quan giám sát độc lập bảo đảm tính minh bạch, kỷ luật và tuân thủ điều lệ Hiệp hội HOBA LPG.',
      chairman: {
        name: bktChairmanRaw.name,
        role: 'Trưởng Ban Kiểm tra',
        company: bktChairmanRaw.company,
        avatarUrl: bktChairmanRaw.avatarUrl || '',
        memberId: bktChairmanRaw.id,
        isVerified: true
      },
      viceChairmen: [],
      members: bktMembersRaw.map(m => ({
        name: m.name,
        role: 'Ủy viên Ban Kiểm tra',
        company: m.company,
        avatarUrl: m.avatarUrl || '',
        memberId: m.id
      })),
      chairmanSectionTitle: 'Trưởng ban Kiểm tra',
      viceChairmanSectionTitle: 'Phó Trưởng ban Kiểm tra',
      memberSectionTitle: 'Ủy viên Ban Kiểm tra',
      showChairman: true,
      showViceChairmen: false,
      showMembers: true
    };

    // 6. Construct Ban Chấp hành config (20 members)
    // 1 Chairman, 4 ViceChairmen, 15 Members (3 UVBTV + 1 Trưởng BKT + 11 UVBCH)
    const bchChairmanRaw = membersWithIds.find(m => m.stt === 1);
    const bchViceChairmenRaw = membersWithIds.filter(m => [2, 3, 4, 5].includes(m.stt));
    const bchMembersRaw = membersWithIds.filter(m => [6, 7, 8, 19, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 59].includes(m.stt));

    const configBch = {
      term: 'NHIỆM KỲ 2025 - 2029',
      title: 'Ban Chấp hành Hiệp hội HOBA LPG',
      subtitle: 'Đội ngũ lãnh đạo đại diện cho cộng đồng doanh nghiệp và hội viên kinh doanh khí dầu mỏ hóa lỏng TP.HCM.',
      chairman: {
        name: bchChairmanRaw.name,
        role: 'Chủ tịch Hiệp hội',
        company: bchChairmanRaw.company,
        avatarUrl: bchChairmanRaw.avatarUrl,
        memberId: bchChairmanRaw.id,
        isVerified: true
      },
      viceChairmen: bchViceChairmenRaw.map(v => ({
        name: v.name,
        role: 'Phó Chủ tịch Hiệp hội',
        company: v.company,
        avatarUrl: v.avatarUrl || '',
        memberId: v.id
      })),
      members: bchMembersRaw.map(m => {
        let displayRole = 'Ủy viên Ban Chấp hành';
        if (m.stt === 19) displayRole = 'Trưởng Ban Kiểm tra';
        else if ([6, 7, 8].includes(m.stt)) displayRole = 'Ủy viên Ban Thường vụ';

        return {
          name: m.name,
          role: displayRole,
          company: m.company,
          avatarUrl: m.avatarUrl || '',
          memberId: m.id
        };
      }),
      chairmanSectionTitle: 'Chủ tịch Hiệp hội',
      viceChairmanSectionTitle: 'Phó Chủ tịch & Ban Thường trực',
      memberSectionTitle: 'Danh sách Ủy viên Ban Chấp hành',
      showChairman: true,
      showViceChairmen: true,
      showMembers: true
    };

    // 7. Update website_config in DB
    const upsertConfig = async (key, val) => {
      const exists = await client.query('SELECT 1 FROM website_config WHERE key = $1', [key]);
      if (exists.rows.length > 0) {
        await client.query('UPDATE website_config SET value = $1 WHERE key = $2', [JSON.stringify(val), key]);
      } else {
        await client.query('INSERT INTO website_config (key, value) VALUES ($1, $2)', [key, JSON.stringify(val)]);
      }
    };

    await upsertConfig('hoba_website_committee_ban-chap-hanh', configBch);
    await upsertConfig('hoba_website_committee_ban-thuong-vu', configBtv);
    await upsertConfig('hoba_website_committee_ban-kiem-tra', configBkt);

    // Update memberspage stats count = 59
    const membersPageRes = await client.query('SELECT value FROM website_config WHERE key = \'memberspage\'');
    let membersPageVal = {};
    if (membersPageRes.rows.length > 0 && membersPageRes.rows[0].value) {
      membersPageVal = typeof membersPageRes.rows[0].value === 'string' 
        ? JSON.parse(membersPageRes.rows[0].value) 
        : membersPageRes.rows[0].value;
    }
    if (Array.isArray(membersPageVal.stats)) {
      membersPageVal.stats = membersPageVal.stats.map(s => {
        if (s.label && s.label.includes('Hội viên')) {
          return { ...s, value: '59' };
        }
        return s;
      });
    } else {
      membersPageVal.stats = [
        { value: '59', label: 'Doanh nghiệp Hội viên', icon: 'groups' },
        { value: '63', label: 'Tỉnh thành phủ sóng', icon: 'location_on' },
        { value: '100%', label: 'Cam kết an toàn', icon: 'verified' },
        { value: '2025', label: 'Năm thành lập', icon: 'calendar_today' }
      ];
    }
    await upsertConfig('memberspage', membersPageVal);

    await client.query('COMMIT');
    console.log('✓ Database transaction committed successfully!');

    // 8. Update local fallback JSON files
    const fallbackBchPath = path.join(__dirname, '../src/lib/defaultCommitteeBanChapHanh.json');
    const fallbackBtvPath = path.join(__dirname, '../src/lib/defaultCommitteeBanThuongVu.json');
    const fallbackBktPath = path.join(__dirname, '../src/lib/defaultCommitteeBanKiemTra.json');

    fs.writeFileSync(fallbackBchPath, JSON.stringify(configBch, null, 2), 'utf-8');
    fs.writeFileSync(fallbackBtvPath, JSON.stringify(configBtv, null, 2), 'utf-8');
    fs.writeFileSync(fallbackBktPath, JSON.stringify(configBkt, null, 2), 'utf-8');
    console.log('✓ Synchronized fallback JSON files.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during synchronization, transaction rolled back:', err);
    throw err;
  } finally {
    await client.end();
  }
}

syncAll()
  .then(() => console.log('\n🎉 ALL DONE! 59 members and leadership boards synchronized!'))
  .catch(console.error);

