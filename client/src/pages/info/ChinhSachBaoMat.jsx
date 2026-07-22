import { Link } from 'react-router-dom';
import InfoPageLayout from '../../components/InfoPageLayout';

function ChinhSachBaoMat() {
  return (
    <InfoPageLayout title="Chính Sách Bảo Mật">
      <div className="bg-white p-4 p-md-5 rounded-4 border info-content">
        <p className="text-muted small">Cập nhật lần cuối: 18/07/2026</p>

        <h2>1. Thông tin chúng tôi thu thập</h2>
        <ul>
          <li><strong>Thông tin tài khoản:</strong> họ tên, email, số điện thoại, mật khẩu (được mã hóa, không lưu dạng văn bản thuần).</li>
          <li><strong>Thông tin đơn hàng:</strong> địa chỉ giao hàng, số điện thoại liên hệ, lịch sử mua hàng.</li>
          <li><strong>Thông tin kỹ thuật:</strong> địa chỉ IP, loại trình duyệt, dữ liệu truy cập website nhằm cải thiện trải nghiệm sử dụng.</li>
        </ul>

        <h2>2. Mục đích sử dụng thông tin</h2>
        <ul>
          <li>Xử lý đơn hàng, giao hàng và chăm sóc khách hàng.</li>
          <li>Xác thực tài khoản, gửi email đặt lại mật khẩu khi được yêu cầu.</li>
          <li>Gửi thông báo về đơn hàng, chương trình khuyến mãi (chỉ khi bạn đồng ý nhận thông tin).</li>
          <li>Phân tích, cải thiện chất lượng sản phẩm và dịch vụ trên website.</li>
        </ul>

        <h2>3. Bảo mật thông tin</h2>
        <p>
          Mật khẩu tài khoản được mã hóa một chiều (hash) trước khi lưu trữ, không ai kể cả nhân viên Điện Máy NK có
          thể xem được mật khẩu gốc của bạn. Dữ liệu cá nhân được lưu trữ trên hệ thống có kiểm soát truy cập, chỉ
          nhân sự được phân quyền mới có thể truy cập nhằm mục đích xử lý đơn hàng và hỗ trợ khách hàng.
        </p>

        <h2>4. Chia sẻ thông tin với bên thứ ba</h2>
        <p>
          Điện Máy NK không bán, cho thuê thông tin cá nhân của khách hàng cho bên thứ ba vì mục đích thương mại.
          Thông tin giao hàng chỉ được chia sẻ với đơn vị vận chuyển trong phạm vi cần thiết để hoàn tất đơn hàng.
          Chúng tôi có thể cung cấp thông tin khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền theo quy định
          pháp luật hiện hành.
        </p>

        <h2>5. Quyền của khách hàng đối với dữ liệu cá nhân</h2>
        <ul>
          <li>Yêu cầu xem, chỉnh sửa thông tin tài khoản của mình bất kỳ lúc nào.</li>
          <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân liên quan bằng cách liên hệ bộ phận hỗ trợ.</li>
          <li>Từ chối nhận email/thông báo khuyến mãi bất kỳ lúc nào.</li>
        </ul>

        <h2>6. Cookie</h2>
        <p>
          Website sử dụng cookie để ghi nhớ giỏ hàng, phiên đăng nhập và cải thiện trải nghiệm duyệt web. Bạn có thể
          tắt cookie trong cài đặt trình duyệt, tuy nhiên một số chức năng của website có thể không hoạt động đầy đủ.
        </p>

        <p className="mt-4 mb-0">
          <em>
            Mọi thắc mắc về Chính sách bảo mật hoặc yêu cầu liên quan đến dữ liệu cá nhân, vui lòng{' '}
            <Link to="/lien-he">liên hệ với chúng tôi</Link> để được hỗ trợ.
          </em>
        </p>
      </div>
    </InfoPageLayout>
  );
}

export default ChinhSachBaoMat;
