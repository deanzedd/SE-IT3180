import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/Auth/LoginPage';

// Import đúng các file bạn đang có
import DashboardPage from '../pages/Dashboard/DashboardPage';
import HouseholdListPage from '../pages/Household/HouseholdListPage';
import ResidentListPage from '../pages/Household/ResidentListPage';
import FeeManagerPage from '../pages/Fees/FeeManagerPage';
import PaymentCollectionPage from '../pages/Fees/PaymentCollectionPage';
import UserManagementPage from '../pages/Admin/UserManagementPage';

// Component bảo vệ (Giả lập)
const PrivateRoute = ({ children }) => {
    return children;
};

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                <Route index element={<DashboardPage />} />

                {/* Hộ khẩu & Nhân khẩu */}
                <Route path="households" element={<HouseholdListPage />} />
                <Route path="residents" element={<ResidentListPage />} /> {/* Đã trỏ vào ResidentListPage */}

                {/* Khoản thu & Đợt thu */}
                <Route path="fees" element={<FeeManagerPage />} />
                <Route path="payments" element={<PaymentCollectionPage />} />
                <Route path="users" element={<UserManagementPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRouter;