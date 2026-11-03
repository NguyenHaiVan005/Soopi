# ========================================================
# Script Tự Động Triển Khai Soopi Lên Cloudflare Pages & D1
# ========================================================

Write-Host "🚀 BẮT ĐẦU QUY TRÌNH TRIỂN KHAI SOOPI LÊN CLOUDFLARE..." -ForegroundColor Cyan

# 1. Kiểm tra trạng thái xác thực Wrangler
Write-Host "`n[1/5] Kiểm tra đăng nhập tài khoản Cloudflare..." -ForegroundColor Yellow
$authCheck = npx wrangler whoami 2>&1
if ($authCheck -match "You are not authenticated") {
    Write-Host "⚠️ Bạn chưa đăng nhập Cloudflare trên máy tính này." -ForegroundColor Red
    Write-Host "👉 Đang mở trình duyệt để bạn đăng nhập Cloudflare..." -ForegroundColor Yellow
    npx wrangler login
} else {
    Write-Host "✅ Đã xác thực tài khoản Cloudflare thành công!" -ForegroundColor Green
}

# 2. Build Frontend
Write-Host "`n[2/5] Đang build tối ưu hóa Frontend Vite..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Quá trình build thất bại. Vui lòng kiểm tra lỗi bên trên." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build Frontend thành công vào thư mục dist/" -ForegroundColor Green

# 3. Hướng dẫn tạo Database D1 nếu chưa có
Write-Host "`n[3/5] Khởi tạo Database Cloudflare D1..." -ForegroundColor Yellow
Write-Host "Nếu bạn chưa tạo database 'soopi-db', chạy lệnh: npx wrangler d1 create soopi-db" -ForegroundColor Gray

# 4. Triển khai lên Cloudflare Pages
Write-Host "`n[4/5] Đang triển khai toàn bộ ứng dụng lên Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy dist --project-name=soopi

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "🎉 CHÚC MỪNG! SOOPI ĐÃ ĐƯỢC DEPLOY THÀNH CÔNG LÊN CLOUDFLARE!" -ForegroundColor Green
    Write-Host "========================================================`n" -ForegroundColor Green
    Write-Host "📌 BƯỚC CUỐI CÙNG: LIÊN KẾT DATABASE D1 TRÊN CLOUDFLARE DASHBOARD:" -ForegroundColor Cyan
    Write-Host " 1. Vào https://dash.cloudflare.com/ -> Workers & Pages -> chọn dự án 'soopi'" -ForegroundColor White
    Write-Host " 2. Vào Settings -> Functions -> D1 database bindings -> click Add binding" -ForegroundColor White
    Write-Host " 3. Đặt Variable name là 'DB' và chọn database 'soopi-db' của bạn" -ForegroundColor White
    Write-Host " 4. Để nạp dữ liệu mẫu ban đầu vào D1, chạy lệnh:" -ForegroundColor White
    Write-Host "    npm run cf:d1-seed" -ForegroundColor Yellow
}

