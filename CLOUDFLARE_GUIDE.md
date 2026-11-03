# Hướng Dẫn Triển Khai Soopi Lên Cloudflare

Dự án **Soopi** được thiết kế theo kiến trúc chuẩn **Cloudflare Pages + Functions + Cloudflare D1 (SQLite Edge Database)**. Kiến trúc này giúp ứng dụng đạt tốc độ tải trang cực nhanh trên toàn cầu (Global Edge Network), chịu tải hàng triệu người dùng mà chi phí vận hành hoàn toàn nằm trong gói miễn phí của Cloudflare.

---

## 🚀 Cách 1: Triển Khai Nhanh Bằng Lệnh (Khuyên Dùng)

Chúng tôi đã thiết lập sẵn các lệnh NPM ngắn gọn trong `package.json` và script tự động `deploy-cloudflare.ps1`.

### Bước 1: Đăng nhập Cloudflare
Chạy lệnh sau trên terminal để mở trình duyệt đăng nhập:
```powershell
npm run cf:login
```

### Bước 2: Tạo Cơ Sở Dữ Liệu D1
```powershell
npm run cf:d1-create
```
Lệnh sẽ in ra thông tin cấu hình tương tự như sau:
```toml
[[d1_databases]]
binding = "DB"
database_name = "soopi-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
👉 Hãy mở file [wrangler.toml](file:///d:/AI/Project/Soopi/wrangler.toml) và thay `database_id` của bạn vào dòng `database_id`.

### Bước 3: Nạp Bảng & Dữ Liệu Mẫu Lên Cloudflare D1
Chạy lần lượt 2 lệnh sau:
```powershell
# 1. Tạo các bảng cơ sở dữ liệu trên Cloudflare
npm run cf:d1-init

# 2. Nạp toàn bộ 14+ sản phẩm, danh mục, banner và tài khoản Admin lên Cloudflare
npm run cf:d1-seed
```

### Bước 4: Build & Deploy Lên Cloudflare Pages
```powershell
# Build mã nguồn
npm run build

# Deploy lên Cloudflare Pages
npm run cf:deploy
```
*(Hoặc bạn có thể chạy file `./deploy-cloudflare.ps1` để tự động chạy các bước).*

### Bước 5: Kích Hoạt D1 Binding Trên Cloudflare Dashboard
1. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages**.
2. Chọn dự án **soopi**.
3. Vào **Settings** ➔ **Functions** ➔ tìm mục **D1 database bindings** ➔ click **Add binding**:
   - Variable name: `DB`
   - D1 database: Chọn `soopi-db`
4. Nhấn **Save**.

Website Soopi của bạn lúc này sẽ chính thức hoạt động tại địa chỉ:
`https://soopi.pages.dev`

---

## 🌐 Cách 2: Triển Khai Tự Động Qua Git / GitHub

Nếu bạn đã đẩy mã nguồn lên GitHub:
1. Đẩy code lên GitHub:
   ```powershell
   git add .
   git commit -m "Complete Soopi E-commerce for Cloudflare"
   git push origin main
   ```
2. Vào [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
3. Chọn repository `Soopi` của bạn.
4. Cấu hình Build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Nhấn **Save and Deploy**.
6. Vào mục **Settings** ➔ **Functions** ➔ gán D1 database binding `DB` tới `soopi-db`.
Mỗi khi bạn commit code mới, Cloudflare Pages sẽ tự động build và cập nhật website tức thì!
