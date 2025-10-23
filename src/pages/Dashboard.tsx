import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import MasterDashboard from "@/components/dashboards/MasterDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "master":
        return <MasterDashboard />;
      case "managerA":
      case "managerB":
        return <ManagerDashboard />;
      default:
        return null;
    }
  };

  return <Layout>{renderDashboard()}</Layout>;
};

export default Dashboard;
