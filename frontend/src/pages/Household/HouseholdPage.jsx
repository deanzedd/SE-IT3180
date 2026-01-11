import React, { useState, useEffect } from 'react';
import householdApi from '../../api/householdApi';
import { Plus, Edit, Trash2, User, Home as HomeIcon, FileSpreadsheet, RotateCcw } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { Button } from '../../components/common/Button.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import Table from '../../components/common/Table.jsx';
import { useAuth } from '../../context/AuthContext'; // Lấy user từ context
import { exportToExcel } from '../../utils/excelHandle';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';

const HouseholdPage = () => {
    const { user } = useAuth(); // Lấy thông tin user đã đăng nhập
    const toast = useToast();
    const [households, setHouseholds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHousehold, setEditingHousehold] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);
    const [deletedHouseholds, setDeletedHouseholds] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalHouseholds, setTotalHouseholds] = useState(0);

    // Phân quyền: Chỉ Admin và Manager được phép Thêm/Sửa/Xóa
    const canEdit = ['admin', 'manager'].includes(user?.role);

    // Form data khớp với các input trên giao diện
    const [formData, setFormData] = useState({
        apartmentNumber: '', area: '', motorbikeNumber: '0', carNumber: '0', status: 'active'
    });

    useEffect(() => {
        if (user?.token) {
            fetchHouseholds();
        }
    }, [user]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1); // Reset về trang 1 khi search
            fetchHouseholds(1, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchHouseholds = async () => {
        try {
            setLoading(true);
            const response = await householdApi.getAll({ page, search: searchTerm });
            // Support both old array format (if backend not updated) and new paginated format
            const data = Array.isArray(response.data) ? response.data : response.data.data;
            setHouseholds(data || []);
            setTotalPages(response.data.meta?.totalPages || 1);
            setTotalHouseholds(response.data.meta?.total || 0);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
            toast.error(error.response?.data?.message || 'Không thể tải dữ liệu danh sách hộ khẩu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHouseholds();
    }, [page]);


    const fetchDeletedHouseholds = async () => {
        try {
            const response = await householdApi.getAll({ isDeleted: true });
            setDeletedHouseholds(response.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu đã xóa:', error);
        }
    };

    useEffect(() => {
        if (showDeleted) {
            fetchDeletedHouseholds();
        }
    }, [showDeleted]);

    const tableHeaders = [
        { label: 'Căn hộ', className: 'text-left'},
        { label: 'Chủ hộ', className: 'text-left'},
        { label: 'Diện tích', className: 'text-left'},
        { label: 'Thành viên', className: 'text-left'},
        { label: 'Số xe máy', className: 'text-left'},
        { label: 'Số ô tô', className: 'text-left'},
        { label: 'Trạng thái', className: 'text-left' },
    ];

    if (canEdit) {
        tableHeaders.push({ label: 'Thao tác', className: 'text-left' });
    }

    const renderHouseholdRow = (household) => (
        <tr key={household._id} className="hover:bg-gray-50 transition-colors">
            <td className="py-4 px-6">
                <span className="inline-block text-center w-16 px-3 py-1 bg-blue-500 text-white rounded-lg font-medium text-sm">
                    {household.apartmentNumber}
                </span>
            </td>
            <td className="text-left py-4 px-6">{household.ownerName || 'Trống'}</td>
            <td className="text-left py-4 px-6">{household.area}m²</td>
            <td className="text-left py-4 px-6">{household.members?.length || 0}</td>
            <td className="text-left py-4 px-6">{household.motorbikeNumber}</td>
            <td className="text-left py-4 px-6">{household.carNumber}</td>
            <td className="text-left py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    household.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {household.status === 'active' ? 'Đang ở' : 'Trống'}
                </span>
            </td>
            {canEdit && (
            <td className="py-4 px-6">
                <div className="flex gap-3">
                    <button onClick={() => handleOpenModal(household)} className="text-blue-400 hover:text-blue-600">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(household._id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
            )}
        </tr>
    );

    const renderDeletedRow = (household) => (
        <tr key={household._id} className="bg-gray-50 text-gray-500">
            <td className="py-4 px-6">{household.apartmentNumber}</td>
            <td className="text-left py-4 px-6">{household.ownerName || 'Trống'}</td>
            <td className="text-left py-4 px-6">{household.area}m²</td>
            <td className="text-left py-4 px-6">{household.members?.length || 0}</td>
            <td className="text-left py-4 px-6">{household.motorbikeNumber}</td>
            <td className="text-left py-4 px-6">{household.carNumber}</td>
            <td className="text-left py-4 px-6">Đã xóa</td>
            {canEdit && (
            <td className="py-4 px-6">
                <button onClick={() => handleRestore(household._id)} className="text-green-500 hover:text-green-700" title="Khôi phục">
                    <RotateCcw size={18} />
                </button>
            </td>
            )}
        </tr>
    );

    // const filteredHouseholds = households.filter(h =>
    //     h.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const handleExportExcel = () => {
        const dataToExport = households.map(h => ({
            "Số phòng": h.apartmentNumber,
            "Chủ hộ": h.ownerName || 'Trống',
            "Diện tích (m2)": h.area,
            "Số thành viên": h.members?.length || 0,
            "Số xe máy": h.motorbikeNumber,
            "Số ô tô": h.carNumber,
            "Trạng thái": h.status === 'active' ? 'Đang ở' : 'Trống'
        }));

        exportToExcel(dataToExport, "Danh_sach_ho_khau.xlsx", "Danh sách hộ khẩu");
    };

    const handleOpenModal = (household = null) => {
        if (household) {
            setEditingHousehold(household);
            setFormData({
                apartmentNumber: household.apartmentNumber,
                area: household.area.toString(),
                motorbikeNumber: household.motorbikeNumber.toString(),
                carNumber: household.carNumber.toString(),
                status: household.status
            });
        } else {
            setEditingHousehold(null);
            setFormData({ apartmentNumber: '', area: '', motorbikeNumber: '0', carNumber: '0', status: 'active' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            apartmentNumber: formData.apartmentNumber,
            area: Number(formData.area),
            motorbikeNumber: Number(formData.motorbikeNumber),
            carNumber: Number(formData.carNumber),
            status: formData.status
        };

        try {
            if (editingHousehold) {
                await householdApi.update(editingHousehold._id, data);
            } else {
                await householdApi.create(data);
            }
            fetchHouseholds();
            setIsModalOpen(false);
            toast.success(editingHousehold ? 'Cập nhật thành công' : 'Thêm mới thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu");
        }
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xóa hộ khẩu',
            message: 'Bạn có chắc chắn muốn xóa hộ khẩu này?',
            onConfirm: async () => {
                try {
                    await householdApi.remove(id);
                    fetchHouseholds();
                    toast.success('Đã xóa hộ khẩu');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Lỗi khi xóa hộ khẩu');
                }
            }
        });
    };

    const handleRestore = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Khôi phục hộ khẩu',
            message: 'Bạn có muốn khôi phục hộ khẩu này?',
            type: 'info',
            onConfirm: async () => {
                try {
                    await householdApi.update(id, { isDeleted: false });
                    fetchDeletedHouseholds();
                    fetchHouseholds();
                    toast.success('Khôi phục thành công');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Lỗi khi khôi phục');
                }
            }
        });
    };

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý hộ khẩu</h2>
                <div className="flex gap-3">
                    <Button onClick={handleExportExcel} className="bg-white text-green-600 border border-green-200 hover:bg-green-500 shadow-sm">
                        <FileSpreadsheet className="w-5 h-5 mr-1" /> Xuất Excel
                    </Button>
                    {canEdit && (
                    <Button onClick={() => handleOpenModal()} className="bg-linear-to-r from-blue-500 to-cyan-500">
                        <Plus className="w-5 h-5" /> Thêm hộ khẩu
                    </Button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                        <HomeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Tổng số căn hộ</p>
                        <p className="text-gray-900 font-bold">{totalHouseholds}</p>
                    </div>
                </div>
                <div className="flex-1 max-w-md">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Tìm kiếm căn hộ..." />
                </div>
            </div>

            <Table 
                headers={tableHeaders} 
                data={households} 
                renderRow={renderHouseholdRow} 
                footerText={<>Hiển thị <span className="font-bold">{households.length}</span> / {totalHouseholds} kết quả</>}
            />

            <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
            />

            <div className="mt-4">
                <button
                    onClick={() => setShowDeleted(!showDeleted)}
                    className="text-gray-500 hover:text-gray-700 underline text-sm flex items-center gap-1"
                >
                    {showDeleted ? 'Ẩn căn hộ đã xóa' : 'Hiển thị căn hộ đã xóa'}
                </button>

                {showDeleted && (
                    <div className="mt-4 border-t pt-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-600">Danh sách căn hộ đã xóa</h3>
                        <Table 
                            headers={tableHeaders} 
                            data={deletedHouseholds} 
                            renderRow={renderDeletedRow} 
                        />
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-6">{editingHousehold ? 'Sửa hộ khẩu' : 'Thêm hộ khẩu'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số căn hộ</label>
                                <input value={formData.apartmentNumber} onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                                <input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Xe máy</label>
                                <input type="number" value={formData.motorbikeNumber} onChange={(e) => setFormData({ ...formData, motorbikeNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ô tô</label>
                                <input type="number" value={formData.carNumber} onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                            <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-300 text-gray-700">Hủy</Button>
                            <Button type="submit" className="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 font-bold shadow-lg shadow-blue-200 transition-all">{editingHousehold ? 'Cập nhật' : 'Thêm'}</Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmModal 
                {...confirmModal}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
};

export default HouseholdPage;