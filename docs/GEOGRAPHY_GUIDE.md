# Hướng dẫn Cập nhật Dữ liệu Địa lý Việt Nam (Cấu trúc 34 Tỉnh mới + Weather Data)

Tài liệu này hướng dẫn cách chạy script crawl dữ liệu và cập nhật cơ sở dữ liệu địa lý theo cấu trúc mới nhất (Sáp nhập 2025: 34 Tỉnh/Thành phố, Phường/Xã trỏ trực tiếp về Tỉnh).

## 1. Tổng quan quy trình
1. **Crawl dữ liệu**: Lấy dữ liệu mới nhất từ nguồn `sapnhap.bando.com.vn`.
2. **Tạo File SQL**: Tự động tạo file migration chứa logic **Truy vết sáp nhập thông minh** để bảo toàn dữ liệu.
3. **Cập nhật Database**: Nạp dữ liệu vào PostgreSQL, dọn dẹp các tỉnh/xã cũ không còn tồn tại.

## 2. Thứ tự thực hiện (QUAN TRỌNG)

Bạn **PHẢI** thực hiện theo đúng thứ tự sau:

1.  **Chạy file Script (`.ts`)**: Để tạo ra file SQL mới nhất.
2.  **Chạy file Migration (`.sql`)**: Để nạp dữ liệu và dọn dẹp DB.

---

## 3. Các bước thực hiện chi tiết

### Bước 1: Chạy Script lấy dữ liệu
Mở terminal tại thư mục `backend` và chạy lệnh:

```bash
npx tsx scripts/generate_geography_sql.ts
```
*Tác dụng: Script sẽ lấy 34 tỉnh, 3321 xã/phường, gán mẫu thời tiết (Weather) và tạo file `20240309_update_geography_v3.sql`.*

### Bước 2: Chạy Migration vào Database
Sau khi file SQL được tạo ra, dùng giao diện (DBeaver/pgAdmin) hoặc lệnh `psql` để thực thi:
```bash
psql -U <username> -d <database_name> -f database/migrations/20240309_update_geography_v3.sql
```

---

## 4. Đặc điểm dữ liệu mới

### Bảng `cities` (Tỉnh/Thành phố)
- **Số lượng:** **34 bản ghi** sạch sau khi dọn dẹp.
- **Trạng thái:** Toàn bộ là `active`.

### Bảng `area` (Phường/Xã)
- **Phân cấp:** Trỏ trực tiếp về `id_city`.
- **Trường `attribute` (Dữ liệu Thời tiết):** Chỉ chứa thông tin khí hậu (theo mẫu `exampleJSON.md`) gồm:
  - `climate_type`, `average_temperature`, `rainy_season`, `best_travel_months`, `weather_notes`.
- **Trường `origin` (Lịch sử):** Lưu trữ thông tin các xã cũ đã sáp nhập tạo thành xã này.
- **Trường `area_type`:** Phân loại phường, xã, thị trấn.

---

## 5. Logic Di trú Dữ liệu Thông minh (Smart Migration)

Để đảm bảo các dữ liệu hiện có (Tour, Khách sạn, Nhà cung cấp - Provider, Điểm POI) không bị mất hoặc báo lỗi khóa ngoại khi xóa các tỉnh/xã cũ, script áp dụng logic 3 lớp:

1.  **Khớp tên (Fuzzy Match):** Tự động chuyển dữ liệu sang xã mới nếu trùng tên (đã bỏ tiền tố hành chính).
2.  **Truy vết nguồn gốc (Origin Tracing):** Nếu không trùng tên, script sẽ quét cột `origin`. Nếu xã cũ nằm trong lịch sử sáp nhập của xã mới, dữ liệu sẽ được di dời về xã mới đó.
3.  **Hạ cánh an toàn (Safe Fallback):** Nếu xã đó biến mất hoàn toàn, dữ liệu được chuyển về xã trung tâm của Tỉnh tương ứng để tránh lỗi hệ thống.

---

## 6. Giải quyết sự cố thường gặp

### Lỗi: "ERROR: update or delete on table area violates foreign key constraint"
Lỗi này đã được xử lý bằng logic **Smart Migration** ở trên. Hãy đảm bảo bạn dùng file SQL mới nhất được tạo ra bởi script.

### Lỗi: "Cannot find module 'url'"
Đảm bảo file `backend/scripts/tsconfig.json` tồn tại để hỗ trợ chạy file `.ts` trực tiếp.

---
**Lưu ý**: Sau khi chạy, hãy kiểm tra số lượng bằng lệnh:
`SELECT count(*) FROM cities;` (Kết quả phải là 34)
`SELECT count(*) FROM area;` (Kết quả phải là 3321)
