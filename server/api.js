import { Hono } from 'hono';
import { cors } from 'hono/cors';
import bcrypt from 'bcryptjs';
import { createDbAdapter } from './db.js';
import { authMiddleware, requireAuth, requireAdmin, createToken } from './auth.js';

const api = new Hono();

// Enable CORS
api.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helper to get db instance
function getDb(c) {
  return createDbAdapter(c.env);
}

// Global Auth Context Middleware
api.use('*', authMiddleware);

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

// Register
api.post('/auth/register', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const { name, email, password, phone, address } = body;

  if (!name || !email || !password) {
    return c.json({ success: false, message: 'Vui lòng điền họ tên, email và mật khẩu' }, 400);
  }

  const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (existing) {
    return c.json({ success: false, message: 'Email này đã được sử dụng' }, 400);
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const res = await db.run(
    `INSERT INTO users (name, email, password_hash, phone, address, role, status)
     VALUES (?, ?, ?, ?, ?, 'customer', 'active')`,
    [name.trim(), email.toLowerCase().trim(), passwordHash, phone?.trim() || '', address?.trim() || '']
  );

  const newUser = {
    id: res.lastInsertRowid,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || '',
    address: address?.trim() || '',
    role: 'customer',
    status: 'active'
  };

  const token = await createToken({ id: newUser.id, email: newUser.email, role: newUser.role });

  return c.json({
    success: true,
    message: 'Đăng ký tài khoản thành công',
    token,
    user: newUser
  });
});

// Login
api.post('/auth/login', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ success: false, message: 'Vui lòng nhập email và mật khẩu' }, 400);
  }

  const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (!user) {
    return c.json({ success: false, message: 'Email hoặc mật khẩu không chính xác' }, 401);
  }

  if (user.status === 'locked') {
    return c.json({ success: false, message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' }, 403);
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return c.json({ success: false, message: 'Email hoặc mật khẩu không chính xác' }, 401);
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    status: user.status
  };

  const token = await createToken({ id: user.id, email: user.email, role: user.role });

  return c.json({
    success: true,
    message: 'Đăng nhập thành công',
    token,
    user: userData
  });
});

// Get current logged-in user profile
api.get('/auth/me', requireAuth, async (c) => {
  const db = getDb(c);
  const authUser = c.get('user');
  const user = await db.get(
    'SELECT id, name, email, phone, address, role, status, created_at FROM users WHERE id = ?',
    [authUser.id]
  );

  if (!user) {
    return c.json({ success: false, message: 'Không tìm thấy thông tin tài khoản' }, 404);
  }

  return c.json({ success: true, user });
});

// Update Profile
api.put('/auth/profile', requireAuth, async (c) => {
  const db = getDb(c);
  const authUser = c.get('user');
  const body = await c.req.json();
  const { name, phone, address } = body;

  if (!name) {
    return c.json({ success: false, message: 'Họ và tên không được để trống' }, 400);
  }

  await db.run(
    `UPDATE users SET name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [name.trim(), phone?.trim() || '', address?.trim() || '', authUser.id]
  );

  const updatedUser = await db.get(
    'SELECT id, name, email, phone, address, role, status FROM users WHERE id = ?',
    [authUser.id]
  );

  return c.json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    user: updatedUser
  });
});

// ==========================================
// 2. CATEGORIES & BANNERS
// ==========================================

api.get('/categories', async (c) => {
  const db = getDb(c);
  const categories = await db.all(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
    GROUP BY c.id
    ORDER BY c.id ASC
  `);
  return c.json({ success: true, categories });
});

api.get('/banners', async (c) => {
  const db = getDb(c);
  const banners = await db.all('SELECT * FROM banners WHERE is_active = 1 ORDER BY id ASC');
  return c.json({ success: true, banners });
});

// ==========================================
// 3. PRODUCTS (CATALOG & DETAILS)
// ==========================================

