import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

const AddFeeModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        unitPrice: '',
        unit: '',
        type: '',
        description: ''
    });

    // Cập nhật form khi initialData thay đổi (dùng cho trường hợp Edit)
    useEffect(() => {
        if (initialData) {
            // Map backend enum values to Vietnamese labels
            const typeMap = {
                'Bắt buộc (Tự động tính)': 'mandatory_automatic',
                'Bắt buộc (Nhập thủ công)': 'mandatory_manual',
                'Tự nguyện': 'voluntary'
            };
            setFormData({
                ...initialData,
                type: typeMap[initialData.type] || initialData.type
            });
        } else {
            setFormData({ name: '', unitPrice: '', unit: '', type: 'mandatory_automatic', description: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 1. Tạo một bản sao dữ liệu để xử lý
        let payload = {
            ...formData,
            unitPrice: formData.unitPrice ? Number(formData.unitPrice) : 0
        };

        // 2. Xử lý trường hợp "Tự nguyện"
        if (formData.type === 'voluntary') {
            payload.unit = null;
            payload.unitPrice = 0; // Hoặc null tùy vào Backend Schema của bạn
        } 
        // 3. Xử lý trường hợp "Không đơn vị" (default)
        else if (formData.unit === 'default') {
            payload.unit = 'default'; // Giữ là 'default' nếu Backend enum có giá trị này
            payload.unitPrice = null;
            // Nếu Backend muốn null cho trường hợp này, hãy dùng: payload.unit = null;
        }

        // 4. Đảm bảo nếu unit là chuỗi rỗng thì chuyển thành null
        if (payload.unit === "") {
            payload.unitPrice = null;
        }

        onSubmit(payload);
        onClose();
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    {initialData ? 'Chỉnh sửa khoản thu' : 'Thêm khoản thu mới'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoản thu</label>
                        <input 
                            value={formData.name} 
                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại phí</label>
                        <select 
                            value={formData.type} 
                            onChange={e => setFormData({ ...formData, type: e.target.value })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="mandatory_automatic">Bắt buộc (Tự động tính)</option>
                            <option value="mandatory_manual">Bắt buộc (Nhập thủ công)</option>
                            <option value="voluntary">Tự nguyện</option>
                        </select>
                    </div>

                    {formData.type !== 'voluntary' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đơn giá (VND)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={formData.unitPrice} 
                                        onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tính theo
                                    </label>
                                    <select 
                                        value={formData.unit} 
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">-- Chọn cách tính --</option>
                                        {formData.type === 'mandatory_automatic' ? (
                                            <>
                                                <option value="area">Diện tích căn hộ (m²)</option>
                                                <option value="person">Số người</option>
                                                <option value="household">Hộ gia đình</option>
                                                <option value="fixed">Cố định</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="electricity">kWh (Điện)</option>
                                                <option value="m^3">m³ (Nước)</option>
                                                <option value="default">Không đơn vị</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            
                            {formData.type === 'mandatory_manual' && (
                                <div className="text-xs text-amber-600 italic bg-amber-50 p-2 rounded-lg border border-amber-100"> 
                                    <strong>Chú ý:</strong> Nếu không có đơn vị tính (nhập thẳng số tiền) thì chọn "Không đơn vị".
                                </div>
                            )}
                        </div>
                    )}

                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({ ...formData, description: e.target.value })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                        <Button type="button" onClick={onClose} className="flex-1 bg-gray-400">Hủy</Button>
                        <Button type="submit" className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all">Lưu</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddFeeModal;