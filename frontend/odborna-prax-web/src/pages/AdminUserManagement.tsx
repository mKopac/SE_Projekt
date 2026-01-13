import Header from "../components/Header";
import Footer from "../components/Footer";
import UserManagementTable from "../components/UserManagementTable";

export default function AdminUserManagement() {
  return (
    <div className="page-layout">
      <Header />
      <UserManagementTable />
      <Footer />
    </div>
  );
}