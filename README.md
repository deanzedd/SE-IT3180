# Phần mềm Quản lý chung cư BlueMoon

Giải pháp phần mềm toàn diện giúp Ban quản lý chung cư tối ưu hóa quy trình vận hành, từ quản lý thông tin cư dân đến tự động hóa nghiệp vụ thu phí dịch vụ.
 
## 🌟 Tính năng & Nghiệp vụ
 
Hệ thống được thiết kế dựa trên các nghiệp vụ thực tế tại chung cư, bao gồm:

### 1. Quản lý Cư dân
- **Quản lý Hộ khẩu**: Lưu trữ thông tin căn hộ, diện tích, số lượng xe (ô tô, xe máy) để làm cơ sở tính phí.
- **Quản lý Nhân khẩu**: Theo dõi thông tin chi tiết cư dân, quan hệ với chủ hộ.
- **Biến động dân cư**: Quản lý tạm trú, tạm vắng, chuyển đến, chuyển đi.
 
### 2. Quản lý Tài chính & Thu phí
- **Cấu hình Khoản thu (Fees)**: Hỗ trợ đa dạng các loại phí:
  - *Phí bắt buộc tự động*: Tính theo công thức (VD: Phí quản lý theo diện tích, phí gửi xe theo số lượng).
  - *Phí bắt buộc nhập tay*: Nhập chỉ số hàng tháng (VD: Tiền điện, nước).
  - *Phí tự nguyện*: Các khoản đóng góp, ủng hộ.
- **Quản lý Đợt thu (Payment Sessions)**:
  - Tạo đợt thu hàng tháng (VD: Thu phí tháng 1/2026).
  - Hệ thống **tự động tính toán** tổng tiền phải đóng cho từng hộ dựa trên dữ liệu hộ khẩu và cấu hình phí.
- **Ghi nhận Thanh toán (Transactions)**:
  - Ghi nhận lịch sử đóng tiền (Tiền mặt/Chuyển khoản).
  - Cập nhật trạng thái thanh toán theo thời gian thực: *Chưa đóng* -> *Đóng một phần* -> *Hoàn thành*.
 
### 3. Phân quyền & Bảo mật
Hệ thống phân quyền chặt chẽ theo vai trò (RBAC):
- **Admin**: Toàn quyền hệ thống, quản lý tài khoản người dùng.
- **Manager (Cán bộ quản lý)**: Chuyên trách quản lý thông tin cư dân, hộ khẩu.
- **Accountant (Kế toán)**: Chuyên trách quản lý các khoản thu, đợt thu và xác nhận thanh toán.
 
### 4. Thống kê và Báo cáo
- **Dashboard**: Biểu đồ thống kê tổng quan về dân cư và tình hình tài chính.
- **Tìm kiếm và Lọc kết quả**: Hỗ trợ tìm kiếm nhanh và lọc nâng cao theo nhiều tiêu chí.
- **Xuất Excel**: Xuất dữ liệu danh sách cư dân, hộ khẩu, giao dịch ra file Excel để lưu trữ và báo cáo.


## 🛠 Công nghệ sử dụng

- **Frontend**: React (Vite), Tailwind CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JWT (JSON Web Token).


## 🚀 Hướng dẫn Cài đặt & Sử dụng

### Yêu cầu hệ thống
- **Node.js** (LTS version).
- **MongoDB**: Có thể dùng MongoDB Atlas (Cloud) hoặc MongoDB Community (Local).

### Bước 1: Clone dự án

```powershell
git clone https://github.com/deanzedd/SE-IT3180.git
cd SE-IT3180
```

### Bước 2: Cài đặt Backend

1. Di chuyển vào thư mục backend:

```powershell
cd backend
npm install
```

2. Tạo file .env tại thư mục backend với nội dung:

```env
PORT=5000
MONGO_URI=mongodb+srv://:@cluster0.xxxxx.mongodb.net/quan_ly_chung_cu
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=30d
```

(Thay thế MONGO_URI bằng chuỗi kết nối của bạn)

3. Khởi chạy server:

```powershell
npm start
```

### Bước 3: Khởi tạo Dữ liệu mẫu

Để nhanh chóng có dữ liệu test (Admin, Hộ dân, Đợt thu...), mở một terminal mới tại thư mục backend và chạy:

```powershell
node scripts/seedData.js --clean
```

Tài khoản Admin mặc định:
- Username: admin
- Password: Admin123!

### Bước 4: Cài đặt Frontend

1. Mở terminal mới, di chuyển vào thư mục frontend:

```powershell
cd frontend
npm install
```

2. Khởi chạy ứng dụng:

```powershell
npm run dev
```

3. Truy cập trình duyệt tại địa chỉ: http://localhost:5173.
