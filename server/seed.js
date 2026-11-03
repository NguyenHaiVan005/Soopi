import bcrypt from 'bcryptjs';
import { createDbAdapter } from './db.js';

export async function seedDatabase(env = null) {
  const db = createDbAdapter(env);
  console.log('🌱 Starting Soopi database seeding...');

  // Check if already seeded
  const existingUsers = await db.all('SELECT count(*) as count FROM users');
  if (existingUsers[0]?.count > 0) {
    console.log('⚡ Database already contains data. Skipping re-seed.');
    return;
  }

  // 1. Seed Users
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('123456', 10);

  await db.run(
    `INSERT INTO users (name, email, password_hash, phone, address, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Quản Trị Viên Soopi', 'admin@soopi.vn', adminPassword, '0901234567', 'Tầng 12, Keangnam Landmark, Hà Nội', 'admin', 'active']
  );

  const customer1 = await db.run(
    `INSERT INTO users (name, email, password_hash, phone, address, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Nguyễn Văn An', 'khachhang@gmail.com', userPassword, '0987654321', 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội', 'customer', 'active']
  );

  await db.run(
    `INSERT INTO users (name, email, password_hash, phone, address, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Trần Thị Mai', 'maitran@gmail.com', userPassword, '0912345678', '452 Điện Biên Phủ, Phường 11, Quận 10, TP. Hồ Chí Minh', 'customer', 'active']
  );

  // 2. Seed Banners
  const banners = [
    {
      title: 'Đại Tiệc Mua Sắm Siêu Sale 11.11',
      subtitle: 'Giảm tới 50% hàng ngàn sản phẩm công nghệ & thời trang chính hãng',
      image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80',
      badge_text: 'HOT SALE',
      bg_gradient: 'from-orange-600 to-red-600',
      link_url: '/products'
    },
    {
      title: 'Apple Days - Đỉnh Cao Công Nghệ',
      subtitle: 'iPhone 16 Pro Max, MacBook M3 tặng voucher 2.000.000₫ & Free ship',
      image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80',
      badge_text: 'CÔNG NGHỆ MỚI',
      bg_gradient: 'from-blue-600 to-indigo-700',
      link_url: '/products?category=dien-thoai-phu-kien'
    },
    {
      title: 'Thời Trang Thu Đông Xu Hướng Mới',
      subtitle: 'Bộ sưu tập áo khoác, hoodie trẻ trung năng động từ các local brand',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
      badge_text: 'BỘ SƯU TẬP 2026',
      bg_gradient: 'from-emerald-600 to-teal-700',
      link_url: '/products?category=thoi-trang'
    }
  ];

  for (const b of banners) {
    await db.run(
      `INSERT INTO banners (title, subtitle, image_url, badge_text, bg_gradient, link_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [b.title, b.subtitle, b.image_url, b.badge_text, b.bg_gradient, b.link_url]
    );
  }

  // 3. Seed Categories
  const categories = [
    { name: 'Điện Thoại & Phụ Kiện', slug: 'dien-thoai-phu-kien', icon: 'Smartphone', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Máy Tính & Laptop', slug: 'may-tinh-laptop', icon: 'Laptop', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80' },
    { name: 'Thời Trang Nam & Nữ', slug: 'thoi-trang', icon: 'Shirt', image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Thiết Bị Điện Gia Dụng', slug: 'dien-gia-dung', icon: 'Home', image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80' },
    { name: 'Đồng Hồ & Trang Sức', slug: 'dong-ho', icon: 'Watch', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sách & Văn Phòng Phẩm', slug: 'sach-van-phong', icon: 'BookOpen', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80' },
  ];

  const catMap = {};
  for (const c of categories) {
    const res = await db.run(
      `INSERT INTO categories (name, slug, icon, image_url) VALUES (?, ?, ?, ?)`,
      [c.name, c.slug, c.icon, c.image_url]
    );
    catMap[c.slug] = res.lastInsertRowid;
  }

  // 4. Seed Products
  const products = [
    {
      category_id: catMap['dien-thoai-phu-kien'],
      name: 'iPhone 16 Pro Max 256GB Titan Tự Nhiên',
      slug: 'iphone-16-pro-max-256gb',
      price: 33490000,
      original_price: 34990000,
      stock: 45,
      sold_count: 320,
      rating: 4.9,
      reviews_count: 89,
      image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'iPhone 16 Pro Max thiết kế Titan siêu bền nhẹ, trang bị chip Apple A18 Pro mạnh mẽ, camera điều khiển chuyên nghiệp, thời lượng pin cả ngày dài.',
      is_featured: 1,
      is_new: 1
    },
    {
      category_id: catMap['dien-thoai-phu-kien'],
      name: 'Tai Nghe Không Dây Chống Ồn Sony WH-1000XM5',
      slug: 'tai-nghe-sony-wh-1000xm5',
      price: 7490000,
      original_price: 8990000,
      stock: 60,
      sold_count: 145,
      rating: 4.8,
      reviews_count: 52,
      image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Tai nghe chụp tai đầu bảng Sony WH-1000XM5 với 2 bộ xử lý và 8 micro chống ồn chủ động, âm thanh Hi-Res Audio không dây, thời lượng pin 30 giờ.',
      is_featured: 1,
      is_new: 0
    },
    {
      category_id: catMap['dien-thoai-phu-kien'],
      name: 'Pin Sạc Dự Phòng Anker 20,000mAh 65W Sạc Siêu Nhanh',
      slug: 'pin-sac-du-phong-anker-20000mah-65w',
      price: 1190000,
      original_price: 1490000,
      stock: 120,
      sold_count: 580,
      rating: 4.9,
      reviews_count: 120,
      image_url: 'https://images.unsplash.com/photo-1609592424368-2415175953e5?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1609592424368-2415175953e5?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Sạc dự phòng Anker công suất cực đại 65W Power Delivery, sạc được cho cả laptop MacBook, màn hình LED hiển thị % pin chuẩn xác.',
      is_featured: 0,
      is_new: 1
    },
    {
      category_id: catMap['may-tinh-laptop'],
      name: 'MacBook Pro 14 M3 Pro 18GB / 512GB Space Black',
      slug: 'macbook-pro-14-m3-pro-18gb',
      price: 47990000,
      original_price: 49990000,
      stock: 25,
      sold_count: 85,
      rating: 5.0,
      reviews_count: 34,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'MacBook Pro thế hệ mới với vi xử lý Apple M3 Pro, màn hình Liquid Retina XDR 120Hz siêu sáng 1600 nits, cổng kết nối đa dạng HDMI, MagSafe, SD card.',
      is_featured: 1,
      is_new: 1
    },
    {
      category_id: catMap['may-tinh-laptop'],
      name: 'Chuột Không Dây Logitech MX Master 3S Ergonomic',
      slug: 'chuot-logitech-mx-master-3s',
      price: 2190000,
      original_price: 2590000,
      stock: 80,
      sold_count: 410,
      rating: 4.9,
      reviews_count: 98,
      image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Chuột công thái học hàng đầu cho dân văn phòng và lập trình viên: nút bấm Quiet Clicks êm ái, con lăn điện từ MagSpeed cuộn 1000 dòng/giây.',
      is_featured: 1,
      is_new: 0
    },
    {
      category_id: catMap['may-tinh-laptop'],
      name: 'Bàn Phím Cơ Không Dây Keychron K2 Pro QMK/VIA',
      slug: 'ban-phim-co-keychron-k2-pro',
      price: 2350000,
      original_price: 2690000,
      stock: 35,
      sold_count: 220,
      rating: 4.8,
      reviews_count: 67,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Bàn phím cơ layout 75% gọn gàng, switch hot-swappable tuỳ biến, kết nối Bluetooth 5.1 và cáp Type-C mượt mà tương thích macOS và Windows.',
      is_featured: 0,
      is_new: 1
    },
    {
      category_id: catMap['thoi-trang'],
      name: 'Áo Hoodie Unisex Oversize Nỉ Bông Dày Dặn Soopi Basic',
      slug: 'ao-hoodie-unisex-oversize-ni-bong',
      price: 389000,
      original_price: 550000,
      stock: 200,
      sold_count: 920,
      rating: 4.7,
      reviews_count: 310,
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Chất liệu nỉ bông chần cao cấp định lượng 380gsm không xù lông, form dáng oversize trẻ trung, giữ ấm tối ưu trong mùa lạnh.',
      is_featured: 1,
      is_new: 1
    },
    {
      category_id: catMap['thoi-trang'],
      name: 'Giày Sneaker Thể Thao Nam Nữ Phong Cách Retro Classic',
      slug: 'giay-sneaker-the-thao-retro-classic',
      price: 890000,
      original_price: 1200000,
      stock: 75,
      sold_count: 340,
      rating: 4.8,
      reviews_count: 114,
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Đế đệm khí êm chân cả ngày, da lộn kết hợp lưới thoáng khí, phong cách retro đường phố dễ phối đồ từ đi học đến đi làm.',
      is_featured: 1,
      is_new: 0
    },
    {
      category_id: catMap['thoi-trang'],
      name: 'Balo Chống Nước Đa Năng Đựng Laptop 15.6 inch',
      slug: 'balo-chong-nuoc-da-nang-laptop',
      price: 490000,
      original_price: 650000,
      stock: 110,
      sold_count: 480,
      rating: 4.9,
      reviews_count: 156,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Chất vải Oxford trượt nước bền bỉ, tích hợp cổng sạc USB, nhiều ngăn tiện ích chống sốc bảo vệ thiết bị tối đa.',
      is_featured: 0,
      is_new: 1
    },
    {
      category_id: catMap['dien-gia-dung'],
      name: 'Nồi Chiên Không Dầu Philips Dung Tích 6.2L XXL',
      slug: 'noi-chien-khong-dau-philips-6-2l-xxl',
      price: 2890000,
      original_price: 3690000,
      stock: 40,
      sold_count: 195,
      rating: 4.8,
      reviews_count: 73,
      image_url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Công nghệ Rapid Air giảm tới 90% lượng dầu mỡ, lòng nồi chống dính tháo rời vệ sinh máy rửa bát an toàn, 7 chương trình nấu cài đặt sẵn.',
      is_featured: 1,
      is_new: 0
    },
    {
      category_id: catMap['dien-gia-dung'],
      name: 'Robot Hút Bụi Lau Nhà Thông Minh Dreame Bot L10s Ultra',
      slug: 'robot-hut-bui-lau-nha-dreame-bot-l10s-ultra',
      price: 13990000,
      original_price: 16990000,
      stock: 18,
      sold_count: 65,
      rating: 4.9,
      reviews_count: 28,
      image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Tự động giặt sấy giẻ lau bằng khí nóng, tự đổ rác và bơm nước, camera AI nhận diện vật cản thông minh, lực hút 5300Pa siêu mạnh.',
      is_featured: 1,
      is_new: 1
    },
    {
      category_id: catMap['dong-ho'],
      name: 'Đồng Hồ Nam Cơ Lộ Máy Automatic Thép Không Gỉ 316L',
      slug: 'dong-ho-nam-co-lo-may-automatic',
      price: 3450000,
      original_price: 4500000,
      stock: 30,
      sold_count: 112,
      rating: 4.7,
      reviews_count: 42,
      image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Kính Sapphire nguyên khối chống trầy xước cao cấp, máy cơ Nhật Bản trữ cót 42 giờ, chống nước 5ATM an toàn khi đi mưa hay rửa tay.',
      is_featured: 0,
      is_new: 1
    },
    {
      category_id: catMap['dong-ho'],
      name: 'Đồng Hồ Thông Minh Apple Watch Series 10 Nhôm GPS',
      slug: 'apple-watch-series-10-gps',
      price: 10490000,
      original_price: 11290000,
      stock: 50,
      sold_count: 280,
      rating: 4.9,
      reviews_count: 88,
      image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Màn hình OLED góc rộng lớn nhất từng có trên Apple Watch, đo điện tâm đồ ECG, nồng độ oxy trong máu SpO2, phát hiện ngưng thở khi ngủ.',
      is_featured: 1,
      is_new: 1
    },
    {
      category_id: catMap['sach-van-phong'],
      name: 'Combo Sách: Tâm Lý Học Về Tiền & Khởi Nghiệp Tinh Gọn',
      slug: 'combo-sach-tam-ly-hoc-ve-tien',
      price: 245000,
      original_price: 320000,
      stock: 150,
      sold_count: 850,
      rating: 5.0,
      reviews_count: 260,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
      ]),
      description: 'Tác phẩm bán chạy kinh điển của Morgan Housel và Eric Ries, cẩm nang tư duy tài chính cá nhân và xây dựng doanh nghiệp thành công.',
      is_featured: 0,
      is_new: 0
    }
  ];

  const createdProducts = [];
  for (const p of products) {
    const res = await db.run(
      `INSERT INTO products (
        category_id, name, slug, price, original_price, stock, sold_count,
        rating, reviews_count, image_url, images_json, description, is_featured, is_new, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        p.category_id, p.name, p.slug, p.price, p.original_price, p.stock, p.sold_count,
        p.rating, p.reviews_count, p.image_url, p.images_json, p.description, p.is_featured, p.is_new
      ]
    );
    createdProducts.push({ id: res.lastInsertRowid, ...p });
  }

  // 5. Seed Sample Orders
  const sampleOrders = [
    {
      order_code: 'SP-20261101-1001',
      user_id: customer1.lastInsertRowid,
      customer_name: 'Nguyễn Văn An',
      customer_phone: '0987654321',
      customer_address: 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội',
      customer_note: 'Giao trong giờ hành chính giúp em ạ',
      payment_method: 'COD',
      payment_status: 'unpaid',
      shipping_status: 'delivered',
      subtotal: 1190000,
      shipping_fee: 0,
      total_amount: 1190000,
      created_at: '2026-11-01 09:30:00',
      items: [
        {
          product_id: createdProducts[2].id,
          product_name: createdProducts[2].name,
          product_image: createdProducts[2].image_url,
          price: createdProducts[2].price,
          quantity: 1,
          total: createdProducts[2].price
        }
      ]
    },
    {
      order_code: 'SP-20261102-1002',
      user_id: customer1.lastInsertRowid,
      customer_name: 'Nguyễn Văn An',
      customer_phone: '0987654321',
      customer_address: 'Số 28 Ngõ 102 Cầu Giấy, Phường Quan Hoa, Hà Nội',
      customer_note: 'Gọi điện trước khi giao',
      payment_method: 'COD',
      payment_status: 'unpaid',
      shipping_status: 'shipping',
      subtotal: 7490000,
      shipping_fee: 0,
      total_amount: 7490000,
      created_at: '2026-11-02 14:15:00',
      items: [
        {
          product_id: createdProducts[1].id,
          product_name: createdProducts[1].name,
          product_image: createdProducts[1].image_url,
          price: createdProducts[1].price,
          quantity: 1,
          total: createdProducts[1].price
        }
      ]
    },
    {
      order_code: 'SP-20261103-1003',
      user_id: null,
      customer_name: 'Lê Hoàng Nam',
      customer_phone: '0978112233',
      customer_address: 'Tòa nhà Landmark 81, P. 22, Bình Thạnh, TP. Hồ Chí Minh',
      customer_note: 'Hàng dễ vỡ, xin nhẹ tay',
      payment_method: 'COD',
      payment_status: 'unpaid',
      shipping_status: 'pending',
      subtotal: 33490000,
      shipping_fee: 0,
      total_amount: 33490000,
      created_at: '2026-11-03 10:20:00',
      items: [
        {
          product_id: createdProducts[0].id,
          product_name: createdProducts[0].name,
          product_image: createdProducts[0].image_url,
          price: createdProducts[0].price,
          quantity: 1,
          total: createdProducts[0].price
        }
      ]
    }
  ];

  for (const o of sampleOrders) {
    const oRes = await db.run(
      `INSERT INTO orders (
        order_code, user_id, customer_name, customer_phone, customer_address,
        customer_note, payment_method, payment_status, shipping_status,
        subtotal, shipping_fee, total_amount, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.order_code, o.user_id, o.customer_name, o.customer_phone, o.customer_address,
        o.customer_note, o.payment_method, o.payment_status, o.shipping_status,
        o.subtotal, o.shipping_fee, o.total_amount, o.created_at
      ]
    );

    for (const item of o.items) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [oRes.lastInsertRowid, item.product_id, item.product_name, item.product_image, item.price, item.quantity, item.total]
      );
    }
  }

  console.log('✅ Soopi database seeding completed successfully!');
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

