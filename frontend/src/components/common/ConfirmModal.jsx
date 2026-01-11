import React from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', type = 'danger' }) => {
    const confirmBtnClass = type === 'danger' 
        ? "bg-red-500 hover:bg-red-600 shadow-red-200" 
        : "bg-blue-500 hover:bg-blue-600 shadow-blue-200";

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <Button onClick={onClose} className="bg-gray-100 hover:bg-gray-400">
                        {cancelText}
                    </Button>
                    <Button onClick={() => { onConfirm(); onClose(); }} className={`${confirmBtnClass} shadow-lg`}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;