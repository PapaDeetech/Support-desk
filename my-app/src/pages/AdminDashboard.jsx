import BackButton from "./components/BackButton";
import { Link, useNavigate } from 'react-router-dom'

function AdminDashboard() {
    const navigate = useNavigate()

    return (
        <div className="admin-dashboard">
            <BackButton url='/' />

            <h1>Dashboard</h1>
            <p>Welcome to the administration panel.</p>


            <div className="admin-dashboard-cards">
                <div className="admin-card">
                    <h3>Manage Users</h3>
                    <p>View all registered users, search accounts, and filter by role.</p>
                    <Link to="/admin/users" className="admin-button admin-button-primary">
                        View Users
                    </Link>
                </div>

                <div className="admin-card">
                    <h3>Manage Tickets</h3>
                    <p>Review all support tickets, edit details, and delete tickets.</p>
                    <Link to="/admin/tickets" className="admin-button admin-button-primary">
                        View Tickets
                    </Link>
                </div>
            </div>
        </div>
    );
}

            export default AdminDashboard;