api.get('/products', async (c) => {
  const db = getDb(c);
  const query = c.req.query();
  const {
    q,
    category,
    min_price,
    max_price,
    sort,
    featured,
    is_new,
    limit = 50,
    offset = 0
  } = query;

  let sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active'
  `;
  const params = [];

  if (q) {
    sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }

  if (category) {
    sql += ` AND c.slug = ?`;
    params.push(category);
  }

  if (min_price) {
    sql += ` AND p.price >= ?`;
    params.push(Number(min_price));
  }

  if (max_price) {
    sql += ` AND p.price <= ?`;
    params.push(Number(max_price));
  }

  if (featured === '1' || featured === 'true') {
    sql += ` AND p.is_featured = 1`;
  }

  if (is_new === '1' || is_new === 'true') {
    sql += ` AND p.is_new = 1`;
  }

  // Sort order
  if (sort === 'price_asc') {
    sql += ` ORDER BY p.price ASC`;
  } else if (sort === 'price_desc') {
    sql += ` ORDER BY p.price DESC`;
  } else if (sort === 'popular') {
    sql += ` ORDER BY p.sold_count DESC, p.rating DESC`;
  } else {
    sql += ` ORDER BY p.created_at DESC`;
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const products = await db.all(sql, params);
  return c.json({ success: true, products });
});

// Product Detail by ID or Slug
api.get('/products/:idOrSlug', async (c) => {
  const db = getDb(c);
  const idOrSlug = c.req.param('idOrSlug');

  const isNumeric = /^\d+$/.test(idOrSlug);
  let product;

  if (isNumeric) {
    product = await db.get(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = 'active'
    `, [Number(idOrSlug)]);
  } else {
    product = await db.get(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.status = 'active'
    `, [idOrSlug]);
  }

  if (!product) {
    return c.json({ success: false, message: 'Không tìm thấy sản phẩm' }, 404);
  }

  // Related products in same category
  const related = await db.all(`
    SELECT * FROM products
    WHERE category_id = ? AND id != ? AND status = 'active'
    LIMIT 4
  `, [product.category_id, product.id]);

  return c.json({
    success: true,
    product,
    related
  });
});

// ==========================================
// 4. ORDERS & CHECKOUT (COD)
// ==========================================

// Create Order (Checkout)
api.post('/orders', async (c) => {
  const db = getDb(c);
  const authUser = c.get('user');
  const body = await c.req.json();
  const { customer_name, customer_phone, customer_address, customer_note, items, payment_method = 'COD' } = body;

  if (!customer_name || !customer_phone || !customer_address) {
    return c.json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng' }, 400);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, message: 'Giỏ hàng của bạn đang trống' }, 400);
  }

  // Validate items and calculate subtotal
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await db.get('SELECT * FROM products WHERE id = ? AND status = "active"', [item.product_id]);
    if (!product) {
      return c.json({ success: false, message: `Sản phẩm mã #${item.product_id} không còn tồn tại` }, 400);
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    if (product.stock < qty) {
      return c.json({
        success: false,
        message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho, không đủ số lượng bạn đặt`
      }, 400);
    }

    const itemTotal = product.price * qty;
    subtotal += itemTotal;

    verifiedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.image_url,
      price: product.price,
      quantity: qty,
      total: itemTotal,
      current_stock: product.stock,
      sold_count: product.sold_count || 0
    });
  }

  const shippingFee = 0; // Free ship promotional
  const totalAmount = subtotal + shippingFee;

  // Generate unique order code
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `SP-${dateStr}-${randomSuffix}`;

  // Insert Order
  const orderRes = await db.run(`
    INSERT INTO orders (
      order_code, user_id, customer_name, customer_phone, customer_address,
      customer_note, payment_method, payment_status, shipping_status,
      subtotal, shipping_fee, total_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'unpaid', 'pending', ?, ?, ?)
  `, [
    orderCode,
    authUser ? authUser.id : null,
    customer_name.trim(),
    customer_phone.trim(),
    customer_address.trim(),
    customer_note?.trim() || '',
    payment_method,
    subtotal,
    shippingFee,
    totalAmount
  ]);

  const orderId = orderRes.lastInsertRowid;

  // Insert items and decrease stock
  for (const item of verifiedItems) {
    await db.run(`
      INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [orderId, item.product_id, item.product_name, item.product_image, item.price, item.quantity, item.total]);

    // Update stock and sold_count
    await db.run(`
      UPDATE products
      SET stock = stock - ?, sold_count = sold_count + ?
      WHERE id = ?
    `, [item.quantity, item.quantity, item.product_id]);
  }

  return c.json({
    success: true,
    message: 'Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.',
    order: {
      id: orderId,
      order_code: orderCode,
      total_amount: totalAmount,
      shipping_status: 'pending',
      payment_method
    }
  });
});

// Customer's own orders
api.get('/orders/my-orders', requireAuth, async (c) => {
  const db = getDb(c);
  const authUser = c.get('user');

  const orders = await db.all(`
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `, [authUser.id]);

  for (const order of orders) {
    order.items = await db.all(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [order.id]);
  }

  return c.json({ success: true, orders });
});

// Track order by code (public search)
api.get('/orders/track/:code', async (c) => {
  const db = getDb(c);
  const code = c.req.param('code');

  const order = await db.get(`SELECT * FROM orders WHERE order_code = ?`, [code.trim()]);
  if (!order) {
    return c.json({ success: false, message: 'Không tìm thấy đơn hàng với mã này' }, 404);
  }

  order.items = await db.all(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);

  return c.json({ success: true, order });
});

// Single order detail
api.get('/orders/:id', async (c) => {
  const db = getDb(c);
  const authUser = c.get('user');
  const id = Number(c.req.param('id'));

  const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
  if (!order) {
    return c.json({ success: false, message: 'Đơn hàng không tồn tại' }, 404);
  }

  // If normal customer, ensure it belongs to them
  if (authUser?.role !== 'admin' && order.user_id !== authUser?.id) {
    return c.json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' }, 403);
  }

  order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [id]);

  return c.json({ success: true, order });
});

