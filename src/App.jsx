import { useState } from 'react'
import React from 'react';
import reactLogo from './assets/logo-essalud.svg'
import viteLogo from './assets/logo-essalud.svg'
import { LoginPage } from './pages/LoginPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from 'react-hot-toast';
import { MenuPage } from './pages/MenuPage';
import { GroupPage } from './pages/GroupPage';
import { ModulePage } from './pages/ModulePage';
import { ReportPage } from './pages/ReportPage';
import { ResultPage } from './pages/ResultPage';
import { UserListPage } from './pages/UserListPage';
import { EditUserPermissions } from './pages/EditUserPermissions';
import { ReportListPage } from './pages/ReportsListPage';
import { ReportForm } from './pages/ReportForm';
import { GroupModuleManagement } from './pages/GroupModuleManagement';
import { AccessRequestForm } from './pages/AccessRequestForm'
import PrivateRoutes from './components/PrivateRoutes';
import AdminRoutes from './components/AdminRoutes';


function App() {
    const [count, setCount] = useState(0)

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/*" element={<Navigate to="/login" />} />
                <Route element={<PrivateRoutes />}>
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/group/:id" element={<GroupPage />} />
                    <Route path="/module/:id" element={<ModulePage />} />
                    <Route path="/report/:id" element={<ReportPage />} />
                    <Route path="/reports" element={<ResultPage />} />
                    <Route path="/access-request" element={<AccessRequestForm />} />
                    <Route element={<AdminRoutes />}>
                        <Route path="/admin/users" element={<UserListPage />} />
                        <Route path="/admin/user/:id" element={<EditUserPermissions />} />
                        <Route path="/admin/reports" element={<ReportListPage />} />
                        <Route path="/admin/report/:id" element={<ReportForm />} />
                        <Route path="/admin/create-report" element={<ReportForm />} />
                        <Route path="/admin/groups-modules" element={<GroupModuleManagement />} />
                    </Route>
                </Route>
            </Routes>
            <Toaster position="top-center" reverseOrder={false} />
        </BrowserRouter>

    )
}

export default App
