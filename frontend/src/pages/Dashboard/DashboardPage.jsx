import React from 'react';
import { DollarSign, Users, Building, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
    const stats = [
        { label: 'Tổng thu tháng này', value: '125,500,000đ', change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
        { label: 'Tổng nhân khẩu', value: '1,234', change: '+5 người', icon: Users, color: 'bg-blue-500' },
        { label: 'Tổng hộ khẩu', value: '456', change: '+2 hộ', icon: Building, color: 'bg-purple-500' },
        { label: 'Tỷ lệ đóng phí', value: '87.5%', change: '+3.2%', icon: TrendingUp, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
                <p className="text-gray-500">Hệ thống quản lý chung cư BlueMoon</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Phần bảng hoạt động gần đây (giữ nguyên layout cũ của bạn) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ... (Code phần bảng bên dưới giữ nguyên hoặc copy từ file DashboardHome.tsx nếu cần) */}
            </div>
        </div>
    );
};

export default DashboardPage;