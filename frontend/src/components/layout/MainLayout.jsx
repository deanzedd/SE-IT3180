import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; // Import thêm Header nếu bạn đã có file này

const MainLayout = () => {
    return (
        <div className="relative w-full h-full min-h-[calc(105vh-80px)] grid grid-cols-[270px_1fr] gap-8">
            {/* Sidebar cố định */}
            <Sidebar />

            <div className="relative z-10 shadow-2xl shadow-black/50 rounded-3xl flex flex-col items-start justify-center h-full overflow-hidden">
                <main className="flex-1 w-full h-full] bg-white overflow-y-auto">
                    <Outlet /> {/* Nơi hiển thị các trang con */}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;