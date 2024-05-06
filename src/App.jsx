import { useState } from 'react'
import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { LoginPage } from './pages/LoginPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from 'react-hot-toast';
import { MenuPage } from './pages/MenuPage';
import { GroupPage } from './pages/GroupPage';
import { ModulePage } from './pages/ModulePage';
import { ReportPage } from './pages/ReportPage';
import PrivateRoutes from './components/PrivateRoutes';
import AdminRoutes from './components/AdminRoutes';


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/group/:id" element={<GroupPage />} />
          <Route path="/module/:id" element={<ModulePage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route element={<AdminRoutes />}>

          </Route>
        </Route>
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </BrowserRouter>

  )
}

export default App
