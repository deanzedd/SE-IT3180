import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
//npm install lucide-react
import { Building } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { AddButton } from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';

const FormModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', email: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-lg font-bold">Thêm khoản phí</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm">Name</label>
                    <input
                        className="w-full px-3 py-2
                                   border rounded-lg"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm">Email</label>
                    <input
                        className="w-full px-3
                                   py-2 border rounded-lg"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <Button
                    type="submit"
                    className="bg-linear-to-r from-blue-500 to-cyan-500"
                >
                    Submit
                </Button>
            </form>
        </Modal>
    );
};

const TestForm = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    const handleSubmit = (data) => {
        alert(`Submitted: ${JSON.stringify(data)}`);
    };

    return (
        <div className="h-screen flex
                        items-start justify-center">
            <AddButton
                className="bg-linear-to-r from-blue-500 to-cyan-500"
                onClick={() => setModalOpen(true)}
            >
                Thêm khoản phí
            </AddButton>
            <FormModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default TestForm;