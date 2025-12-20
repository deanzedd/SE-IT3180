import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button.jsx';
import { ReceiptText, Users, Home, UserCog, Building } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Cấu hình các chức năng theo vai trò
    const menuConfig = [
        { 
            label: 'Quản lý thu phí', 
            path: '/fees', 
            icon: ReceiptText, 
            roles: ['accountant']
        },
        { 
            label: 'Quản lý hộ khẩu', 
            path: '/household', 
            icon: Home, 
            roles: ['manager'] 
        },
        { 
            label: 'Quản lý nhân khẩu', 
            path: '/residents', 
            icon: Users, 
            roles: ['manager'] 
        },
        { 
            label: 'Quản lý người dùng', 
            path: '/users',
            icon: UserCog, 
            roles: ['admin']
        },
    ];

    // Lọc menu dựa trên role của user hiện tại
    const filteredMenu = menuConfig.filter(item => item.roles.includes(user?.role));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/50 border border-gray-100 p-6 h-full flex flex-col">
            <h2 className="px-5 text-2xl font-bold mb-6 text-gray-800 border-b border-gray-300 pb-4">
                <span className="inline-flex items-center justify-center bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg p-1 mr-2 text-white align-middle">
                    <Building size={30} />
                </span> 
                <span className="align-middle">BlueMoon</span>
            </h2>
            
            <ul className="space-y-3">
                {filteredMenu.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <li 
                            key={index} 
                            onClick={() => navigate(item.path)}
                            className="flex items-center gap-3 p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl cursor-pointer transition-all font-medium"
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </li>
                    );
                })}
                {filteredMenu.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Không có chức năng khả dụng</p>
                )}
            </ul>

            <div className="flex justify-center mt-auto pt-6 border-t border-gray-300">
                <Button 
                    onClick={handleLogout}
                    className="bg-linear-to-r from-red-500 to-orange-500 shadow-lg"
                >
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;