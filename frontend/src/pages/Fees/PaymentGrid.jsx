import React, { useState } from 'react';
import { DollarSign, Check } from 'lucide-react';

const PaymentGrid = ({ 
    details,           // Dữ liệu householdPaymentDetails
    feeHeaders,        // Danh sách các loại phí (để render cột)
    onCellClick,       // Hàm xử lý khi click vào ô thường (toggle)
    onVoluntaryChange, // Hàm xử lý khi nhập tiền tự nguyện
    readOnly = false,  // Chế độ chỉ xem
    className 
}) => {
    // Helper: Format tiền tệ
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount);

    return (
        <div className={`border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col h-full overflow-hidden ${className}`}>
            {/* Header Toolbar */}
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-xs text-gray-600 font-medium">Đã thanh toán</span>
                    <div className="w-3 h-3 bg-white border border-gray-300 ml-3 rounded-sm"></div>
                    <span className="text-xs text-gray-600 font-medium">Chưa thanh toán</span>
                    <div className="w-3 h-3  bg-green-500/10 rounded-sm"></div>
                    <span className="text-xs text-gray-600 font-medium">Không có phí cần thu</span>
                </div>
                <span className="text-xs text-gray-400 italic">Scroll ngang để xem thêm phí</span>
            </div>

            {/* MAIN GRID AREA */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full border-separate border-spacing-0 text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            {/* 1. CỘT STICKY: CĂN HỘ (Góc trên cùng bên trái - Z-index cao nhất) */}
                            <th className="sticky left-0 top-0 z-30 bg-gray-200 p-3 min-w-20 border-b border-r border-gray-300 font-bold text-center shadow-md">
                                Căn hộ
                            </th>

                            {/* 2. CỘT STICKY: TỔNG PHẢI NỘP (Cạnh cột căn hộ) */}
                            <th className="sticky left-20 top-0 z-30 bg-orange-100 p-3 min-w-20 border-b border-r border-gray-200 font-bold text-orange-800 text-center shadow-md">
                                Tổng phí bắt buộc
                            </th>

                            {/* 3. HEADER CÁC CỘT PHÍ (Sticky Top) */}
                            {feeHeaders.map((header) => (
                                <th key={header.feeInSessionId} className="sticky top-0 z-20 bg-gray-100 p-3 min-w-35 border-b border-gray-300 font-semibold whitespace-nowrap text-center">
                                    <div className="flex flex-col items-center">
                                        <span>{header.feeName}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    
                    <tbody>
                        {details.map((row) => (
                            <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                                {/* 1. DÒNG STICKY: SỐ PHÒNG (Sticky Left) */}
                                <td className="sticky left-0 z-10 bg-white p-3 border-r border-b border-gray-200 font-bold text-blue-600 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    {row.household.apartmentNumber}
                                </td>

                                {/* 2. DÒNG STICKY: TỔNG TIỀN (Sticky Left) */}
                                <td 
                                    className={`sticky left-20 z-10 p-3 border-r border-b font-black text-center cursor-pointer transition-all shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]
                                        ${row.totalPaidAmount >= row.totalBill && row.totalBill > 0
                                            ? 'bg-green-500 text-white hover:bg-green-600 border-gray-200' 
                                            : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-gray-200'
                                        }`}
                                    title={row.totalPaidAmount >= row.totalBill ? "Đã hoàn thành toàn bộ" : "Click để thanh toán toàn bộ phí bắt buộc"}
                                    onClick={() => !readOnly && onCellClick(row, 'ALL_MANDATORY')}
                                >
                                    {formatCurrency(row.totalBill)}
                                </td>

                                {/* CÁC Ô DỮ LIỆU */}
                                {feeHeaders.map((header) => {
                                    const item = row.items.find(i => i.feeInSessionId === header.feeInSessionId);
                                    if (!item) return <td key={header.feeInSessionId} className="border-b border-gray-200"></td>;

                                    const isVoluntary = item.feeType === 'voluntary';
                                    const isPaid = item.isPaid;
                                    // Trạng thái trống: Bắt buộc nhưng tiền bằng 0
                                    const isEmpty = !isVoluntary && item.totalAmount === 0;

                                    // 1. TRƯỜNG HỢP Ô TRỐNG (MÀU XANH, KHÔNG TƯƠNG TÁC)
                                    if (isEmpty) {
                                        return (
                                            <td key={item._id} className="p-3 border-b border-gray-200 bg-green-500/10 text-green-600 text-center cursor-not-allowed opacity-50">
                                                <span className="font-bold text-sm">0</span>
                                            </td>
                                        );
                                    }

                                    // 2. TRƯỜNG HỢP PHÍ TỰ NGUYỆN (LUÔN HIỆN INPUT)
                                    if (isVoluntary) {
                                        const hasValue = item.quantity > 0;
                                        return (
                                            <td key={item._id} className={`p-2 border-b border-gray-200 text-center transition-colors ${hasValue ? 'bg-green-500' : 'bg-white'}`}>
                                                <input 
                                                    type="number" 
                                                    disabled={readOnly}
                                                    className={`w-full text-right p-1 border rounded outline-none text-sm font-bold transition-all
                                                        ${hasValue ? 'bg-green-500 border-gray-200 text-white placeholder-green-300' : 'bg-white border-gray-200 text-gray-700'}`}
                                                    placeholder="0"
                                                    min="0" // Giới hạn thuộc tính HTML
                                                    defaultValue={item.quantity > 0 ? item.quantity : ''}
                                                    onBlur={(e) => {
                                                        let val = Number(e.target.value);
                                                        if (val < 0) {
                                                            val = 0;
                                                            e.target.value = ''; // Reset trên màn hình về rỗng (hiện placeholder 0)
                                                        }
                                                        onVoluntaryChange(row, item, val);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            let val = Number(e.target.value);
                                                            if (val < 0) {
                                                                val = 0;
                                                                e.target.value = ''; // Reset trên màn hình
                                                            }
                                                            onVoluntaryChange(row, item, val);
                                                            e.target.blur(); // Thoát focus để người dùng thấy sự thay đổi
                                                        }
                                                    }}
                                                />
                                            </td>
                                        );
                                    }

                                    // 3. TRƯỜNG HỢP PHÍ BẮT BUỘC (CÓ THỂ TOGGLE)
                                    return (
                                        <td 
                                            key={item._id} 
                                            className={`p-3 border-b border-gray-200 text-center ${!readOnly ? 'cursor-pointer' : ''} transition-all select-none
                                                ${isPaid ? 'bg-green-500 text-white font-bold' : 'text-gray-400 font-medium hover:bg-green-100'}`}
                                            onClick={() => !readOnly && onCellClick(row, item)}
                                        >
                                            {formatCurrency(item.totalAmount)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentGrid;