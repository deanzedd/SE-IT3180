import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, Users, Wallet, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Đảm bảo import đúng đường dẫn

const Sidebar = () => {
    const navigate = useNavigate();
    // Nếu chưa có AuthContext, bạn có thể comment dòng dưới và hàm handleLogout
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Tổng quan' },
        { path: '/households', icon: Home, label: 'Hộ khẩu' },
        { path: '/residents', icon: Users, label: 'Nhân khẩu' },
        { path: '/fees', icon: Wallet, label: 'Khoản thu' },
        { path: '/payments', icon: Calendar, label: 'Đợt thu' },
    ];

    return (
        <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200 fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="flex h-16 items-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">BM</div>
                    BlueMoon
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-100 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                    <LogOut size={20} />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Sidebar;