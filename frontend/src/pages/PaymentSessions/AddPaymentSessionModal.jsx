import React, { useState } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { Circle, CircleCheck } from 'lucide-react'; 
import { Button } from '../../components/common/Button.jsx';
import DatePicker from "react-datepicker";
import { Calendar as CalendarIcon } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
const AddPaymentSession = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        startDate: '', // Khởi tạo rỗng cho kiểu date
        endDate: '',
        description: '',
        isActive: true // Mặc định đợt thu mới sẽ kích hoạt
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="px-1 py-5 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Thêm đợt thu mới</h2>
            </div>

            <div className="p-1">
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Tiêu đề đợt thu */}
                    <div className="space-y-2 mt-4">
                        <label className="block text-lg font-semibold text-gray-700">Tên đợt thu</label>
                        <input
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            name="title"
                            placeholder="VD: Thu phí dịch vụ Quý 1 - 2025"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Hàng ngang: Ngày bắt đầu và Ngày kết thúc (DatePickers) */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Ngày bắt đầu */}
                        <div className="space-y-2 relative">
                            <label className="block text-lg font-semibold text-gray-700">Ngày bắt đầu</label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.startDate}
                                    onChange={(date) => setFormData({...formData, startDate: date})}
                                    dateFormat="dd/MM/yyyy"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                    placeholderText="Chọn ngày"
                                />
                                <CalendarIcon className="absolute right-3 top-2.5 size-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Ngày kết thúc */}
                        <div className="space-y-2 relative">
                            <label className="block text-lg font-semibold text-gray-700">Ngày kết thúc</label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.endDate}
                                    onChange={(date) => setFormData({...formData, endDate: date})}
                                    dateFormat="dd/MM/yyyy"
                                    minDate={formData.startDate} // Không cho chọn ngày trước ngày bắt đầu
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                    placeholderText="Chọn ngày"
                                />
                                <CalendarIcon className="absolute right-3 top-2.5 size-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Mô tả chi tiết */}
                    <div className="space-y-2">
                        <label className="block text-lg font-semibold text-gray-700">Mô tả</label>
                        <textarea
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            name="description"
                            placeholder="Nhập thông tin chi tiết về đợt thu này..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-10 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-auto bg-gray-300 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-auto bg-linear-to-r from-green-500 to-green-300 font-bold transition-colors"
                        >
                            Tạo đợt thu
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

const TestAddPaymentSession = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleSubmit = (data) => {
        alert(`Submitted: ${JSON.stringify(data)}`);
    };

    return (
        <div className="h-screen flex
                        items-start justify-center">
            <Button
                className="bg-linear-to-r from-blue-500 to-cyan-500"
                onClick={() => setModalOpen(true)}
            >
                Thêm đợt thu
            </Button>
            <AddPaymentSession
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default TestAddPaymentSession;