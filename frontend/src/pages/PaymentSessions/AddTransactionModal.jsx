import React, { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

const AddTransactionModal = ({ isOpen, onClose, households, onSubmit, currentUser, currentSession }) => {
    console.log("households: ", households);
    // 1. Bổ sung State giống bên Resident
    const [aptSearch, setAptSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState(null);
    
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payerName: '',
        method: 'cash',
        note: '',
    });

    // 2. Logic lọc căn hộ (Bê nguyên từ Resident)
    const suggestedHouseholds = (households || []).filter(item =>
        (item.household?.apartmentNumber || '').toLowerCase().includes(aptSearch.toLowerCase())
    ).slice(0, 5);

    // Khi chọn căn hộ từ gợi ý
    const handleSelect = (item) => {
        setSelectedHousehold(item);
        setAptSearch(item.household?.apartmentNumber || '');
        
        // Tính toán số tiền còn nợ (Bắt buộc) để gợi ý nhập liệu
        const debt = (item.totalBill || 0) - (item.totalPaidAmount || 0);
        
        setFormData(prev => ({
            ...prev,
            payerName: item.household?.ownerName || '',
            amount: debt > 0 ? debt : ''
        }));
        setShowSuggestions(false);
    };

    useEffect(() => {
        if (isOpen) {
            setSelectedHousehold(null);
            setAptSearch('');
            setFormData({
                amount: '',
                date: new Date().toISOString().split('T')[0],
                payerName: '',
                method: 'cash',
                note: '',
            });
        }
    }, [isOpen]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!selectedHousehold) {
            alert("Vui lòng chọn một căn hộ trước!");
            return;
        }

        const submitData = {
            ...formData,
            household: selectedHousehold.household?._id,
            paymentSession: currentSession, 
            createdBy: currentUser,
            amount: Number(formData.amount)
        };
        
        onSubmit(submitData);
    };

    const totalBill = selectedHousehold?.totalBill || 0;
    const totalPaid = selectedHousehold?.totalPaidAmount || 0;
    const remainingDebt = totalBill - totalPaid;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Tạo giao dịch</h3>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* PHẦN SEARCH CĂN HỘ TỪ RESIDENT BÊ SANG */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">1. Tìm căn hộ</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập số phòng (VD: 101)..."
                                value={aptSearch}
                                onChange={(e) => {
                                    setAptSearch(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                // Tắt gợi ý khi click ra ngoài (đợi 200ms để kịp nhận event click item)
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                        </div>

                        {/* Dropdown gợi ý */}
                        {showSuggestions && aptSearch && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {suggestedHouseholds.length > 0 ? (
                                    suggestedHouseholds.map(h => (
                                        <div
                                            key={h._id}
                                            onClick={() => handleSelect(h)}
                                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-800">{h.household.apartmentNumber}</p>
                                            </div>
                                            {selectedHousehold?._id === h._id && <CheckCircle size={16} className="text-blue-600" />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-gray-500 text-sm italic">Không tìm thấy căn hộ này</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* HIỂN THỊ CĂN HỘ ĐÃ CHỌN */}
                    <div className="bg-blue-50 rounded-2xl border border-dashed border-blue-300 overflow-hidden mb-4">
                        <div className="grid grid-cols-3 divide-x divide-blue-200">
                            
                            {/* Cột 1: Căn hộ */}
                            <div className="p-3 h-20 flex flex-col justify-end items-center">
                                <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider mb-auto text-center">
                                    Căn hộ
                                </p>
                                <p className="text-xl font-black text-blue-700 leading-none">
                                    {selectedHousehold ? selectedHousehold.household.apartmentNumber : '---'}
                                </p>
                            </div>

                            {/* Cột 2: Tổng phí bắt buộc */}
                            <div className="p-3 h-20 flex flex-col justify-end items-center">
                                <p className="text-[10px] text-orange-500 uppercase font-bold tracking-wider mb-auto text-center">
                                    Tổng phí bắt buộc
                                </p>
                                <p className="text-xl font-black text-orange-600 leading-none">
                                    {totalBill.toLocaleString('vi-VN')}
                                </p>
                            </div>

                            {/* Cột 3: Dư nợ (Số tiền còn lại cần thu) */}
                            <div className="p-3 h-20 flex flex-col justify-end items-center">
                                <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider mb-auto text-center leading-tight">
                                    Dư nợ hiện tại <br/> <span className="text-[8px] lowercase font-normal">(còn phải nộp)</span>
                                </p>
                                <p className={`text-xl font-black leading-none ${remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {remainingDebt.toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-700">2. Thông tin thanh toán</label>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
                            <input 
                                type="number" 
                                required 
                                value={formData.amount} 
                                onChange={e => setFormData({...formData, amount: e.target.value})} 
                                className="w-full p-2.5 rounded-xl border text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Người nộp</label>
                            <input 
                                type="text" 
                                required
                                value={formData.payerName} 
                                onChange={e => setFormData({...formData, payerName: e.target.value})} 
                                className="w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nộp</label>
                                <input 
                                    type="date" 
                                    required
                                    value={formData.date} 
                                    onChange={e => setFormData({...formData, date: e.target.value})} 
                                    className="w-full p-2 rounded-xl border text-xs outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hình thức</label>
                                <select 
                                    value={formData.method} 
                                    onChange={e => setFormData({...formData, method: e.target.value})}
                                    className="w-full p-2 rounded-xl border text-xs bg-white outline-none"
                                >
                                    <option value="cash">Tiền mặt</option>
                                    <option value="bank">Chuyển khoản</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                            <textarea 
                                rows="2"
                                value={formData.note} 
                                onChange={e => setFormData({...formData, note: e.target.value})} 
                                className="w-full p-2 rounded-xl border text-xs outline-none"
                                placeholder="Nội dung nộp tiền..."
                            />
                        </div>

                        <div className="flex gap-4 pt-6 mt-6">
                            <Button type="button" onClick={onClose} className="flex-1 bg-gray-400">Hủy</Button>
                            <Button type="submit" 
                                disabled={!selectedHousehold}
                                className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all">Lưu
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddTransactionModal;