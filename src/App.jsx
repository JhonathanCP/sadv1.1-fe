import { useState } from 'react'
import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { LoginPage } from './pages/LoginPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from 'react-hot-toast';

function App() {
  const [count, setCount] = useState(0)

  return (
  <BrowserRouter>
    <Routes>
        <Route path="/login" element={<LoginPage />} />
    </Routes>
    <Toaster position="top-center" reverseOrder={false} />
  </BrowserRouter>
  )
}

export default App
