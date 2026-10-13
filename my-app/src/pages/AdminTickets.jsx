
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import BackButton from './components/BackButton';
import adminService from '../features/admin/adminService';

const TICKETS_PER_PAGE = 10;

function AdminTickets() {
    const { user } = useSelector((state) => state.auth);

    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editForm, setEditForm] = useState({
        product: '',
        description: '',
        status: 'new',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        const fetchTickets = async () => {
            if (!user?.token) {
                setError('Please log in with an admin account.');
                setIsLoading(false);

                return;
            }

            try {
                setIsLoading(true);
                setError('');

                const data = await adminService.getTickets(user.token);
                const list = Array.isArray(data) ? data : data.tickets;

                if (!Array.isArray(list)) {
                    throw new Error('The server returned an unexpected tickets response.');
                }

                if (active) setTickets(list);
            } catch (err) {
                const message =
                    err.response?.data?.message || err.message || 'Failed to load tickets.';

                if (active) {
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchTickets();

        return () => {
            active = false;
        };
    }, [user?.token]);

    const filteredTickets = useMemo(() => {
        const term = search.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const owner =
                typeof ticket.user === 'object' && ticket.user !== null
                    ? `${ticket.user.name || ''} ${ticket.user.email || ''}`
                    : '';

            const searchableText = [
                ticket.product,
                ticket.description,
                ticket._id,
                owner,
            ]
                .join(' ')
                .toLowerCase();

            const matchesSearch = searchableText.includes(term);
            const matchesStatus =
                statusFilter === 'all' || ticket.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [tickets, search, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTickets.length / TICKETS_PER_PAGE)
    );

    const safePage = Math.min(currentPage, totalPages);

    const visibleTickets = filteredTickets.slice(
        (safePage - 1) * TICKETS_PER_PAGE,
        safePage * TICKETS_PER_PAGE
    );

    const startEditing = (ticket) => {
        setEditingId(ticket._id);
        setEditForm({
            product: ticket.product || '',
            description: ticket.description || '',
            status: ticket.status || 'new',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({
            product: '',
            description: '',
            status: 'new',
        });
    };

    const handleSave = async (ticketId) => {
        if (!editForm.product.trim() || !editForm.description.trim()) {
            toast.error('Product and description are required.');
            return;
        }

        try {
            setSaving(true);

            await adminService.updateTicket(
                ticketId,
                editForm,
                user.token
            );

            // Refresh from the server so the list reflects saved data.
            const data = await adminService.getTickets(user.token);
            const list = Array.isArray(data) ? data : data.tickets;

            if (!Array.isArray(list)) {
                throw new Error('Ticket was saved, but the refreshed response was unexpected.');
            }

            setTickets(list);
            cancelEditing();
            toast.success('Ticket updated successfully.');
        } catch (err) {
            toast.error(
                err.response?.data?.message || err.message || 'Failed to update ticket.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (ticketId) => {
        if (!user?.token || saving || deletingId !== null) return;

        const confirmed = window.confirm(
            'Are you sure you want to permanently delete this ticket?'
        );

        if (!confirmed) return;

        try {
            setDeletingId(ticketId);

            await adminService.deleteTicket(ticketId, user.token);

            setTickets((previous) =>
                previous.filter((ticket) => ticket._id !== ticketId)
            );

            if (editingId === ticketId) cancelEditing();

            toast.success('Ticket deleted successfully.');
        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Failed to delete ticket.'
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    return (
        <main className="admin-page">
            <BackButton url='/admin' />

            <div className="admin-page-heading">
                <div>
                    <h1 className="admin-eyebrow">ADMINISTRATION</h1>
                    <h2>Manage Tickets</h2>
                    <p className="admin-subtitle">
                        Review, edit, and remove tickets across the support desk.
                    </p>
                </div>

                <div className="admin-total-card">
                    <span>Total tickets</span>
                    <strong>{tickets.length}</strong>
                </div>
            </div>

            <section className="admin-panel">
                <div className="admin-toolbar">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search product, description, ID, or owner..."
                        aria-label="Search tickets"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        aria-label="Filter tickets by status"
                    >
                        <option value="all">All statuses</option>
                        <option value="new">New</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {isLoading ? (
                    <p className="admin-message">Loading tickets...</p>
                ) : error ? (
                    <p className="admin-error">{error}</p>
                ) : filteredTickets.length === 0 ? (
                    <p className="admin-message">No tickets match your search.</p>
                ) : (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Description</th>
                                        <th>Owner</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {visibleTickets.map((ticket) => (
                                        <tr key={ticket._id}>
                                            <td>
                                                {editingId === ticket._id ? (
                                                    <select
                                                        value={editForm.product}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                product: e.target.value,
                                                            })
                                                        }
                                                        required
                                                    >
                                                        <option value="Iphone">Iphone</option>
                                                        <option value="Macbook Pro">Macbook Pro</option>
                                                        <option value="Hp Elitebook">Hp Elitebook</option>
                                                        <option value="Dell Inspiron">Dell Inspiron</option>
                                                    </select>
                                                ) : (
                                                    ticket.product || 'N/A'
                                                )}
                                            </td>

                                            <td>
                                                {editingId === ticket._id ? (
                                                    <form
                                                        id={`edit-ticket-${ticket._id}`}
                                                        className="admin-form"
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleSave(ticket._id);
                                                        }}
                                                    >
                                                        <label>
                                                            Product
                                                            <select
                                                                value={editForm.product}
                                                                onChange={(e) =>
                                                                    setEditForm({
                                                                        ...editForm,
                                                                        product: e.target.value,
                                                                    })
                                                                }
                                                                required
                                                            >
                                                                <option value="">Choose product</option>
                                                                <option value="Iphone">Iphone</option>
                                                                <option value="Macbook Pro">Macbook Pro</option>
                                                                <option value="Hp Elitebook">Hp Elitebook</option>
                                                                <option value="Dell Inspiron">Dell Inspiron</option>
                                                            </select>
                                                        </label>

                                                        <label>
                                                            Description
                                                            <textarea
                                                                value={editForm.description}
                                                                onChange={(e) =>
                                                                    setEditForm({
                                                                        ...editForm,
                                                                        description: e.target.value,
                                                                    })
                                                                }
                                                                required
                                                            />
                                                        </label>

                                                        <label>
                                                            Status
                                                            <select
                                                                value={editForm.status}
                                                                onChange={(e) =>
                                                                    setEditForm({
                                                                        ...editForm,
                                                                        status: e.target.value,
                                                                    })
                                                                }
                                                            >
                                                                <option value="new">New</option>
                                                                <option value="open">Open</option>
                                                                <option value="closed">Closed</option>
                                                            </select>
                                                        </label>

                                                        <div className="admin-form-actions">
                                                            <button
                                                                type="submit"
                                                                className="admin-button admin-button-primary"
                                                                disabled={saving}
                                                            >
                                                                {saving ? 'Saving...' : 'Save'}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="admin-button admin-button-secondary"
                                                                onClick={cancelEditing}
                                                                disabled={saving}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    ticket.description || 'No description'
                                                )}
                                            </td>

                                            <td>
                                                {typeof ticket.user === 'object' && ticket.user
                                                    ? ticket.user.name || ticket.user.email || 'Unknown'
                                                    : 'Unknown'}
                                            </td>

                                            <td>
                                                <span className="role-badge role-user">
                                                    {ticket.status || 'new'}
                                                </span>
                                            </td>

                                            <td>
                                                {editingId !== ticket._id && (
                                                    <div className="admin-form-actions">
                                                        <button
                                                            type="button"
                                                            className="admin-button admin-button-primary"
                                                            onClick={() => startEditing(ticket)}
                                                            disabled = {saving}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="admin-button admin-button-danger"
                                                            onClick={() => handleDelete(ticket._id)}
                                                            disabled = {saving || deletingId !== null}
                                                        >
                                                            {deletingId === ticket._id ? 'deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-pagination">
                            <span>
                                Showing {(safePage - 1) * TICKETS_PER_PAGE + 1}–
                                {Math.min(
                                    safePage * TICKETS_PER_PAGE,
                                    filteredTickets.length
                                )}{' '}
                                of {filteredTickets.length}
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

export default AdminTickets;
