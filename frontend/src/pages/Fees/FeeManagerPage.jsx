import React, { useState } from 'react';

const FeeManagerPage = ({ onClose }) => {
    // 1. Sử dụng state để lưu trữ dữ liệu người dùng nhập
    const [formData, setFormData] = useState({
        name: '',
        unitPrice: 0,
        type: 'mandatory',
        unit: 'm2',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 2. Gọi API POST /api/fees để tạo khoản phí mới
        console.log('Dữ liệu gửi đi:', formData);
        // ... (Logic gọi Axios API) ...
        onClose(); 
    };

    return (
        <div className="p-6 bg-white rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Thêm Khoản Thu Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input Tên Khoản Thu */}
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tên khoản thu (VD: Phí Vệ sinh)"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
                
                {/* Input Đơn Giá */}
                <input 
                    type="number" 
                    name="unitPrice" 
                    value={formData.unitPrice}
                    onChange={handleChange}
                    placeholder="Đơn giá (VD: 15000)"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
                
                {/* Select Box Đơn vị tính */}
                <select name="unit" value={formData.unit} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
                    <option value="m2">Mét vuông (m2)</option>
                    <option value="person">Đầu người</option>
                    <option value="household">Hộ gia đình</option>
                    <option value="fixed">Cố định</option>
                </select>

                {/* Radio Button Loại Phí */}
                <div className="flex space-x-4">
                    <label>
                        <input type="radio" name="type" value="mandatory" checked={formData.type === 'mandatory'} onChange={handleChange} />
                        Bắt buộc
                    </label>
                    <label>
                        <input type="radio" name="type" value="voluntary" checked={formData.type === 'voluntary'} onChange={handleChange} />
                        Tự nguyện
                    </label>
                </div>
                
                {/* Textarea Mô tả */}
                <textarea 
                    name="description" 
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết..."
                    className="w-full p-2 border border-gray-300 rounded h-20"
                ></textarea>

                {/* Buttons */}
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded">Hủy</button>
                    <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Lưu Khoản Thu</button>
                </div>
            </form>
        </div>
    );
};

export default FeeManagerPage;