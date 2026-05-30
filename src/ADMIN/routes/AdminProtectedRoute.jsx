import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const AdminProtectedRoute = ({ children }) => {
  const token = Cookies.get("adminToken");
  return token ? children : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;
