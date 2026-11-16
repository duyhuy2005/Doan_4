/**
 * Utility xuất dữ liệu dạng CSV/Excel chuẩn UTF-8 có BOM
 * Tương thích 100% với Microsoft Excel, Google Sheets, LibreOffice
 * Đảm bảo hiển thị chuẩn Tiếng Việt có dấu không bao giờ bị lỗi font
 */

export function exportToCsv({ filename = 'bao-cao', columns = [], data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    alert('Không có dữ liệu để xuất file.');
    return;
  }

  // Header row
  const headers = columns.map((col) => `"${(col.label || col.header || col.key).replace(/"/g, '""')}"`);
  const rows = [headers.join(',')];

  // Data rows
  data.forEach((row, index) => {
    const rowValues = columns.map((col) => {
      let val = '';
      if (col.key === '_index') {
        val = index + 1;
      } else if (typeof col.accessor === 'function') {
        val = col.accessor(row, index);
      } else if (col.key && row[col.key] !== undefined && row[col.key] !== null) {
        val = row[col.key];
      }

      if (col.formatter && typeof col.formatter === 'function') {
        val = col.formatter(val, row);
      }

      const strVal = String(val ?? '').replace(/"/g, '""');
      return `"${strVal}"`;
    });
    rows.push(rowValues.join(','));
  });

  const csvContent = rows.join('\r\n');

  // Thêm UTF-8 BOM (\uFEFF) ở đầu file để Excel trên Windows nhận diện đúng mã UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