// ==========================================
// 5. ADMIN MANAGEMENT APIS
// ==========================================

// Admin Dashboard Statistics
api.get('/admin/stats', requireAdmin, async (c) => {
  const db = getDb(c);

  const productCountRes = await db.get('SELECT count(*) as count FROM products WHERE status != "archived"');
  const orderCountRes = await db.get('SELECT count(*) as count FROM orders');
  const customerCountRes = await db.get('SELECT count(*) as count FROM users WHERE role = "customer"');

  const revenueRes = await db.get(`
    SELECT COALESCE(SUM(total_amount), 0) as total_revenue
    FROM orders
    WHERE shipping_status != 'cancelled'
  `);

  const statusBreakdown = await db.all(`
    SELECT shipping_status, count(*) as count
    FROM orders
    GROUP BY shipping_status
  `);

  const recentOrders = await db.all(`
    SELECT * FROM orders
    ORDER BY created_at DESC
    LIMIT 6
  `);

  for (const o of recentOrders) {
    o.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
  }

  return c.json({
    success: true,
    stats: {
      total_products: productCountRes?.count || 0,
      total_orders: orderCountRes?.count || 0,
      total_customers: customerCountRes?.count || 0,
      total_revenue: revenueRes?.total_revenue || 0,
      status_breakdown: statusBreakdown,
      recent_orders: recentOrders
    }
  });
});

// Admin Products List
api.get('/admin/products', requireAdmin, async (c) => {
  const db = getDb(c);
  const products = await db.all(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status != 'archived'
    ORDER BY p.id DESC
  `);
  return c.json({ success: true, products });
});

// Admin Create Product
api.post('/admin/products', requireAdmin, async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const {
    name,
    category_id,
    price,
    original_price,
    stock,
    image_url,
    images_json,
    description,
    is_featured = 0,
    is_new = 1
  } = body;

  if (!name || !price || !image_url) {
    return c.json({ success: false, message: 'Vui lòng nhập tên sản phẩm, giá và hình ảnh' }, 400);
  }

  // Create slug from name
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

  const res = await db.run(`
    INSERT INTO products (
      category_id, name, slug, price, original_price, stock, sold_count,
      rating, reviews_count, image_url, images_json, description,
      is_featured, is_new, status
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 5.0, 0, ?, ?, ?, ?, ?, 'active')
  `, [
    category_id ? Number(category_id) : null,
    name.trim(),
    slug,
    Number(price),
    original_price ? Number(original_price) : null,
    stock !== undefined ? Number(stock) : 0,
    image_url.trim(),
    images_json || JSON.stringify([image_url.trim()]),
    description?.trim() || '',
    is_featured ? 1 : 0,
    is_new ? 1 : 0
  ]);

  return c.json({
    success: true,
    message: 'Thêm sản phẩm mới thành công',
    product_id: res.lastInsertRowid
  });
});

// Admin Update Product
api.put('/admin/products/:id', requireAdmin, async (c) => {
  const db = getDb(c);
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const {
    name,
    category_id,
    price,
    original_price,
    stock,
    image_url,
    images_json,
    description,
    is_featured,
    is_new,
    status
  } = body;

  const existing = await db.get('SELECT id FROM products WHERE id = ?', [id]);
  if (!existing) {
    return c.json({ success: false, message: 'Sản phẩm không tồn tại' }, 404);
  }

  await db.run(`
    UPDATE products
    SET name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        price = COALESCE(?, price),
        original_price = ?,
        stock = COALESCE(?, stock),
        image_url = COALESCE(?, image_url),
        images_json = COALESCE(?, images_json),
        description = COALESCE(?, description),
        is_featured = COALESCE(?, is_featured),
        is_new = COALESCE(?, is_new),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    name ? name.trim() : null,
    category_id !== undefined ? Number(category_id) : null,
    price !== undefined ? Number(price) : null,
    original_price !== undefined ? Number(original_price) : null,
    stock !== undefined ? Number(stock) : null,
    image_url ? image_url.trim() : null,
    images_json || null,
    description !== undefined ? description.trim() : null,
    is_featured !== undefined ? (is_featured ? 1 : 0) : null,
    is_new !== undefined ? (is_new ? 1 : 0) : null,
    status || null,
    id
  ]);

  return c.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
});

