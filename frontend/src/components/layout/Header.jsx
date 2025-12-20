import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const Header = () => {
    return (
        <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between bg-white px-8 shadow-sm border-b border-gray-100">

            {/* Bên trái: Thanh tìm kiếm */}
            <div className="flex items-center gap-4">
                {/* Nút Menu cho mobile (ẩn trên màn hình lớn) */}
                <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Menu size={24} />
                </button>

                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thông tin..."
                        className="h-11 w-80 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Bên phải: Thông báo & Profile */}
            <div className="flex items-center gap-6">
                {/* Nút thông báo */}
                <button className="relative group rounded-xl p-2.5 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white group-hover:scale-110 transition-transform"></span>
                </button>

                {/* Thông tin Admin */}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-gray-700">Nguyễn Minh Tâm</p>
                        <p className="text-xs font-medium text-gray-400">Quản trị viên</p>
                    </div>
                    <div className="h-11 w-11 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-4 ring-white">
                        TM
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;