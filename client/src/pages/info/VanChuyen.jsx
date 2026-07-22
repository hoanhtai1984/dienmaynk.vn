import { Link } from 'react-router-dom';
import InfoPageLayout from '../../components/InfoPageLayout';
import { useSiteSettings } from '../../hooks/useSiteSettings';

function VanChuyen() {
  const { settings } = useSiteSettings();
  return (
    <InfoPageLayout title="Chính Sách Vận Chuyển">
      <div className="bg-white p-4 p-md-5 rounded-4 border info-content">
        <h2>1. Khu vực và thời gian giao hàng</h2>
        <ul>
          <li><strong>Nội thành TP.HCM:</strong> Giao hàng nhanh trong vòng 2 giờ đối với đơn hàng đặt trước 18:00.</li>
          <li><strong>Các tỉnh/thành khác:</strong> Thời gian giao hàng dự kiến từ 1-3 ngày làm việc, tùy khu vực.</li>
          <li><strong>Khu vực đặc biệt (vùng sâu, vùng xa, hải đảo):</strong> Thời gian có thể kéo dài hơn, nhân viên sẽ liên hệ báo trước.</li>
        </ul>

        <h2>2. Phí vận chuyển</h2>
        <p>
          Miễn phí vận chuyển cho hầu hết đơn hàng trong nội thành TP.HCM. Đối với các khu vực khác, phí vận chuyển được
          tính dựa trên khoảng cách và trọng lượng/kích thước sản phẩm, sẽ được thông báo cụ thể cho khách hàng trước
          khi xác nhận đơn hàng.
        </p>

        <h2>3. Giao hàng và lắp đặt</h2>
        <ul>
          <li>Đối với các sản phẩm điện lạnh (máy lạnh, máy giặt, tủ lạnh cỡ lớn), Điện Máy NK hỗ trợ vận chuyển và lắp đặt cơ bản tận nơi.</li>
          <li>Nhân viên giao hàng sẽ liên hệ trước để xác nhận thời gian giao hàng phù hợp với khách hàng.</li>
          <li>Khách hàng vui lòng kiểm tra tình trạng bên ngoài sản phẩm trước khi ký nhận hàng.</li>
        </ul>

        <h2>4. Kiểm tra hàng khi nhận</h2>
        <p>
          Khách hàng có quyền yêu cầu kiểm tra sản phẩm (tình trạng bên ngoài, phụ kiện đi kèm) trước khi thanh toán đối
          với hình thức thanh toán khi nhận hàng (COD). Nếu phát hiện sản phẩm không đúng như đặt hàng hoặc bị hư hỏng
          do vận chuyển, vui lòng từ chối nhận hàng và liên hệ ngay hotline <strong>{settings.hotline}</strong>.
        </p>

        <h2>5. Theo dõi đơn hàng</h2>
        <p>
          Sau khi đặt hàng thành công, khách hàng sẽ nhận được thông tin xác nhận đơn hàng. Để tra cứu tình trạng đơn
          hàng, vui lòng liên hệ trực tiếp hotline hoặc trang <Link to="/lien-he">Liên hệ</Link> kèm mã đơn hàng/số điện
          thoại đặt hàng.
        </p>
      </div>
    </InfoPageLayout>
  );
}

export default VanChuyen;
