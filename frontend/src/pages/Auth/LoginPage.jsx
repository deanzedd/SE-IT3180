import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        // Lớp 'items-center justify-center' giúp đẩy mọi thứ vào giữa
        <div className="flex min-h-screen w-full items-center justify-center bg-[#EEF2FF] p-4">

            {/* Khung đăng nhập: Chiều rộng cố định 480px, bo góc 32px */}
            <div className="w-full max-w-[480px] flex flex-col items-center rounded-[32px] bg-white p-10 shadow-2xl">

                {/* Logo & Tiêu đề */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                        <Building2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800">
                        Hệ thống quản lý chung cư <br />
                        <span className="text-blue-600">BlueMoon</span>
                    </h1>
                </div>

                {/* Form nhập liệu */}
                <form onSubmit={handleSubmit} className="w-full space-y-5">
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <button type="button" className="text-sm font-bold text-cyan-600 hover:text-cyan-700">Quên mật khẩu?</button>
                        <button type="submit" className="rounded-full bg-white border-2 border-blue-600 px-6 py-2 font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                            Đăng nhập
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;