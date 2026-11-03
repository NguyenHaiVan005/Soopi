# Soopi - Sàn Thương Mại Điện Tử Hiện Đại & Tối Ưu Cho Cloudflare

**Soopi** là nền tảng thương mại điện tử Full-stack toàn diện được phát triển theo tiêu chuẩn công nghệ hiện đại. Dự án được thiết kế với giao diện người dùng đẹp mắt, chuyên nghiệp, phản hồi mượt mà và kiến trúc backend linh hoạt: vừa có thể chạy độc lập ở môi trường phát triển cục bộ (Node.js), vừa sẵn sàng triển khai toàn diện lên mạng lưới **Cloudflare Pages + Functions + Cloudflare D1 (SQLite Edge)**.

---

## 🌟 Tính Năng Nổi Bật

### 1. Dành cho Khách Hàng (Customer Experience)
- **Trang chủ hiện đại**:
  - Banner quảng cáo tự động xoay vòng kèm hiệu ứng gradient thu hút.
  - Phân vùng cam kết: Freeship 0Đ, 100% Chính hãng, Đổi trả 7 ngày, Giao 2H.
  - Danh mục ngành hàng trực quan kèm số lượng sản phẩm.
  - Mục **Sản phẩm nổi bật & Bán chạy** (Flash sale badge, chiết khấu % giảm giá).
  - Mục **Hàng mới về** cập nhật liên tục.
- **Tìm kiếm & Bộ lọc nâng cao**:
  - Tìm kiếm theo tên sản phẩm, thương hiệu hoặc từ khóa.
  - Lọc theo ngành hàng/danh mục linh hoạt.
  - Lọc theo khoảng giá tối thiểu - tối đa (VND).
  - Sắp xếp: Mới nhất, Bán chạy nhất, Giá tăng dần, Giá giảm dần.
- **Chi tiết sản phẩm**:
  - Thư viện hình ảnh sản phẩm chất lượng cao với thumbnail chọn nhanh.
  - Tên, giá bán hiện tại, giá gốc gạch ngang, tỷ lệ giảm giá, mô tả chi tiết.
  - Hiển thị số lượng tồn kho thực tế.
  - Bộ chọn số lượng (tăng/giảm với giới hạn theo tồn kho).
  - Nút **Thêm vào giỏ hàng** và nút **Mua ngay**.
- **Giỏ hàng & Đặt hàng tiện lợi**:
  - Ngăn kéo giỏ hàng (Slide-over Cart Drawer) xem nhanh mọi lúc.
  - Điều chỉnh số lượng trực tiếp trong giỏ, tự động tính tổng tiền.
  - Form đặt hàng nhanh: Điền Họ tên, Số điện thoại, Địa chỉ nhận hàng, Ghi chú.
  - Hỗ trợ phương thức **COD (Thanh toán khi nhận hàng)** và Chuyển khoản QR.
  - Hiệu ứng pháo hoa chúc mừng (confetti) và cấp mã đơn hàng duy nhất `SP-YYYYMMDD-XXXX`.
- **Quản lý tài khoản & Đơn hàng**:
  - Đăng ký và đăng nhập bảo mật bằng JWT và mã hóa bcrypt.
  - Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ giao hàng mặc định).
  - Lịch sử đơn mua: Xem chi tiết các đơn đã đặt, danh sách sản phẩm và tổng tiền.
  - **Tra cứu vận đơn công khai**: Nhập mã đơn để theo dõi tiến độ đơn hàng qua thanh tiến trình trực quan (Chờ xác nhận ➔ Đã xác nhận ➔ Đang vận chuyển ➔ Giao hàng thành công).

### 2. Dành cho Quản Trị Viên (Admin Portal)
- **Dashboard tổng quan**:
  - Thống kê tổng số sản phẩm, tổng số đơn hàng, tổng số khách hàng.
  - Thống kê tổng doanh thu thực tế.
  - Thống kê phân bố đơn hàng theo 5 trạng thái (Chờ xác nhận, Đã xác nhận, Đang giao, Đã giao, Đã hủy).
  - Bảng danh sách các đơn hàng mới nhất cần xử lý.
- **Quản lý sản phẩm**:
  - Xem danh mục sản phẩm kèm tồn kho, đã bán, trạng thái.
  - Thêm mới sản phẩm với modal trực quan (Tên, Danh mục, Giá, Giá gốc, Kho, Link ảnh, Mô tả, Nhãn Hot/Mới).
  - Chỉnh sửa thông tin sản phẩm và cập nhật số lượng kho.
  - Xóa sản phẩm an toàn.
- **Quản lý đơn hàng**:
  - Bộ lọc đơn hàng theo trạng thái: Tất cả, Chờ xác nhận, Đã xác nhận, Đang giao, Đã giao, Đã hủy.
  - Tìm kiếm đơn theo mã đơn hàng hoặc tên/SĐT khách hàng.
  - Xem chi tiết đơn hàng (Danh sách món, địa chỉ, ghi chú người nhận).
  - Cập nhật trạng thái đơn: Xác nhận đơn ➔ Giao hàng ➔ Đã giao & Thu tiền ➔ Hủy đơn.
- **Quản lý khách hàng**:
  - Danh sách toàn bộ khách hàng đã đăng ký.
  - Thống kê số đơn hàng đã đặt và tổng chi tiêu của từng khách hàng.
  - Chức năng **Khóa / Mở khóa** tài khoản khách hàng khi cần thiết.
  - Xem toàn bộ lịch sử các đơn hàng của riêng từng khách hàng.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide React Icons, Canvas Confetti.
- **Backend**: Hono Framework (siêu nhẹ, chuẩn Web Standards, tương thích hoàn hảo Cloudflare Workers & Pages Functions), `@hono/node-server`.
- **Bảo mật**: JWT Authentication (`jose`), Password Hashing (`bcryptjs`).
- **Database**:
  - **Local Development**: Chuẩn SQLite tích hợp sẵn trong Node.js (`node:sqlite`).
  - **Production Edge**: Cloudflare D1 (Serverless Edge SQL Database).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

### 1. Cài đặt các gói thư viện
```bash
npm install
```

### 2. Khởi chạy ứng dụng
Chạy một lệnh duy nhất để khởi động cả Backend API Server và Frontend Vite:
```bash
npm run dev
```

Sau khi chạy lệnh:
- **Giao diện Khách hàng & Quản trị**: Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: Chạy tại [http://localhost:5000](http://localhost:5000)

---

## 🔑 Tài Khoản Thử Nghiệm Sẵn Có (Demo Accounts)

Hệ thống đã tự động khởi tạo dữ liệu mẫu phong phú cùng 2 tài khoản demo:

| Vai trò | Email | Mật khẩu | Chú thích |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@soopi.vn` | `admin123` | Toàn quyền quản trị Dashboard, Sản phẩm, Đơn hàng, Khách hàng |
| **Khách hàng (Customer)** | `khachhang@gmail.com` | `123456` | Có sẵn lịch sử đơn hàng để kiểm tra tính năng |

*(Tại màn hình Đăng nhập của website cũng có sẵn nút bấm 1-click để tự động điền nhanh tài khoản Admin hoặc Khách hàng).*

---

## ☁️ Triển Khai Lên Nền Tảng Cloudflare

Chi tiết toàn bộ các bước thiết lập Cloudflare D1 và triển khai lên Cloudflare Pages Functions được hướng dẫn chi tiết tại file:
👉 **[CLOUDFLARE_GUIDE.md](file:///d:/AI/Project/Soopi/CLOUDFLARE_GUIDE.md)**
