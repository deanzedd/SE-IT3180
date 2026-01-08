import * as XLSX from 'xlsx';

/**
 * Hàm chung để xuất dữ liệu ra file Excel
 * @param {Array} data - Mảng các object dữ liệu cần xuất
 * @param {string} fileName - Tên file xuất ra (bao gồm đuôi .xlsx)
 * @param {string} sheetName - Tên sheet (mặc định là 'Sheet1')
 */
export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
};