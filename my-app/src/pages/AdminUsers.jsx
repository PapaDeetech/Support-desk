import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import BackButton from './components/BackButton';
import adminService from '../features/admin/adminService';

const USERS_PER_PAGE = 10;

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        let active = true;

        const fetchUsers = async () => {
            if (!user?.token) {
                setError('Please log in with an admin account.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const data = await adminService.getUsers(user.token);

                // console.log('Admin users API response:', data);
                
                // Supports either an array or { users: [...] }
                const userList = Array.isArray(data) ? data : Array.isArray (data?.users) ? data.users : null;

                if (!userList) {
                    console.error('Unexpected users response:', data);
                    throw new Error('Unexpected response from the server.');
                }

                if (active) setUsers(userList);
            } catch (err) {
                const message =
                    err.response?.data?.message || err.message || 'Failed to load users.';

                if (active) {
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchUsers();

        return () => {
            active = false;
        };
    }, [user?.token]);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();

        return users.filter((item) => {
            const matchesSearch =
                (item.name || '').toLowerCase().includes(term) ||
                (item.email || '').toLowerCase().includes(term);

            const matchesRole =
                role === 'all' ||
                (role === 'admin' && item.isAdmin === true) ||
                (role === 'user' && item.isAdmin !== true);

            return matchesSearch && matchesRole;
        });
    }, [users, search, role]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / USERS_PER_PAGE)
    );

    const safePage = Math.min(currentPage, totalPages);

    const visibleUsers = filteredUsers.slice(
        (safePage - 1) * USERS_PER_PAGE,
        safePage * USERS_PER_PAGE
    );

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleRole = (value) => {
        setRole(value);
        setCurrentPage(1);
    };

    return (
        <main className="admin-page">
            <BackButton url='/admin'/>

            <div className="admin-page-heading">
                <div>
                    <h1 className="admin-eyebrow">ADMIN</h1>
                    <h2>Manage Users</h2>
                    <p className="admin-subtitle">
                        View and search all registered accounts.
                    </p>
                </div>

                <div className="admin-total-card">
                    <span>Total users</span>
                    <strong>{users.length}</strong>
                </div>
            </div>

            <section className="admin-panel">
                <div className="admin-toolbar">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        aria-label="Search users by name or email"
                    />

                    <select
                        value={role}
                        onChange={(e) => handleRole(e.target.value)}
                        aria-label="Filter users by role"
                    >
                        <option value="all">All roles</option>
                        <option value="admin">Admins only</option>
                        <option value="user">Regular users only</option>
                    </select>
                </div>

                {isLoading ? (
                    <p className="admin-message">Loading users...</p>
                ) : error ? (
                    <p className="admin-error">{error}</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="admin-message">No users match your search.</p>
                ) : (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Registered</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {visibleUsers.map((item) => (
                                        <tr key={item._id}>
                                            <td className="admin-user-name">{item.name}</td>
                                            <td>{item.email}</td>
                                            <td>
                                                <span
                                                    className={`role-badge ${item.isAdmin ? 'role-admin' : 'role-user'
                                                        }`}
                                                >
                                                    {item.isAdmin ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td>
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-pagination">
                            <span>
                                Showing {(safePage - 1) * USERS_PER_PAGE + 1}–
                                {Math.min(safePage * USERS_PER_PAGE, filteredUsers.length)} of{' '}
                                {filteredUsers.length}
                            </span>

                            <div className="pagination-buttons">
                                <button
                                    type="button"
                                    className="admin-button admin-button-secondary"
                                    disabled={safePage === 1}
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                >
                                    Previous
                                </button>

                                <span className="page-number">
                                    Page {safePage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    className="admin-button admin-button-secondary"
                                    disabled={safePage >= totalPages}
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

export default AdminUsers;