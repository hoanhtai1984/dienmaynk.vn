import { Fragment, useEffect, useState } from 'react';
import {
  listAdminCustomers,
  getAdminCustomer,
  createAdminCustomer,
  setCustomerNeedsAttention,
  getCustomerActivity,
} from '../../api/admin';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/formatDate';
import { exportToExcel } from '../../utils/exportExcel';
import DateRangeFilter from '../../components/DateRangeFilter';
import { resolveDateRange, isWithinRange } from '../../utils/dateRangePresets';

const CUSTOMER_ACTION_LABEL = { UPDATE_PROFILE: 'Cập nhật thông tin', DELETE_ACCOUNT: 'Xóa tài khoản' };

function toDateParam(date) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

const STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const CONTACT_SUBJECT_LABEL = {
  TU_VAN: 'Tư vấn sản phẩm',
  BAO_HANH: 'Bảo hành / Sửa chữa',
  DON_HANG: 'Hỏi về đơn hàng',
  KHAC: 'Khác',
};

const CONTACT_STATUS_LABEL = {
  NEW: 'Chưa xử lý',
  RESOLVED: 'Đã xử lý',
};

const EMPTY_NEW_CUSTOMER = { name: '', email: '', phone: '', password: '' };

function AdminCustomers() {
  const [tab, setTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detailById, setDetailById] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState(EMPTY_NEW_CUSTOMER);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [onlyNeedsHelp, setOnlyNeedsHelp] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [datePreset, setDatePreset] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [minOrders, setMinOrders] = useState('');

  const [activityCustomerFilter, setActivityCustomerFilter] = useState('');
  const [activityDatePreset, setActivityDatePreset] = useState('month');
  const [activityCustomFrom, setActivityCustomFrom] = useState('');
  const [activityCustomTo, setActivityCustomTo] = useState('');
  const [logs, setLogs] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  const visibleCustomers = onlyNeedsHelp ? customers.filter((c) => c.needsHelp) : customers;

  function reload(q) {
    setLoading(true);
    listAdminCustomers(q || undefined)
      .then(setCustomers)
      .finally(() => setLoading(false));
  }

  useEffect(() => reload(), []);

  useEffect(() => {
    if (tab !== 'activity') return;
    setLogsLoading(true);
    const range = resolveDateRange(activityDatePreset, activityCustomFrom, activityCustomTo);
    getCustomerActivity({
      customerId: activityCustomerFilter || undefined,
      from: toDateParam(range?.from),
      to: toDateParam(range?.to),
    })
      .then(setLogs)
      .finally(() => setLogsLoading(false));
  }, [tab, activityCustomerFilter, activityDatePreset, activityCustomFrom, activityCustomTo]);

  function handleExportLogs() {
    if (!logs) return;
    exportToExcel('nhat-ky-khach-hang', [
      {
        name: 'Nhật ký thay đổi',
        rows: logs.map((l) => ({
          'Thời gian': new Date(l.createdAt).toLocaleString('vi-VN'),
          'Khách hàng': l.customerName,
          Email: l.customerEmail,
          'Hành động': CUSTOMER_ACTION_LABEL[l.action] || l.action,
          'Chi tiết': l.detail,
        })),
      },
    ]);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    reload(keyword.trim());
  }

  async function toggleExpand(customer) {
    if (expandedId === customer.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(customer.id);
    if (!detailById[customer.id]) {
      setDetailLoading(true);
      try {
        const detail = await getAdminCustomer(customer.id);
        setDetailById((prev) => ({ ...prev, [customer.id]: detail }));
      } finally {
        setDetailLoading(false);
      }
    }
  }

  async function handleToggleNeedsAttention(customer) {
    await setCustomerNeedsAttention(customer.id, !customer.needsAttention);
    reload(keyword.trim() || undefined);
    const detail = await getAdminCustomer(customer.id);
    setDetailById((prev) => ({ ...prev, [customer.id]: detail }));
  }

  function handleNewCustomerChange(field) {
    return (e) => setNewCustomer((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleCreateCustomer(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await createAdminCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone || undefined,
        password: newCustomer.password,
      });
      setShowNewForm(false);
      setNewCustomer(EMPTY_NEW_CUSTOMER);
      reload(keyword.trim() || undefined);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  }

  function handleDownload() {
    const range = resolveDateRange(datePreset, customFrom, customTo);
    const minOrdersNum = minOrders === '' ? null : Number(minOrders);
    const filtered = visibleCustomers.filter((c) => {
      if (!isWithinRange(c.createdAt, range)) return false;
      if (minOrdersNum !== null && c.orderCount < minOrdersNum) return false;
      return true;
    });

    exportToExcel('khach-hang', [
      {
        name: 'Khách hàng',
        rows: filtered.map((c) => ({
          'Họ và tên': c.name,
          'Email': c.email,
          'Số điện thoại': c.phone || '',
          'Số đơn hàng': c.orderCount,
          'Tổng chi tiêu': c.totalSpent,
          'Cần hỗ trợ': c.needsHelp ? 'Có' : 'Không',
          'Ngày đăng ký': formatDate(c.createdAt),
          'Trạng thái': c.deletedAt ? `Đã xóa (${formatDate(c.deletedAt)})` : 'Hoạt động',
        })),
      },
    ]);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="fw-bold m-0">Khách hàng</h3>
        {tab === 'customers' && (
        <div className="d-flex gap-2 flex-wrap">
          <form className="d-flex gap-2" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: 260 }}
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-sm btn-warning fw-bold">Tìm</button>
          </form>
          <div className="form-check d-flex align-items-center gap-1">
            <input
              type="checkbox"
              className="form-check-input"
              id="onlyNeedsHelp"
              checked={onlyNeedsHelp}
              onChange={(e) => setOnlyNeedsHelp(e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="onlyNeedsHelp">Chỉ hiện cần hỗ trợ</label>
          </div>
          <button type="button" className="btn btn-sm btn-outline-success fw-bold" onClick={() => setShowExportPanel((v) => !v)}>
            <i className="bi bi-file-earmark-excel"></i> Xuất Excel
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-dark fw-bold"
            onClick={() => setShowNewForm((prev) => !prev)}
          >
            <i className="bi bi-person-plus"></i> Thêm khách hàng
          </button>
        </div>
        )}
      </div>

      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button type="button" className={`nav-link ${tab === 'customers' ? 'active' : ''}`} onClick={() => setTab('customers')}>
            Danh sách khách hàng
          </button>
        </li>
        <li className="nav-item">
          <button type="button" className={`nav-link ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
            Nhật ký thay đổi
          </button>
        </li>
      </ul>

      {tab === 'customers' && (
      <>
      {showExportPanel && (
        <div className="bg-white p-4 rounded-3 border mb-4">
          <h6 className="fw-bold mb-3">Bộ lọc xuất Excel</h6>
          <div className="row g-2 align-items-end mb-3">
            <div className="col-auto">
              <DateRangeFilter
                label="Ngày đăng ký"
                preset={datePreset}
                onPresetChange={setDatePreset}
                customFrom={customFrom}
                onCustomFromChange={setCustomFrom}
                customTo={customTo}
                onCustomToChange={setCustomTo}
              />
            </div>
            <div className="col-auto">
              <label className="form-label small fw-bold">Số đơn tối thiểu</label>
              <input
                type="number"
                min="0"
                className="form-control form-control-sm"
                style={{ width: 120 }}
                value={minOrders}
                onChange={(e) => setMinOrders(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-warning fw-bold" onClick={handleDownload}>
                <i className="bi bi-download"></i> Tải về Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewForm && (
        <div className="bg-white p-4 rounded-3 border mb-4">
          <h6 className="fw-bold mb-3">Tạo tài khoản khách hàng mới</h6>
          <form onSubmit={handleCreateCustomer}>
            {createError && <div className="alert alert-danger py-2 small">{createError}</div>}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Họ và tên *</label>
                <input className="form-control" value={newCustomer.name} onChange={handleNewCustomerChange('name')} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Email *</label>
                <input type="email" className="form-control" value={newCustomer.email} onChange={handleNewCustomerChange('email')} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Số điện thoại</label>
                <input className="form-control" value={newCustomer.phone} onChange={handleNewCustomerChange('phone')} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Mật khẩu *</label>
                <input type="password" className="form-control" minLength={6} value={newCustomer.password} onChange={handleNewCustomerChange('password')} required />
              </div>
            </div>
            <button type="submit" className="btn btn-warning fw-bold rounded-pill px-4" disabled={creating}>
              {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3 border">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : visibleCustomers.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {onlyNeedsHelp ? 'Không có khách hàng nào cần hỗ trợ.' : 'Chưa có khách hàng nào đăng ký tài khoản.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th>Khách hàng</th>
                  <th>Ngày đăng ký</th>
                  <th>Số đơn hàng</th>
                  <th>Tổng chi tiêu</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((customer) => {
                  const detail = detailById[customer.id];
                  return (
                  <Fragment key={customer.id}>
                    <tr>
                      <td>
                        <div className="fw-bold">
                          {customer.name}
                          {customer.needsHelp && <span className="badge bg-danger ms-2">Cần hỗ trợ</span>}
                        </div>
                        <div className="text-muted small">{customer.email}</div>
                        {customer.phone && <div className="text-muted small">{customer.phone}</div>}
                      </td>
                      <td>{formatDate(customer.createdAt)}</td>
                      <td>{customer.orderCount}</td>
                      <td className="text-danger fw-bold">{formatMoney(customer.totalSpent)}</td>
                      <td>
                        {customer.deletedAt ? (
                          <span className="badge bg-secondary">Đã xóa ({formatDate(customer.deletedAt)})</span>
                        ) : (
                          <span className="badge bg-success">Hoạt động</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => toggleExpand(customer)}
                        >
                          <i className={`bi bi-chevron-${expandedId === customer.id ? 'up' : 'down'}`}></i>
                        </button>
                      </td>
                    </tr>
                    {expandedId === customer.id && (
                      <tr>
                        <td colSpan={6} className="bg-light">
                          <div className="p-2">
                            {detailLoading && !detail ? (
                              <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                              </div>
                            ) : (
                              <>
                                <div className="d-flex justify-content-end mb-3">
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${customer.needsAttention ? 'btn-danger' : 'btn-outline-danger'}`}
                                    onClick={() => handleToggleNeedsAttention(customer)}
                                  >
                                    <i className="bi bi-flag-fill"></i>{' '}
                                    {customer.needsAttention ? 'Bỏ đánh dấu cần hỗ trợ' : 'Đánh dấu cần hỗ trợ'}
                                  </button>
                                </div>

                                <h6 className="fw-bold small">Đơn hàng</h6>
                                {detail?.orders.length ? (
                                  <table className="table table-sm bg-white mb-3">
                                    <thead>
                                      <tr>
                                        <th>Mã đơn</th>
                                        <th>Ngày đặt</th>
                                        <th>Trạng thái</th>
                                        <th className="text-end">Tổng tiền</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detail.orders.map((order) => (
                                        <tr key={order.id}>
                                          <td className="fw-bold">{order.code}</td>
                                          <td>{formatDate(order.createdAt)}</td>
                                          <td>{STATUS_LABEL[order.status] || order.status}</td>
                                          <td className="text-end">{formatMoney(order.total)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="text-muted small mb-3">Khách hàng chưa đặt đơn hàng nào.</div>
                                )}

                                <h6 className="fw-bold small">Đăng ký nhận tin</h6>
                                {detail?.newsletterSubscribedAt ? (
                                  <div className="text-success small mb-3">
                                    <i className="bi bi-check-circle-fill"></i> Đã đăng ký ({formatDate(detail.newsletterSubscribedAt)})
                                  </div>
                                ) : (
                                  <div className="text-muted small mb-3">Chưa đăng ký nhận tin.</div>
                                )}

                                <h6 className="fw-bold small">Tin nhắn liên hệ</h6>
                                {detail?.contactMessages.length ? (
                                  <ul className="list-unstyled small mb-3">
                                    {detail.contactMessages.map((m) => (
                                      <li key={m.id} className="mb-2 p-2 bg-white rounded border">
                                        <div className="d-flex justify-content-between align-items-start gap-2">
                                          <span className="fw-bold">{CONTACT_SUBJECT_LABEL[m.subject] || m.subject}</span>
                                          <span className={`badge ${m.status === 'NEW' ? 'bg-danger' : 'bg-success'}`}>
                                            {CONTACT_STATUS_LABEL[m.status] || m.status}
                                          </span>
                                        </div>
                                        <div>{m.message}</div>
                                        <div className="text-muted">{formatDate(m.createdAt)}</div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-muted small mb-3">Chưa có tin nhắn liên hệ.</div>
                                )}

                                <h6 className="fw-bold small">Lịch sử chat với chatbot</h6>
                                {detail?.chatMessages.length ? (
                                  <ul className="list-unstyled small mb-0">
                                    {detail.chatMessages.map((m) => (
                                      <li
                                        key={m.id}
                                        className={`mb-2 p-2 rounded border ${m.needsHelp ? 'border-danger bg-danger bg-opacity-10' : 'bg-white'}`}
                                      >
                                        <div><strong>Khách:</strong> {m.message}</div>
                                        <div><strong>Bot:</strong> {m.reply}</div>
                                        <div className="text-muted">
                                          {formatDate(m.createdAt)}
                                          {m.needsHelp && <span className="badge bg-danger ms-2">Cần hỗ trợ</span>}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-muted small">Chưa có lịch sử chat.</div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {tab === 'activity' && (
        <div>
          <div className="bg-white p-4 rounded-3 border mb-4">
            <div className="row g-2 align-items-end mb-3">
              <div className="col-auto">
                <label className="form-label small fw-bold">Khách hàng</label>
                <select
                  className="form-select form-select-sm"
                  value={activityCustomerFilter}
                  onChange={(e) => setActivityCustomerFilter(e.target.value)}
                >
                  <option value="">Tất cả khách hàng</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="col-auto">
                <DateRangeFilter
                  label="Khoảng thời gian"
                  preset={activityDatePreset}
                  onPresetChange={setActivityDatePreset}
                  customFrom={activityCustomFrom}
                  onCustomFromChange={setActivityCustomFrom}
                  customTo={activityCustomTo}
                  onCustomToChange={setActivityCustomTo}
                />
              </div>
              <div className="col-auto">
                <button type="button" className="btn btn-warning fw-bold" onClick={handleExportLogs} disabled={!logs || logs.length === 0}>
                  <i className="bi bi-download"></i> Xuất Excel
                </button>
              </div>
            </div>
            <p className="text-muted small mb-0">
              {logsLoading ? 'Đang tải...' : logs ? `Tìm thấy ${logs.length} thay đổi trong khoảng đã chọn.` : ''}
            </p>
          </div>

          <div className="bg-white rounded-3 border">
            {logsLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status"></div>
              </div>
            ) : !logs || logs.length === 0 ? (
              <p className="text-muted p-4 m-0">Không có thay đổi nào trong khoảng thời gian này.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle m-0">
                  <thead className="table-light">
                    <tr>
                      <th>Thời gian</th>
                      <th>Khách hàng</th>
                      <th>Email</th>
                      <th>Hành động</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id}>
                        <td className="text-nowrap">{new Date(l.createdAt).toLocaleString('vi-VN')}</td>
                        <td>{l.customerName}</td>
                        <td>{l.customerEmail}</td>
                        <td>
                          <span className={`badge ${l.action === 'DELETE_ACCOUNT' ? 'bg-danger' : 'bg-primary'}`}>
                            {CUSTOMER_ACTION_LABEL[l.action] || l.action}
                          </span>
                        </td>
                        <td>{l.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
