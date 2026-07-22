import { Link } from 'react-router-dom';
import { formatMoney } from '../utils/format';
import { resolveImageUrl, onImgError } from '../utils/resolveImageUrl';
import { productUrl } from '../utils/productUrl';
import { addItem } from '../utils/cart';
import { showToast } from '../utils/toast';
import { toggleCompare } from '../utils/compare';
import { useCompareIds } from '../hooks/useCompareCount';
import { MAX_COMPARE } from '../utils/compare';

function ProductCard({ product }) {
  const compareIds = useCompareIds();
  const inCompare = compareIds.includes(Number(product.id));

  function handleAddToCart(e) {
    e.preventDefault();
    addItem(product, 1);
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  }

  function handleToggleCompare(e) {
    e.preventDefault();
    const result = toggleCompare(product.id);
    if (result.limitReached) {
      showToast(`Chỉ có thể so sánh tối đa ${MAX_COMPARE} sản phẩm`);
      return;
    }
    showToast(result.added ? `Đã thêm "${product.name}" vào so sánh` : `Đã bỏ "${product.name}" khỏi so sánh`);
  }

  return (
    <div className="product-card bg-white border rounded-3 p-0">
      {product.discount > 0 && <span className="badge-discount">-{product.discount}%</span>}
      <div className="product-img">
        <Link to={productUrl(product)}>
          <img src={resolveImageUrl(product.image)} alt={product.name} onError={onImgError} />
        </Link>
      </div>
      <div className="product-info p-3">
        <span className="product-brand text-muted small">{product.brand}</span>
        <h5 className="product-title text-truncate-2 fs-6">
          <Link to={productUrl(product)}>{product.name}</Link>
        </h5>
        <div className="product-price mb-3">
          <span className="current-price text-danger fw-bold">{formatMoney(product.price)}</span>
          {product.discount > 0 && <span className="old-price">{formatMoney(product.oldPrice)}</span>}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary w-100 fw-bold add-to-cart-btn btn-sm" onClick={handleAddToCart}>
            <i className="bi bi-cart-plus"></i> Thêm vào giỏ
          </button>
          <button
            type="button"
            className={`btn btn-sm ${inCompare ? 'btn-warning' : 'btn-outline-secondary'}`}
            title="So sánh sản phẩm"
            onClick={handleToggleCompare}
          >
            <i className="bi bi-bar-chart-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
