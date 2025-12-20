import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; // Import thêm Header nếu bạn đã có file này

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar cố định */}
            <Sidebar />

            {/* Khu vực nội dung bên phải */}
            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                {/* <Header />  <-- Bỏ comment nếu bạn muốn hiện Header */}

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet /> {/* Nơi hiển thị các trang con (Dashboard, Hộ khẩu...) */}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;