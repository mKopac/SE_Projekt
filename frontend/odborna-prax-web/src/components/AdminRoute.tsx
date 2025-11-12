import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
