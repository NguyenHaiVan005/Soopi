import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const adminPassword = bcrypt.hashSync('admin123', 10);
const userPassword = bcrypt.hashSync('123456', 10);

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  return `'` + String(v).replace(/'/g, "''") + `'`;
}

const lines = [
  '-- Soopi Craft Cloudflare D1 Seed Data (Handmade / Artisanal Products)',
  'PRAGMA foreign_keys = OFF;',
  'DELETE FROM order_items;',
  'DELETE FROM orders;',
  'DELETE FROM products;',
  'DELETE FROM categories;',
  'DELETE FROM banners;',
  'DELETE FROM users;',
  ''
];

// Users
lines.push(
  `INSERT INTO users (id, name, email, password_hash, phone, address, role, status, created_at, updated_at) VALUES (1, 'Quản Trị Viên Soopi', 'admin@soopi.vn', ${sqlVal(adminPassword)}, '0901234567', 'Tầng 12, Keangnam Landmark, Hà Nội', 'admin', 'active', '2026-11-06 12:00:00', '2026-11-06 12:00:00');`,
  `INSERT INTO users (id, name, email, password_hash, phone, address, role, status, created_at, updated_at) VALUES (2, 'Nguyễn Văn An', 'khachhang@gmail.com', ${sqlVal(userPassword)}, '0987654321', 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội', 'customer', 'active', '2026-11-06 12:00:00', '2026-11-06 12:00:00');`,
  `INSERT INTO users (id, name, email, password_hash, phone, address, role, status, created_at, updated_at) VALUES (3, 'Trần Thị Mai', 'maitran@gmail.com', ${sqlVal(userPassword)}, '0912345678', '452 Điện Biên Phủ, Phường 11, Quận 10, TP. Hồ Chí Minh', 'customer', 'active', '2026-11-06 12:00:00', '2026-11-06 12:00:00');`,
  ''
);

// Banners
const banners = [
  [1, 'Tinh Hoa Thủ Công Làng Nghề Việt', 'Mỗi sản phẩm là một câu chuyện độc bản, chế tác tỉ mỉ 100% bằng bàn tay nghệ nhân', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1400&q=80', '/products', 'THỦ CÔNG MỸ NGHỆ', 'from-amber-700 to-orange-800', 1],
  [2, 'Gốm Sứ Bát Tràng & Mây Tre Mộc Mạc', 'Không gian sống xanh an lành với chất liệu tự nhiên, thân thiện với môi trường', 'https://images.unsplash.com/photo-1595053826286-2e59ef792193?auto=format&fit=crop&w=1400&q=80', '/products?category=may-tre-do-go', 'BỘ SƯU TẬP MỚI', 'from-emerald-700 to-teal-800', 1],
  [3, 'Quà Tặng Handmade & Nến Thơm Tự Nhiên', 'Gửi trọn yêu thương trong từng đường kim mũi chỉ và hương thơm thảo mộc dịu êm', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1400&q=80', '/products?category=nen-thom-tinh-dau', 'QUÀ TẶNG Ý NGHĨA', 'from-rose-600 to-amber-700', 1]
];

for (const b of banners) {
  lines.push(`INSERT INTO banners (id, title, subtitle, image_url, link_url, badge_text, bg_gradient, is_active, created_at) VALUES (${b[0]}, ${sqlVal(b[1])}, ${sqlVal(b[2])}, ${sqlVal(b[3])}, ${sqlVal(b[4])}, ${sqlVal(b[5])}, ${sqlVal(b[6])}, ${b[7]}, '2026-11-06 12:00:00');`);
}
lines.push('');

// Categories
const categories = [
  [1, 'Gốm Sứ Bát Tràng', 'gom-su-thu-cong', 'Coffee', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'],
  [2, 'Mây Tre & Đồ Gỗ', 'may-tre-do-go', 'Hammer', 'https://images.unsplash.com/photo-1595053826286-2e59ef792193?auto=format&fit=crop&w=400&q=80'],
  [3, 'Thêu Tay & Thổ Cẩm', 'theu-tay-tho-cam', 'Scissors', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'],
  [4, 'Nến Thơm & Tinh Dầu', 'nen-thom-tinh-dau', 'Flame', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80'],
  [5, 'Trang Sức Thủ Công', 'trang-suc-thu-cong', 'Gem', 'https://images.unsplash.com/photo-1611591475870-13f508cae10d?auto=format&fit=crop&w=400&q=80'],
  [6, 'Quà Tặng & Decor', 'qua-tang-decor', 'Gift', 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&q=80'],
];

for (const c of categories) {
  lines.push(`INSERT INTO categories (id, name, slug, icon, image_url, created_at) VALUES (${c[0]}, ${sqlVal(c[1])}, ${sqlVal(c[2])}, ${sqlVal(c[3])}, ${sqlVal(c[4])}, '2026-11-06 12:00:00');`);
}
lines.push('');

// Products
const products = [
  {
    id: 1,
    category_id: 1,
    name: 'Bộ Ấm Chén Gốm Mộc Bát Tràng Men Hoả Biến Cao Cấp',
    slug: 'bo-am-chen-gom-moc-bat-trang-men-hoa-bien',
    price: 680000,
    original_price: 850000,
    stock: 35,
    sold_count: 240,
    rating: 4.9,
    reviews_count: 76,
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Bộ ấm trà gốm mộc Bát Tràng tráng men hoả biến độc bản, nung ở nhiệt độ 1300°C giữ nhiệt hoàn hảo, gồm 1 ấm trà, 6 chén và 1 khay lót gốm sang trọng.',
    is_featured: 1,
    is_new: 1
  },
  {
    id: 2,
    category_id: 1,
    name: 'Bình Hoa Gốm Vuốt Tay Men Rạn Khắc Nổi Cổ Điển',
    slug: 'binh-hoa-gom-vuot-tay-men-ran-co-dien',
    price: 350000,
    original_price: 420000,
    stock: 50,
    sold_count: 180,
    rating: 4.8,
    reviews_count: 54,
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Bình hoa gốm vuốt tay thủ công từ làng nghề Bát Tràng, họa tiết men rạn giả cổ tinh tế, thích hợp cắm hoa sen, hoa loa kèn hoặc decor phòng khách mang phong vị hoài niệm.',
    is_featured: 1,
    is_new: 0
  },
  {
    id: 3,
    category_id: 1,
    name: 'Tách Cà Phê Gốm Mộc Nung Củi Vẽ Hoa Sen Thủ Công',
    slug: 'tach-ca-phe-gom-moc-nung-cui-ve-hoa-sen',
    price: 165000,
    original_price: 210000,
    stock: 90,
    sold_count: 320,
    rating: 4.9,
    reviews_count: 89,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Ly gốm mộc nung củi truyền thống, từng nét vẽ hoa sen bằng tay thanh thoát, bề mặt nhám mộc mạc cầm chắc tay, dung tích 280ml hoàn hảo cho espresso hoặc capuccino.',
    is_featured: 0,
    is_new: 1
  },
  {
    id: 4,
    category_id: 2,
    name: 'Giỏ Mây Tre Đan Đựng Đồ Đa Năng Quai Da Thật',
    slug: 'gio-may-tre-dan-da-nang-quai-da',
    price: 295000,
    original_price: 380000,
    stock: 65,
    sold_count: 410,
    rating: 4.8,
    reviews_count: 112,
    image_url: 'https://images.unsplash.com/photo-1595053826286-2e59ef792193?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1595053826286-2e59ef792193?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Giỏ đan từ sợi mây tự nhiên đã qua xử lý chống mối mọt ẩm mốc, quai xách bằng da bò sáp khâu chỉ dù, dùng đựng quần áo, đồ chơi hoặc decor góc chụp ảnh vintage.',
    is_featured: 1,
    is_new: 1
  },
  {
    id: 5,
    category_id: 2,
    name: 'Đèn Thả Trần Mây Tre Đan Dáng Lồng Chim Decor',
    slug: 'den-tha-tran-may-tre-dan-decor',
    price: 420000,
    original_price: 550000,
    stock: 40,
    sold_count: 145,
    rating: 4.9,
    reviews_count: 48,
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Chao đèn mây tre nan mảnh đan cài thủ công tạo hiệu ứng vệt sáng lung linh ấm áp, phụ kiện đui đèn đồng cổ điển và dây bọc vải dù cao cấp.',
    is_featured: 1,
    is_new: 0
  },
  {
    id: 6,
    category_id: 2,
    name: 'Khay Trà Gỗ Xà Cừ Nguyên Khối Bo Góc Tự Nhiên',
    slug: 'khay-tra-go-xa-cu-nguyen-khoi',
    price: 380000,
    original_price: 490000,
    stock: 45,
    sold_count: 190,
    rating: 4.7,
    reviews_count: 63,
    image_url: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Khay gỗ tiện thủ công từ thân cây xà cừ lâu năm, phủ sáp ong tự nhiên an toàn tuyệt đối cho thực phẩm, vân gỗ tự nhiên uốn lượn độc bản.',
    is_featured: 0,
    is_new: 1
  },
  {
    id: 7,
    category_id: 2,
    name: 'Hộp Đựng Giấy Ăn Mây Guột Thủ Công Xuất Khẩu',
    slug: 'hop-dung-giay-an-may-guot-thu-cong',
    price: 185000,
    original_price: 240000,
    stock: 120,
    sold_count: 530,
    rating: 4.9,
    reviews_count: 142,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Sản phẩm từ làng nghề mây tre đan Phú Vinh, đan mắt cáo đều đặn khít khao, nắp mở tiện lợi, điểm nhấn mộc mạc cho bàn ăn và bàn trà.',
    is_featured: 0,
    is_new: 0
  },
  {
    id: 8,
    category_id: 3,
    name: 'Túi Vải Canvas Dệt Thô Thêu Hoa Cúc Tay Tỉ Mỉ',
    slug: 'tui-canvas-theu-hoa-cuc-tay',
    price: 260000,
    original_price: 350000,
    stock: 80,
    sold_count: 620,
    rating: 4.9,
    reviews_count: 215,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Chất liệu canvas cotton dệt mộc tự nhiên không tẩy trắng, thêu tay từng cánh hoa cúc dại bằng chỉ tơ bóng bền màu, có ngăn phụ bên trong đựng vừa laptop 14 inch.',
    is_featured: 1,
    is_new: 1
  },
  {
    id: 9,
    category_id: 3,
    name: 'Khăn Rằn Nam Bộ Sợi Đay Tự Nhiên Dệt Khung Cửi Cổ',
    slug: 'khan-ran-nam-bo-soi-day-det-tay',
    price: 95000,
    original_price: 130000,
    stock: 150,
    sold_count: 880,
    rating: 4.8,
    reviews_count: 290,
    image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Khăn rằn truyền thống dệt từ khung cửi gỗ tại làng dệt Hồng Ngự (Đồng Tháp), sợi bông thiên nhiên thấm hút mồ hôi cực tốt, càng giặt càng mềm mịn.',
    is_featured: 0,
    is_new: 0
  },
  {
    id: 10,
    category_id: 3,
    name: 'Ví Cầm Tay Thổ Cẩm Dệt Tay Hoạ Tiết Hoa Văn H\'Mông',
    slug: 'vi-tho-cam-det-tay-hoa-van-hmong',
    price: 210000,
    original_price: 280000,
    stock: 70,
    sold_count: 340,
    rating: 4.9,
    reviews_count: 95,
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Ví thổ cẩm dệt lanh vẽ sáp ong nhuộm chàm thủ công bởi phụ nữ H\'Mông Sa Pa, lót vải dù chống thấm bên trong với khoá kéo YKK mượt mà.',
    is_featured: 1,
    is_new: 0
  },
  {
    id: 11,
    category_id: 4,
    name: 'Nến Thơm Sáp Đậu Nành Tinh Dầu Quế Trà Bồng & Vỏ Cam',
    slug: 'nen-thom-sap-dau-nanh-que-tra-bong',
    price: 235000,
    original_price: 295000,
    stock: 110,
    sold_count: 710,
    rating: 4.9,
    reviews_count: 180,
    image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Nến thơm thủ công từ 100% sáp đậu nành thiên nhiên, tim nến bấc gỗ tiếng cháy tí tách êm dịu, tinh dầu quế nguyên chất phối cam ngọt sưởi ấm không gian và khử mùi hiệu quả.',
    is_featured: 1,
    is_new: 1
  },
  {
    id: 12,
    category_id: 4,
    name: 'Set Quà Tặng Nến Thơm & Tinh Dầu Hoa Sen Tây Hồ Tinh Khiết',
    slug: 'set-qua-tang-nen-thom-tinh-dau-hoa-sen',
    price: 520000,
    original_price: 650000,
    stock: 40,
    sold_count: 230,
    rating: 5.0,
    reviews_count: 68,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Hộp quà thủ công thắt nơ lục bình tinh tế gồm 1 hũ nến thơm 200g hương hoa sen thanh khiết, 1 lọ tinh dầu khuếch tán 50ml và que mây tán hương tự nhiên.',
    is_featured: 1,
    is_new: 1
  },
  {
    id: 13,
    category_id: 5,
    name: 'Vòng Tay Trầm Hương Tự Nhiên Bọc Bạc Ý 108 Hạt Bình An',
    slug: 'vong-tay-tram-huong-boc-bac-108-hat',
    price: 890000,
    original_price: 1200000,
    stock: 30,
    sold_count: 195,
    rating: 5.0,
    reviews_count: 82,
    image_url: 'https://images.unsplash.com/photo-1611591475870-13f508cae10d?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1611591475870-13f508cae10d?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Hạt trầm hương Tiên Phước Quảng Nam tích tụ trầm lâu năm thơm dịu ngọt vĩnh viễn, xâu chuỗi 108 hạt biểu trưng cho sự an yên, điểm xuyết charm hoa sen bạc 925 thủ công.',
    is_featured: 1,
    is_new: 1
  },
  {
    id: 14,
    category_id: 5,
    name: 'Hoa Tai Gốm Men Nung Lam Cổ Vẽ Tay Bọc Bạc Thủ Công',
    slug: 'hoa-tai-gom-men-nung-lam-co',
    price: 145000,
    original_price: 190000,
    stock: 85,
    sold_count: 420,
    rating: 4.8,
    reviews_count: 104,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Mặt hoa tai chế tác từ gốm nung men lam truyền thống, vẽ hoạ tiết mây sóng thủ công, chốt tai bằng bạc 925 chống dị ứng, nhẹ êm khi đeo.',
    is_featured: 0,
    is_new: 1
  },
  {
    id: 15,
    category_id: 5,
    name: 'Dây Chuyền Mặt Đá Thạch Anh Thô Wire Wrap Uốn Dây Đồng',
    slug: 'day-chuyen-thach-anh-wire-wrap-thu-cong',
    price: 320000,
    original_price: 420000,
    stock: 35,
    sold_count: 160,
    rating: 4.9,
    reviews_count: 49,
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Mỗi viên thạch anh tự nhiên có hình dáng độc nhất, được nghệ nhân uốn dây đồng chống rỉ thủ công tinh xảo, kèm dây da bò mềm mại phong cách bohemian cá tính.',
    is_featured: 1,
    is_new: 0
  },
  {
    id: 16,
    category_id: 6,
    name: 'Tranh Thêu Tay Nghệ Thuật Phố Cổ Hà Nội Khung Gỗ Tự Nhiên',
    slug: 'tranh-theu-tay-pho-co-ha-noi',
    price: 1150000,
    original_price: 1450000,
    stock: 20,
    sold_count: 85,
    rating: 5.0,
    reviews_count: 32,
    image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Tác phẩm thêu tay truyền thống từ làng nghề Quất Động (Hà Nội), sử dụng hơn 40 sắc màu chỉ tơ tằm tái hiện góc phố cổ rêu phong, lồng khung gỗ sồi chống ẩm kích thước 40x50cm.',
    is_featured: 1,
    is_new: 0
  },
  {
    id: 17,
    category_id: 6,
    name: 'Chuông Gió Gốm Đất Nung Khắc Nổi Âm Vang Trong Trẻo',
    slug: 'chuong-gio-gom-dat-nung-khac-noi',
    price: 175000,
    original_price: 230000,
    stock: 90,
    sold_count: 380,
    rating: 4.8,
    reviews_count: 92,
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Chuông gió nặn từ đất sét tự nhiên nung già, tạo âm thanh lách cách thanh thoát khi đón gió, mang lại may mắn và không khí thư thái cho ban công, hiên nhà.',
    is_featured: 0,
    is_new: 1
  },
  {
    id: 18,
    category_id: 6,
    name: 'Móc Khóa Len Đan Tay Hình Chú Mèo May Mắn Handmade',
    slug: 'moc-khoa-len-dan-tay-meo-may-man',
    price: 65000,
    original_price: 90000,
    stock: 200,
    sold_count: 1250,
    rating: 4.9,
    reviews_count: 410,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify([
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Đan tay tỉ mỉ từ len sợi cotton mềm mại không bai xù, nhồi bông gòn êm ái, đính kèm móc kim loại mạ vàng sáng bóng, món quà nhỏ nhắn dễ thương cho bạn bè.',
    is_featured: 0,
    is_new: 1
  }
];

for (const p of products) {
  lines.push(
    `INSERT INTO products (id, category_id, name, slug, price, original_price, stock, sold_count, rating, reviews_count, image_url, images_json, description, is_featured, is_new, status, created_at, updated_at) VALUES (${p.id}, ${p.category_id}, ${sqlVal(p.name)}, ${sqlVal(p.slug)}, ${p.price}, ${p.original_price}, ${p.stock}, ${p.sold_count}, ${p.rating}, ${p.reviews_count}, ${sqlVal(p.image_url)}, ${sqlVal(p.images_json)}, ${sqlVal(p.description)}, ${p.is_featured}, ${p.is_new}, 'active', '2026-11-06 12:00:00', '2026-11-06 12:00:00');`
  );
}
lines.push('');

// Orders
lines.push(
  `INSERT INTO orders (id, order_code, user_id, customer_name, customer_phone, customer_address, customer_note, payment_method, payment_status, shipping_status, subtotal, shipping_fee, total_amount, created_at, updated_at) VALUES (1, 'SP-20261101-1001', 2, 'Nguyễn Văn An', '0987654321', 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội', 'Giao trong giờ hành chính giúp em ạ', 'COD', 'unpaid', 'delivered', 235000, 0, 235000, '2026-11-01 09:30:00', '2026-11-06 12:00:00');`,
  `INSERT INTO orders (id, order_code, user_id, customer_name, customer_phone, customer_address, customer_note, payment_method, payment_status, shipping_status, subtotal, shipping_fee, total_amount, created_at, updated_at) VALUES (2, 'SP-20261102-1002', 2, 'Nguyễn Văn An', '0987654321', 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội', 'Hàng gốm sứ xin bọc xốp cẩn thận giúp em', 'COD', 'unpaid', 'shipping', 680000, 0, 680000, '2026-11-02 14:15:00', '2026-11-06 12:00:00');`,
  `INSERT INTO orders (id, order_code, user_id, customer_name, customer_phone, customer_address, customer_note, payment_method, payment_status, shipping_status, subtotal, shipping_fee, total_amount, created_at, updated_at) VALUES (3, 'SP-20261103-1003', NULL, 'Lê Hoàng Nam', '0978112233', 'Tòa nhà Landmark 81, P. 22, Bình Thạnh, TP. Hồ Chí Minh', 'Đóng gói hộp quà kèm thiệp giúp mình nhé', 'COD', 'unpaid', 'pending', 1150000, 0, 1150000, '2026-11-03 10:20:00', '2026-11-06 12:00:00');`,
  ''
);

// Order Items
lines.push(
  `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, price, quantity, total) VALUES (1, 1, 11, 'Nến Thơm Sáp Đậu Nành Tinh Dầu Quế Trà Bồng & Vỏ Cam', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80', 235000, 1, 235000);`,
  `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, price, quantity, total) VALUES (2, 2, 1, 'Bộ Ấm Chén Gốm Mộc Bát Tràng Men Hoả Biến Cao Cấp', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', 680000, 1, 680000);`,
  `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, price, quantity, total) VALUES (3, 3, 16, 'Tranh Thêu Tay Nghệ Thuật Phố Cổ Hà Nội Khung Gỗ Tự Nhiên', 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80', 1150000, 1, 1150000);`,
  '',
  'PRAGMA foreign_keys = ON;'
);

const outPath = path.resolve('server/seed.sql');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Generated ${lines.length} lines of SQL in server/seed.sql`);

