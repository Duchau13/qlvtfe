Phần Mềm Quản Lý Kho
Phần mềm quản lý kho là một ứng dụng chuyên dụng được thiết kế để hỗ trợ quản lý hàng hóa, tạo và xác nhận các đơn hàng nhập/xuất kho, đồng thời đảm bảo phân quyền theo khu vực cho người dùng. Phần mềm này phù hợp cho các doanh nghiệp có kho hàng tại nhiều khu vực khác nhau, giúp tối ưu hóa quy trình quản lý và theo dõi hàng hóa.
Mục Lục

Tính Năng Chính
Tài Khoản Mặc Định
Yêu Cầu Hệ Thống
Hướng Dẫn Cài Đặt
Hướng Dẫn Sử Dụng
Lưu Ý Quan Trọng
Liên Hệ Hỗ Trợ

Tính Năng Chính
Phần mềm cung cấp các tính năng sau:

Hệ Thống Đăng Nhập:

Người dùng đăng nhập bằng tài khoản được phân quyền theo khu vực (Hà Nội hoặc TP. Hồ Chí Minh).
Hệ thống đảm bảo an toàn và chỉ cho phép truy cập vào các chức năng tương ứng với khu vực của người dùng.


Quản Lý Hàng Hóa:

Sau khi đăng nhập, người dùng có thể truy cập tab Hàng Hóa để:
Thêm hàng hóa: Nhập thông tin như mã hàng, tên, số lượng, đơn vị tính, và mô tả.
Xóa hàng hóa: Loại bỏ các mặt hàng không còn trong kho.
Sửa hàng hóa: Cập nhật thông tin chi tiết của hàng hóa, ví dụ: thay đổi số lượng hoặc giá trị.


Ví dụ: Thêm một mặt hàng mới với mã SP001, tên Gạo tám, số lượng 100 (kg).


Tạo Đơn Hàng:

Người dùng có thể tạo các đơn hàng nhập kho (Import) hoặc xuất kho (Export) trong tab Đơn Hàng.
Đơn hàng chỉ được tạo cho khu vực tương ứng với tài khoản của người dùng:
Người dùng Hà Nội (HN) chỉ tạo đơn hàng cho kho Hà Nội.
Người dùng TP. Hồ Chí Minh (HCM) chỉ tạo đơn hàng cho kho TP. Hồ Chí Minh.


Ví dụ: Một người dùng HN tạo đơn nhập kho với mã NHAP-HN-001 chứa 50 kg gạo.


Xác Nhận Đơn Hàng:

Các đơn hàng được chuyển đến tab Nhập hoặc Xuất để xác nhận.
Trong tab Nhập, người dùng xác nhận các đơn nhập kho, cập nhật số lượng hàng hóa trong kho.
Trong tab Xuất, người dùng xác nhận các đơn xuất kho, giảm số lượng hàng hóa tương ứng.
Ví dụ: Xác nhận đơn xuất kho XUAT-HN-001 để xuất 20 kg gạo từ kho Hà Nội.



Tài Khoản Mặc Định
Sử dụng các tài khoản sau để đăng nhập vào phần mềm:

Khu vực Hà Nội (HN):
Tài khoản: HN-0
Mật khẩu: 12345678
Khu vực: HN


Khu vực TP. Hồ Chí Minh (HCM):
Tài khoản: HCM-0
Mật khẩu: 12345678
Khu vực: HCM



Lưu ý: Mật khẩu và tài khoản mặc định chỉ nên được sử dụng để thử nghiệm. Liên hệ quản trị viên để tạo tài khoản mới hoặc thay đổi mật khẩu.
Yêu Cầu Hệ Thống
Để chạy phần mềm, máy tính của bạn cần đáp ứng các yêu cầu sau:

Hệ điều hành: Windows, macOS, hoặc Linux.
Node.js: Phiên bản 14.x hoặc cao hơn.
npm: Phiên bản 6.x hoặc cao hơn (thường được cài đặt cùng Node.js).
Trình duyệt web: Google Chrome, Firefox, hoặc Edge (phiên bản mới nhất).
Kết nối internet: Cần thiết để tải các gói phụ thuộc trong lần cài đặt đầu tiên.

Hướng Dẫn Cài Đặt
Làm theo các bước sau để cài đặt và chạy phần mềm:

Cài Đặt Node.js và npm:

Truy cập https://nodejs.org và tải phiên bản LTS (Long-Term Support).
Cài đặt Node.js và kiểm tra cài đặt bằng cách chạy lệnh sau trong terminal:node -v
npm -v


Nếu thấy phiên bản của Node.js và npm, bạn đã sẵn sàng.


Tải Mã Nguồn Phần Mềm:

Tải mã nguồn phần mềm (thư mục dự án) từ kho lưu trữ hoặc sao chép từ nguồn cung cấp.
Giải nén (nếu cần) và mở thư mục dự án trong terminal.


Cài Đặt Các Gói Phụ Thuộc:

Trong terminal, di chuyển đến thư mục dự án và chạy lệnh:npm install


Lệnh này sẽ tải và cài đặt tất cả các thư viện cần thiết. Quá trình có thể mất vài phút tùy thuộc vào tốc độ internet.


Khởi Chạy Phần Mềm:

Sau khi cài đặt xong, chạy lệnh sau để khởi động ứng dụng:npm start


Phần mềm sẽ tự động mở trong trình duyệt mặc định tại địa chỉ http://localhost:3000 (hoặc một cổng khác nếu được cấu hình).



Hướng Dẫn Sử Dụng

Đăng Nhập:

Mở phần mềm trong trình duyệt.
Nhập một trong các tài khoản mặc định (ví dụ: HN-0 / 12345678).
Nhấn Đăng Nhập để vào giao diện chính.


Quản Lý Hàng Hóa:

Chuyển đến tab Hàng Hóa.
Nhấn nút Thêm Hàng Hóa để nhập thông tin mặt hàng mới.
Để chỉnh sửa hoặc xóa, chọn mặt hàng trong danh sách và sử dụng các nút tương ứng.


Tạo Đơn Hàng:

Chuyển đến tab Đơn Hàng.
Chọn loại đơn hàng (Nhập hoặc Xuất) và điền thông tin như mã đơn, mặt hàng, số lượng.
Lưu ý: Mã đơn hàng sẽ tự động gắn khu vực (HN hoặc HCM) dựa trên tài khoản của bạn.


Xác Nhận Đơn Hàng:

Chuyển đến tab Nhập để xem và xác nhận các đơn hàng nhập kho.
Chuyển đến tab Xuất để xem và xác nhận các đơn xuất kho.
Sau khi xác nhận, số lượng hàng hóa trong kho sẽ được cập nhật tự động.



Lưu Ý Ý Quan Trọng

Phân Quyền Khu Vực: Người dùng chỉ có thể thao tác với kho hàng và đơn hàng thuộc khu vực của họ (HN hoặc HCM).
Sao Lưu Dữ Liệu: Đảm bảo sao lưu dữ liệu định kỳ để tránh mất mát thông tin quan trọng.
Kết Nối Internet: Cần kết nối mạng trong lần cài đặt đầu tiên để tải các gói phụ thuộc.
Bảo Mật: Không chia sẻ tài khoản và mật khẩu mặc định. Liên hệ quản trị viên để thay đổi mật khẩu nếu cần.
Lỗi Phổ Biến:
Nếu npm start không chạy, kiểm tra xem cổng mặc định (thường 3000) có đang được sử dụng bởi ứng dụng khác không.
Nếu gặp



