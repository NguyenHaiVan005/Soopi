import bcrypt from 'bcryptjs';
import { createDbAdapter } from './db.js';

export async function seedDatabase(env = null) {
  const db = createDbAdapter(env);
  console.log('🌱 Starting Soopi Craft database seeding...');

  // Reset old tables to cleanly replace with handmade catalog
  await db.run('DELETE FROM order_items');
  await db.run('DELETE FROM orders');
  await db.run('DELETE FROM products');
  await db.run('DELETE FROM categories');
  await db.run('DELETE FROM banners');
  await db.run('DELETE FROM users');

  // 1. Seed Users
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('123456', 10);

  const adminRes = await db.run(
    `INSERT INTO users (id, name, email, password_hash, phone, address, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 'Quản Trị Viên Soopi', 'admin@soopi.vn', adminPassword, '0901234567', 'Tầng 12, Keangnam Landmark, Hà Nội', 'admin', 'active']
  );

  const customer1 = await db.run(
    `INSERT INTO users (id, name, email, password_hash, phone, address, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [2, 'Nguyễn Văn An', 'khachhang@gmail.com', userPassword, '0987654321', 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội', 'customer', 'active']
  );

  const customer2 = await db.run(
    `INSERT INTO users (id, name, email, password_hash, phone, address, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [3, 'Trần Thị Mai', 'maitran@gmail.com', userPassword, '0912345678', '452 Điện Biên Phủ, Phường 11, Quận 10, TP. Hồ Chí Minh', 'customer', 'active']
  );

  // 2. Seed Banners
  const banners = [
    {
      id: 1,
      title: 'Tinh Hoa Thủ Công Làng Nghề Việt',
      subtitle: 'Mỗi sản phẩm là một câu chuyện độc bản, chế tác tỉ mỉ 100% bằng bàn tay nghệ nhân',
      image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1400&q=80',
      badge_text: 'THỦ CÔNG MỸ NGHỆ',
      bg_gradient: 'from-amber-700 to-orange-800',
      link_url: '/products'
    },
    {
      id: 2,
      title: 'Gốm Sứ Bát Tràng & Mây Tre Mộc Mạc',
      subtitle: 'Không gian sống xanh an lành với chất liệu tự nhiên, thân thiện với môi trường',
      image_url: 'https://images.unsplash.com/photo-1595053826286-2e59ef792193?auto=format&fit=crop&w=1400&q=80',
      badge_text: 'BỘ SƯU TẬP MỚI',
      bg_gradient: 'from-emerald-700 to-teal-800',
      link_url: '/products?category=may-tre-do-go'
    },
    {
      id: 3,
      title: 'Quà Tặng Handmade & Nến Thơm Tự Nhiên',
      subtitle: 'Gửi trọn yêu thương trong từng đường kim mũi chỉ và hương thơm thảo mộc dịu êm',
      image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1400&q=80',
      badge_text: 'QUÀ TẶNG Ý NGHĨA',
      bg_gradient: 'from-rose-600 to-amber-700',
      link_url: '/products?category=nen-thom-tinh-dau'
    }
  ];

  for (const b of banners) {
    await db.run(
      `INSERT INTO banners (id, title, subtitle, image_url, badge_text, bg_gradient, link_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [b.id, b.title, b.subtitle, b.image_url, b.badge_text, b.bg_gradient, b.link_url]
    );
  }

  // 3. Seed Categories
  const categories = [
    { id: 1, name: 'Gốm Sứ Bát Tràng', slug: 'gom-su-thu-cong', icon: 'Coffee', image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Mây Tre & Đồ Gỗ', slug: 'may-tre-do-go', icon: 'Hammer', image_url: 'https://images.unsplash.com/photo-1595053826286-2e59ef792193?auto=format&fit=crop&w=400&q=80' },
    { id: 3, name: 'Thêu Tay & Thổ Cẩm', slug: 'theu-tay-tho-cam', icon: 'Scissors', image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80' },
    { id: 4, name: 'Nến Thơm & Tinh Dầu', slug: 'nen-thom-tinh-dau', icon: 'Flame', image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80' },
    { id: 5, name: 'Trang Sức Thủ Công', slug: 'trang-suc-thu-cong', icon: 'Gem', image_url: 'https://images.unsplash.com/photo-1611591475870-13f508cae10d?auto=format&fit=crop&w=400&q=80' },
    { id: 6, name: 'Quà Tặng & Decor', slug: 'qua-tang-decor', icon: 'Gift', image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&q=80' },
  ];

  for (const c of categories) {
    await db.run(
      `INSERT INTO categories (id, name, slug, icon, image_url) VALUES (?, ?, ?, ?, ?)`,
      [c.id, c.name, c.slug, c.icon, c.image_url]
    );
  }

  // 4. Seed Products
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
    await db.run(
      `INSERT INTO products (
        id, category_id, name, slug, price, original_price, stock, sold_count,
        rating, reviews_count, image_url, images_json, description,
        is_featured, is_new, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        p.id, p.category_id, p.name, p.slug, p.price, p.original_price, p.stock, p.sold_count,
        p.rating, p.reviews_count, p.image_url, p.images_json, p.description,
        p.is_featured, p.is_new
      ]
    );
  }

  // 5. Seed Sample Orders
  const sampleOrders = [
    {
      id: 1,
      order_code: 'SP-20261101-1001',
      user_id: 2,
      customer_name: 'Nguyễn Văn An',
      customer_phone: '0987654321',
      customer_address: 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội',
      customer_note: 'Giao trong giờ hành chính giúp em ạ',
      payment_method: 'COD',
      payment_status: 'unpaid',
      shipping_status: 'delivered',
      subtotal: 235000,
      shipping_fee: 0,
      total_amount: 235000,
      created_at: '2026-11-01 09:30:00',
      items: [
        {
          product_id: 11,
          product_name: 'Nến Thơm Sáp Đậu Nành Tinh Dầu Quế Trà Bồng & Vỏ Cam',
          product_image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
          price: 235000,
          quantity: 1,
          total: 235000
        }
      ]
    },
    {
      id: 2,
      order_code: 'SP-20261102-1002',
      user_id: 2,
      customer_name: 'Nguyễn Văn An',
      customer_phone: '0987654321',
      customer_address: 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội',
      customer_note: 'Hàng gốm sứ xin bọc xốp cẩn thận giúp em',
      payment_method: 'COD',
      payment_status: 'unpaid',
      shipping_status: 'shipping',
      subtotal: 680000,
      shipping_fee: 0,
      total_amount: 680000,
      created_at: '2026-11-02 14:15:00',
      items: [
        {
          product_id: 1,
          product_name: 'Bộ Ấm Chén Gốm Mộc Bát Tràng Men Hoả Biến Cao Cấp',
          product_image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
          price: 680000,
          quantity: 1,
          total: 680000
        }
      ]
    },
    {
      id: 3,
      order_code: 'SP-20261103-1003',
      user_id: null,
      customer_name: 'Lê Hoàng Nam',
      customer_phone: '0978112233',
      customer_address: 'Tòa nhà Landmark 81, P. 22, Bình Thạnh, TP. Hồ Chí Minh',
      customer_note: 'Đóng gói hộp quà kèm thiệp giúp mình nhé',
      payment_method: 'COD',
      payment_status: 'unpaid',
      shipping_status: 'pending',
      subtotal: 1150000,
      shipping_fee: 0,
      total_amount: 1150000,
      created_at: '2026-11-03 10:20:00',
      items: [
        {
          product_id: 16,
          product_name: 'Tranh Thêu Tay Nghệ Thuật Phố Cổ Hà Nội Khung Gỗ Tự Nhiên',
          product_image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
          price: 1150000,
          quantity: 1,
          total: 1150000
        }
      ]
    }
  ];

  for (const o of sampleOrders) {
    const oRes = await db.run(
      `INSERT INTO orders (
        id, order_code, user_id, customer_name, customer_phone, customer_address,
        customer_note, payment_method, payment_status, shipping_status,
        subtotal, shipping_fee, total_amount, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.id, o.order_code, o.user_id, o.customer_name, o.customer_phone, o.customer_address,
        o.customer_note, o.payment_method, o.payment_status, o.shipping_status,
        o.subtotal, o.shipping_fee, o.total_amount, o.created_at
      ]
    );

    for (const item of o.items) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [o.id, item.product_id, item.product_name, item.product_image, item.price, item.quantity, item.total]
      );
    }
  }

  console.log('✅ Soopi Craft database seeding completed successfully!');
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
