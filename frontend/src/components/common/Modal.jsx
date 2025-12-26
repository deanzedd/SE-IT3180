import React from 'react';
import { Button } from './Button';
const Modal = ({ isOpen, onClose, children }) => {
    // Nếu không mở thì không render gì cả
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-gray-950/50">
            
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative duration-200">
                {children}
            </div>
        </div>
    );
};

export default Modal;