import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    // Nếu không mở thì không render gì cả
    if (!isOpen) return null;

    return (
        // Lớp nền overlay: bg-black/40 tạo độ tối vừa phải, backdrop-blur giúp nền mờ ảo hơn
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-gray-950/50">
            
            {/* Nội dung Modal */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative duration-200">
                
                {/* Nút đóng (X) */}
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={onClose}
                >
                    <span className="text-xl">&#x2715;</span>
                </button>

                {/* Nội dung động truyền từ ngoài vào */}
                {children}
            </div>
        </div>
    );
};

export default Modal;