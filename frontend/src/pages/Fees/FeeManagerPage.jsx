import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Receipt, RotateCcw } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import AddFeeModal from './AddFeeModal';
import feeApi from '../../api/feeApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';

const FeeManagerPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [showDeleted, setShowDeleted] = useState(false);
    const [deletedFees, setDeletedFees] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    // Phân quyền: Admin và Accountant có quyền sửa đổi (Full), Manager chỉ xem
    const canEdit = ['admin', 'accountant'].includes(user?.role);

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const response = await feeApi.getAll();
            setFees(response.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeletedFees = async () => {
        try {
            const response = await feeApi.getAll({ isDeleted: true });
            setDeletedFees(response.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu đã xóa:', error);
        }
    };

    useEffect(() => {
        if (showDeleted) {
            fetchDeletedFees();
        }
    }, [showDeleted]);

    const headers = [
        { label: 'Tên khoản thu', className: 'text-left' },
        { label: 'Đơn giá (VND)', className: 'text-left' },
        { label: 'Tính theo', className: 'text-left' },
        { label: 'Loại', className: 'text-left' },
        { label: 'Mô tả', className: 'text-left' },
    ];

    if (canEdit) {
        headers.push({ label: 'Thao tác', className: 'text-left' });
    }

    const renderRow = (item, index) => (
        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
            <td className="py-4 px-6 font-medium text-gray-900">{item.name}</td>
            <td className="py-4 px-6 text-blue-600 font-bold">
                {item.unitPrice ? `${new Intl.NumberFormat('vi-VN').format(item.unitPrice)} đ` : '-'}
            </td>
            <td className="py-4 px-6 text-gray-600">
                {item.unit ? getUnitLabel(item.unit) : '-'}
            </td>
            <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.type === 'voluntary' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    {item.type === 'mandatory_automatic' && 'Bắt buộc (Tự động)'}
                    {item.type === 'mandatory_manual' && 'Bắt buộc (Thủ công)'}
                    {item.type === 'voluntary' && 'Tự nguyện'}
                </span>
            </td>
            <td className="py-4 px-6 text-gray-500 italic truncate max-w-xs">{item.description}</td>
            {canEdit && (
            <td className="py-4 px-6">
                <div className="flex gap-3">
                    <button onClick={() => handleOpenModal(item)} className="flex items-center justify-center w-7 h-7 rounded-md text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="flex items-center justify-center w-7 h-7 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
            )}
        </tr>
    );

    const renderDeletedRow = (item) => (
        <tr key={item._id} className="bg-gray-50 text-gray-500">
            <td className="py-4 px-6 font-medium">{item.name}</td>
            <td className="py-4 px-6">
                {item.unitPrice ? `${new Intl.NumberFormat('vi-VN').format(item.unitPrice)} đ` : '-'}
            </td>
            <td className="py-4 px-6">
                {item.unit ? getUnitLabel(item.unit) : '-'}
            </td>
            <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600`}>
                    {item.type === 'mandatory_automatic' && 'Bắt buộc (Tự động)'}
                    {item.type === 'mandatory_manual' && 'Bắt buộc (Thủ công)'}
                    {item.type === 'voluntary' && 'Tự nguyện'}
                </span>
            </td>
            <td className="py-4 px-6 italic truncate max-w-xs">{item.description}</td>
            {canEdit && (
            <td className="py-4 px-6">
                <div className="flex gap-3">
                    <button onClick={() => handleRestore(item._id)} className="flex items-center justify-center w-7 h-7 rounded-md text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors" title="Khôi phục">
                        <RotateCcw size={18} />
                    </button>
                </div>
            </td>
            )}
        </tr>
    );

    const handleOpenModal = (fee = null) => {
        setEditingFee(fee);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingFee) {
                await feeApi.update(editingFee._id, data);
            } else {
                await feeApi.create(data);
            }
            fetchFees();
            setIsModalOpen(false);
            toast.success(editingFee ? 'Cập nhật thành công' : 'Thêm mới thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa khoản thu',
            message: 'Bạn có chắc chắn muốn xóa khoản thu này?',
            onConfirm: () => {
                feeApi.remove(id)
                    .then(() => { fetchFees(); toast.success('Đã xóa khoản thu'); })
                    .catch(error => toast.error(error.response?.data?.message || 'Lỗi khi xóa khoản thu'));
            }
        });
    };

    const handleRestore = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Khôi phục khoản thu',
            message: 'Bạn có muốn khôi phục khoản thu này?',
            type: 'info',
            onConfirm: async () => {
                try {
                    await feeApi.update(id, { isDeleted: false });
                    fetchDeletedFees();
                    fetchFees();
                    toast.success('Khôi phục thành công');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Lỗi khi khôi phục khoản thu');
                }
            }
        });
    };

    const filteredFees = fees.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const getUnitLabel = (unit) => {
        const unitMap = {
            'area': 'Diện tích căn hộ (m²)',
            'person': 'Số người',
            'household': 'Hộ gia đình',
            'fixed': 'Cố định',
            'water': 'Mét khối (m³)',
            'car': 'Ô tô',
            'bike': 'Xe máy',
            'electricity': 'kWh',
            'default': 'Nhập thẳng số tiền',
        };
        return unitMap[unit] || unit;
    };

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khoản thu</h2>
                </div>
                {/* Button: Chỉ để bg-gradient, không set text-color */}
                {canEdit && (
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-linear-to-r from-blue-500 to-cyan-500"
                >
                    Thêm khoản thu
                </Button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Tổng danh mục phí</p>
                        <p className="text-gray-900 font-bold">{fees.length} loại</p>
                    </div>
                </div>
                <div className="flex-1 max-w-md">
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Tìm kiếm khoản thu..."
                    />
                </div>
            </div>

            <Table
                headers={headers}
                data={filteredFees}
                renderRow={renderRow}
                footerText={<>Tổng số: <span className="font-bold text-gray-700">{filteredFees.length}</span> loại phí</>}
            />

            <div className="mt-4">
                <button
                    onClick={() => setShowDeleted(!showDeleted)}
                    className="text-gray-500 hover:text-gray-700 underline text-sm flex items-center gap-1"
                >
                    {showDeleted ? 'Ẩn khoản thu đã xóa' : 'Hiển thị khoản thu đã xóa'}
                </button>

                {showDeleted && (
                    <div className="mt-4 border-t pt-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-600">Danh sách khoản thu đã xóa</h3>
                        <Table 
                            headers={headers} 
                            data={deletedFees} 
                            renderRow={renderDeletedRow} 
                        />
                    </div>
                )}
            </div>

            <AddFeeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSubmit}
                initialData={editingFee}
            />

            <ConfirmModal 
                {...confirmModal}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
};

export default FeeManagerPage;