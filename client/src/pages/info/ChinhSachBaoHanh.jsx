import { Link } from 'react-router-dom';
import InfoPageLayout from '../../components/InfoPageLayout';
import { useSiteSettings } from '../../hooks/useSiteSettings';

function ChinhSachBaoHanh() {
  const { settings } = useSiteSettings();
  return (
    <InfoPageLayout title="Chính Sách Bảo Hành">
      <div className="bg-white p-4 p-md-5 rounded-4 border info-content">
        <h2>1. Thời gian bảo hành</h2>
        <p>
          Tất cả sản phẩm bán tại Điện Máy NK đều được bảo hành chính hãng theo quy định của nhà sản xuất, thông thường
          từ 12 đến 24 tháng tùy loại sản phẩm và thương hiệu. Thời gian bảo hành cụ thể được ghi rõ trên phiếu bảo
          hành/tem bảo hành đi kèm sản phẩm khi giao hàng.
        </p>

        <h2>2. Điều kiện được bảo hành</h2>
        <ul>
          <li>Sản phẩm còn trong thời hạn bảo hành, tem/phiếu bảo hành còn nguyên vẹn, không bị tẩy xóa hay chỉnh sửa thông tin.</li>
          <li>Lỗi phát sinh do lỗi kỹ thuật của nhà sản xuất trong quá trình sử dụng bình thường.</li>
          <li>Sản phẩm chưa qua sửa chữa, can thiệp bởi đơn vị không được ủy quyền.</li>
        </ul>

        <h2>3. Trường hợp không được bảo hành</h2>
        <ul>
          <li>Sản phẩm hết thời hạn bảo hành theo quy định.</li>
          <li>Hư hỏng do thiên tai, hỏa hoạn, ngập nước, côn trùng, động vật xâm nhập.</li>
          <li>Hư hỏng do sử dụng sai hướng dẫn, tự ý tháo lắp, sửa chữa ở nơi không được ủy quyền.</li>
          <li>Hư hỏng do nguồn điện không ổn định, không đúng thông số kỹ thuật của sản phẩm.</li>
        </ul>

        <h2>4. Quy trình bảo hành</h2>
        <ul>
          <li><strong>Bước 1:</strong> Liên hệ hotline <strong>{settings.hotline}</strong> hoặc mang sản phẩm đến trung tâm bảo hành gần nhất kèm phiếu bảo hành/hóa đơn mua hàng.</li>
          <li><strong>Bước 2:</strong> Nhân viên kỹ thuật kiểm tra, xác nhận tình trạng lỗi và điều kiện bảo hành.</li>
          <li><strong>Bước 3:</strong> Tiến hành sửa chữa/thay thế linh kiện chính hãng hoặc đổi sản phẩm mới nếu thuộc diện lỗi 1 đổi 1 theo chính sách hãng.</li>
          <li><strong>Bước 4:</strong> Bàn giao lại sản phẩm cho khách hàng, thời gian xử lý thông thường từ 3-15 ngày làm việc tùy loại sản phẩm.</li>
        </ul>

        <h2>5. Bảo hành tận nơi</h2>
        <p>
          Với các sản phẩm cồng kềnh như máy lạnh, tủ lạnh, máy giặt, Điện Máy NK hỗ trợ cử kỹ thuật viên đến tận nhà
          kiểm tra và bảo hành trong khu vực nội thành TP.HCM, giúp khách hàng tiết kiệm thời gian di chuyển.
        </p>

        <p className="mt-4 mb-0">
          <em>Mọi thắc mắc về chính sách bảo hành, vui lòng <Link to="/lien-he">liên hệ với chúng tôi</Link> để được hỗ trợ chi tiết.</em>
        </p>
      </div>
    </InfoPageLayout>
  );
}

export default ChinhSachBaoHanh;