// Admin Delete (Soft delete/archive) Product
api.delete('/admin/products/:id', requireAdmin, async (c) => {
  const db = getDb(c);
  const id = Number(c.req.param('id'));

  await db.run('UPDATE products SET status = "archived", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  return c.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
});

// Admin Orders List
api.get('/admin/orders', requireAdmin, async (c) => {
  const db = getDb(c);
  const query = c.req.query();
  const { status, q } = query;

  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status && status !== 'all') {
    sql += ' AND shipping_status = ?';
    params.push(status);
  }

  if (q) {
    sql += ' AND (order_code LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  sql += ' ORDER BY created_at DESC';

  const orders = await db.all(sql, params);

  for (const o of orders) {
    o.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
  }

  return c.json({ success: true, orders });
});

// Admin Update Order Status
api.patch('/admin/orders/:id/status', requireAdmin, async (c) => {
  const db = getDb(c);
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const { shipping_status, payment_status } = body;

  const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
  if (shipping_status && !validStatuses.includes(shipping_status)) {
    return c.json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' }, 400);
  }

  await db.run(`
    UPDATE orders
    SET shipping_status = COALESCE(?, shipping_status),
        payment_status = COALESCE(?, payment_status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [shipping_status || null, payment_status || null, id]);

  return c.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công' });
});

// Admin Customers List
api.get('/admin/customers', requireAdmin, async (c) => {
  const db = getDb(c);
  const customers = await db.all(`
    SELECT u.id, u.name, u.email, u.phone, u.address, u.role, u.status, u.created_at,
           COUNT(o.id) as order_count,
           COALESCE(SUM(CASE WHEN o.shipping_status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);

  return c.json({ success: true, customers });
});

// Admin Customer Order History
api.get('/admin/customers/:id/orders', requireAdmin, async (c) => {
  const db = getDb(c);
  const userId = Number(c.req.param('id'));

  const orders = await db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
  for (const o of orders) {
    o.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
  }

  return c.json({ success: true, orders });
});

// Admin Toggle Lock/Unlock Customer
api.patch('/admin/customers/:id/toggle-status', requireAdmin, async (c) => {
  const db = getDb(c);
  const id = Number(c.req.param('id'));

  const customer = await db.get('SELECT id, status, role FROM users WHERE id = ?', [id]);
  if (!customer) {
    return c.json({ success: false, message: 'Khách hàng không tồn tại' }, 404);
  }

  if (customer.role === 'admin') {
    return c.json({ success: false, message: 'Không thể khóa tài khoản quản trị' }, 400);
  }

  const newStatus = customer.status === 'active' ? 'locked' : 'active';
  await db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);

  return c.json({
    success: true,
    message: newStatus === 'locked' ? 'Đã khóa tài khoản khách hàng' : 'Đã mở khóa tài khoản khách hàng',
    status: newStatus
  });
});

// ==========================================
// 8. AI CHATBOT (RAG - Retrieval Augmented Generation)
// ==========================================

// POST /chat - Chatbot AI tư vấn mua hàng
api.post('/chat', async (c) => {
  const env = c.env;
  const body = await c.req.json();
  const userMessage = body?.message?.trim();

  if (!userMessage) {
    return c.json({ success: false, message: 'Thiếu nội dung tin nhắn' }, 400);
  }

  // Nếu không có AI binding (local dev), trả về mock
  if (!env.AI) {
    return c.json({
      success: true,
      reply: 'Chatbot AI chỉ hoạt động trên Cloudflare (không hỗ trợ local dev). Hãy deploy lên soopi.pages.dev để dùng.',
      products: [],
      mode: 'mock',
    });
  }

  try {
    // Bước 1: Tìm sản phẩm liên quan bằng Vectorize (RAG)
    let relevantProducts = [];
    if (env.VECTORIZE) {
      try {
        const embedResult = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: userMessage });
        const queryEmbedding = embedResult?.data?.[0] || embedResult;

        const matches = await env.VECTORIZE.query(queryEmbedding, {
          topK: 4,
          returnMetadata: 'all',
        });

        if (matches?.matches?.length > 0) {
          const db = getDb(c);
          const ids = matches.matches.map(m => Number(m.id));
          const placeholders = ids.map(() => '?').join(',');
          relevantProducts = await db.all(
            `SELECT p.id, p.name, p.price, p.original_price, p.rating, p.sold_count, p.stock,
                    p.description, c.name as category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id IN (${placeholders}) AND p.status = 'active'`,
            ids
          );
          // Sắp xếp theo score
          const scoreMap = {};
          matches.matches.forEach(m => { scoreMap[String(m.id)] = m.score; });
          relevantProducts.sort((a, b) => (scoreMap[String(b.id)] || 0) - (scoreMap[String(a.id)] || 0));
        }
      } catch (_) {
        // Bỏ qua lỗi Vectorize, vẫn tiếp tục chat
      }
    }

    // Bước 2: Xây dựng context sản phẩm cho LLM
    const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
    const productContext = relevantProducts.length > 0
      ? relevantProducts.map((p, i) =>
          `${i + 1}. ${p.name} (${p.category_name}) - Giá: ${formatPrice(p.price)}${p.original_price > p.price ? ` (giảm từ ${formatPrice(p.original_price)})` : ''} - Đánh giá: ${p.rating}/5 - Đã bán: ${p.sold_count} - Còn ${p.stock} sản phẩm`
        ).join('\n')
      : 'Không tìm thấy sản phẩm liên quan.';

    // Bước 3: Gọi LLM (Llama 3.1)
    const systemPrompt = `Bạn là trợ lý mua sắm AI của Soopi - sàn thương mại điện tử Việt Nam.
Nhiệm vụ: Tư vấn mua hàng thân thiện, ngắn gọn, hữu ích bằng tiếng Việt.
Quy tắc:
- Trả lời ngắn gọn, tối đa 3-4 câu
- Đề xuất sản phẩm cụ thể nếu có trong danh sách
- Nếu không có sản phẩm phù hợp, hướng dẫn khách tìm kiếm hoặc liên hệ hỗ trợ
- Luôn thân thiện, xưng hô "mình/bạn"
- Không bịa đặt thông tin sản phẩm ngoài danh sách được cung cấp

Sản phẩm liên quan đến câu hỏi của khách:
${productContext}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const llmResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages });
    const reply = llmResult?.response || llmResult?.result?.response || 'Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể hỏi lại không?';

    return c.json({
      success: true,
      reply,
      products: relevantProducts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        original_price: p.original_price,
        rating: p.rating,
        category_name: p.category_name,
      })),
      mode: 'ai',
    });

  } catch (err) {
    return c.json({
      success: true,
      reply: 'Xin lỗi, mình đang gặp sự cố kỹ thuật. Bạn thử lại sau nhé! 🙏',
      products: [],
      mode: 'error',
      error: err.message,
    });
  }
});

// ==========================================
// 9. VECTORIZE - AI SEMANTIC SEARCH
// ==========================================

// POST /sync-vectors - Đồng bộ tất cả sản phẩm vào Cloudflare Vectorize
api.post('/sync-vectors', requireAdmin, async (c) => {
  const env = c.env;

  // Kiểm tra bindings có sẵn không (chỉ chạy trên Cloudflare, không phải local)
  if (!env.AI || !env.VECTORIZE) {
    return c.json({
      success: false,
      message: 'Workers AI và Vectorize chỉ khả dụng trên Cloudflare (không hỗ trợ local dev)',
    }, 503);
  }

  const db = getDb(c);

  // Lấy tất cả sản phẩm đang hoạt động
  const products = await db.all(
    `SELECT p.id, p.name, p.description, p.price, p.original_price, p.stock,
            p.rating, p.sold_count, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.status = 'active'`
  );

  if (!products || products.length === 0) {
    return c.json({ success: false, message: 'Không có sản phẩm nào để đồng bộ' }, 404);
  }

  const vectors = [];
  const errors = [];

  for (const product of products) {
    try {
      // Tạo text đại diện cho sản phẩm
      const text = [
        product.name,
        product.category_name || '',
        product.description || '',
      ].filter(Boolean).join('. ');

      // Gọi Workers AI để tạo embedding
      const result = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text });
      const embedding = result?.data?.[0] || result;

      if (!Array.isArray(embedding) || embedding.length === 0) {
        errors.push({ id: product.id, name: product.name, error: 'Embedding trống' });
        continue;
      }

      vectors.push({
        id: String(product.id),
        values: embedding,
        metadata: {
          name: product.name,
          category: product.category_name || '',
          price: product.price,
          original_price: product.original_price || product.price,
          rating: product.rating || 0,
          sold_count: product.sold_count || 0,
        },
      });
    } catch (err) {
      errors.push({ id: product.id, name: product.name, error: err.message });
    }
  }

  // Upsert vectors vào Cloudflare Vectorize theo batch
  let totalIndexed = 0;
  const batchSize = 20;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await env.VECTORIZE.upsert(batch);
    totalIndexed += batch.length;
  }

  return c.json({
    ok: true,
    message: `Đã đồng bộ dữ liệu vào Cloudflare Vectorize thành công!`,
    total_indexed: totalIndexed,
    products_count: products.length,
    errors_count: errors.length,
    errors: errors.length > 0 ? errors : undefined,
    embedding_model: '@cf/baai/bge-large-en-v1.5',
  });
});

// GET /search?q=... - Tìm kiếm ngữ nghĩa (Semantic Search) bằng Vectorize
api.get('/search', async (c) => {
  const query = c.req.query('q')?.trim();
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 20);

  if (!query) {
    return c.json({ success: false, message: 'Thiếu từ khoá tìm kiếm (q)' }, 400);
  }

  const env = c.env;

  // Nếu không có AI/Vectorize (local dev), fallback sang tìm kiếm thường
  if (!env.AI || !env.VECTORIZE) {
    const db = getDb(c);
    const keyword = `%${query}%`;
    const products = await db.all(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'active'
         AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
       LIMIT ?`,
      [keyword, keyword, keyword, limit]
    );
    return c.json({ success: true, products, mode: 'keyword' });
  }

  try {
    // Tạo embedding cho query
    const result = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: query });
    const queryEmbedding = result?.data?.[0] || result;

    // Tìm kiếm trong Vectorize
    const matches = await env.VECTORIZE.query(queryEmbedding, {
      topK: limit,
      returnMetadata: 'all',
    });

    if (!matches?.matches?.length) {
      return c.json({ success: true, products: [], mode: 'semantic', debug: { matches_count: 0, raw: matches } });
    }

    // Lấy thông tin đầy đủ từ D1 - convert ids to numbers
    const db = getDb(c);
    const ids = matches.matches.map(m => Number(m.id));
    const placeholders = ids.map(() => '?').join(',');
    const products = await db.all(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id IN (${placeholders}) AND p.status = 'active'`,
      ids
    );

    // Sắp xếp theo thứ tự score từ Vectorize
    const scoreMap = {};
    matches.matches.forEach(m => { scoreMap[String(m.id)] = m.score; });
    products.sort((a, b) => (scoreMap[String(b.id)] || 0) - (scoreMap[String(a.id)] || 0));

    return c.json({ success: true, products, mode: 'semantic' });
  } catch (err) {
    // Fallback sang keyword search nếu AI lỗi
    const db = getDb(c);
    const keyword = `%${query}%`;
    const products = await db.all(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'active'
         AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
       LIMIT ?`,
      [keyword, keyword, keyword, limit]
    );
    return c.json({ success: true, products, mode: 'keyword-fallback', error: err.message });
  }
});

export default api;


