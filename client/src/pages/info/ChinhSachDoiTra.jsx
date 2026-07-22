import { Link } from 'react-router-dom';
import InfoPageLayout from '../../components/InfoPageLayout';
import { useSiteSettings } from '../../hooks/useSiteSettings';

function ChinhSachDoiTra() {
  const { settings } = useSiteSettings();
  return (
    <InfoPageLayout title="Chính Sách Đổi Trả">
      <div className="bg-white p-4 p-md-5 rounded-4 border info-content">
        <h2>1. Thời hạn đổi trả</h2>
        <p>
          Điện Máy NK áp dụng chính sách &quot;Lỗi là đổi mới&quot; trong vòng <strong>35 ngày</strong> kể từ ngày nhận
          hàng đối với lỗi phát sinh từ nhà sản xuất, giúp khách hàng an tâm hơn khi mua sắm.
        </p>

        <h2>2. Điều kiện đổi trả</h2>
        <ul>
          <li>Sản phẩm còn trong thời hạn 35 ngày kể từ ngày mua/nhận hàng.</li>
          <li>Sản phẩm bị lỗi kỹ thuật do nhà sản xuất, không phải do người dùng gây ra.</li>
          <li>Còn đầy đủ hộp, phụ kiện, quà tặng kèm theo (nếu có) và hóa đơn mua hàng.</li>
          <li>Sản phẩm không thuộc danh mục hàng hóa đặc thù không áp dụng đổi trả (ví dụ: sản phẩm đã kích hoạt phần mềm, sản phẩm khuyến mãi có ghi chú riêng).</li>
        </ul>

        <h2>3. Các hình thức xử lý</h2>
        <ul>
          <li><strong>Đổi mới:</strong> Đổi sang sản phẩm cùng loại nếu lỗi do nhà sản xuất và còn hàng trong kho.</li>
          <li><strong>Sửa chữa:</strong> Trong trường hợp không thể đổi mới ngay, sản phẩm sẽ được chuyển đến trung tâm bảo hành để sửa chữa miễn phí.</li>
          <li><strong>Hoàn tiền:</strong> Áp dụng trong một số trường hợp đặc biệt theo thỏa thuận giữa hai bên, thường đối với đơn hàng đặt trước hoặc lỗi giao sai sản phẩm.</li>
        </ul>

        <h2>4. Quy trình đổi trả</h2>
        <ul>
          <li><strong>Bước 1:</strong> Liên hệ hotline <strong>{settings.hotline}</strong> hoặc trang <Link to="/lien-he">Liên hệ</Link> để thông báo tình trạng sản phẩm.</li>
          <li><strong>Bước 2:</strong> Nhân viên tư vấn kiểm tra thông tin đơn hàng và hướng dẫn mang sản phẩm đến cửa hàng hoặc hẹn lịch nhân viên đến kiểm tra tận nơi.</li>
          <li><strong>Bước 3:</strong> Xác nhận lỗi và tiến hành đổi trả/sửa chữa theo hình thức phù hợp.</li>
        </ul>

        <h2>5. Lưu ý</h2>
        <p>
          Chi phí vận chuyển sản phẩm đổi trả (nếu có) sẽ được thỏa thuận cụ thể tùy từng trường hợp. Điện Máy NK khuyến
          khích khách hàng kiểm tra kỹ sản phẩm ngay khi nhận hàng để việc đổi trả (nếu cần) được xử lý nhanh chóng nhất.
        </p>
      </div>
    </InfoPageLayout>
  );
}

export default ChinhSachDoiTra;
