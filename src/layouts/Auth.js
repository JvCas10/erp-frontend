
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "components/auth/Login"; 

const AuthLayout = ({ onLoginSuccess }) => {
  return (
    // Eliminamos las clases problemáticas y usamos solo Tailwind
    <div className="min-h-screen w-full">
      <Routes>
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={onLoginSuccess} />} 
        />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </div>
  );
};

export default AuthLayout;