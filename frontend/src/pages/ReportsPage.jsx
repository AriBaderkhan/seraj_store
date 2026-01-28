import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilePdf } from 'react-icons/fa';
import { useExpenses } from '../hooks/useExpenses';
import toast from 'react-hot-toast';

const ReportsPage = () => {
    const navigate = useNavigate();

    // Hook
    const {
        expenses,
        loading,
        availableMonths,
        availableTypes,
        fetchMetadata,
        fetchExpenses,
        createExpense,
        getExpense,
        updateExpense,
        deleteExpense,
        setAvailableTypes
    } = useExpenses();

    // Local State
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // Add/Edit Expense Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null); // For Edit Mode
    const [newExpense, setNewExpense] = useState({
        type: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        note: ''
    });

    // Add Type Modal State
    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
    const [newType, setNewType] = useState('');

    // --- Report State ---
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null); // Add error state

    const handleDownloadReport = async () => {
        setError(null);
        if (!reportMonth) {
            setError("Please select a month");
            return;
        }

        try {
            setDownloading(true);
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${baseUrl}/api/report/monthly_pdf?month=${reportMonth}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to download report");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Monthly_Report_${reportMonth}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Report downloaded successfully");
        } catch (error) {
            console.error("Download error:", error);
            setError(error.message);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        // Fetch expenses whenever filters change
        fetchExpenses({ month: selectedMonth, type: selectedType });
    }, [selectedMonth, selectedType, fetchExpenses]);


    const handleAddType = () => {
        setError(null);
        if (!newType.trim()) {
            setError("Type name is required");
            return;
        }

        // Optimistically add to local list
        const newTypeObj = { type: newType };
        setAvailableTypes(prev => [...prev, newTypeObj]);

        setSelectedType(newType);
        setNewExpense(prev => ({ ...prev, type: newType }));
        setIsAddTypeModalOpen(false);
        setNewType('');
        toast.success("Type added temporarily. Pass it when creating expense.");
    };

    const handleSubmitExpense = async () => {
        setError(null);
        if (!newExpense.amount || !newExpense.type || !newExpense.expense_date) {
            setError("Please fill all required fields");
            return;
        }

        let success = false;
        if (editingExpenseId) {
            // UPDATE Mode
            success = await updateExpense(editingExpenseId, newExpense);
            if (success) toast.success("Expense updated successfully");
        } else {
            // CREATE Mode
            success = await createExpense(newExpense);
            if (success) toast.success("Expense created successfully");
        }

        if (success) {
            setIsAddModalOpen(false);
            setEditingExpenseId(null); // Reset edit mode
            fetchExpenses({ month: selectedMonth, type: selectedType });
            fetchMetadata(); // Refresh types/months

            // Reset form
            setNewExpense({
                type: '',
                amount: '',
                expense_date: new Date().toISOString().split('T')[0],
                note: ''
            });
        }
    };

    const handleEditClick = (expense) => {
        setEditingExpenseId(expense.id);
        setNewExpense({
            type: expense.type,
            amount: expense.amount,
            expense_date: new Date(expense.expense_date).toISOString().split('T')[0],
            note: expense.note || ''
        });
        setIsAddModalOpen(true);
    };

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewExpense, setViewExpense] = useState(null);

    const handleViewClick = async (expense) => {
        const data = await getExpense(expense.id);
        if (data) {
            setViewExpense(data.data || data); // handle if wrapper exists
            setIsViewModalOpen(true);
        }
    };

    const handleDeleteClick = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        const success = await deleteExpense(expenseId);
        if (success) {
            toast.success("Expense deleted successfully");
            fetchExpenses({ month: selectedMonth, type: selectedType });
            fetchMetadata();
        }
    };

    const openAddModal = () => {
        setEditingExpenseId(null);
        setNewExpense({
            type: '',
            amount: '',
            expense_date: new Date().toISOString().split('T')[0],
            note: ''
        });
        setIsAddModalOpen(true);
    }

    // --- STYLES (Matching SalesListPage) ---
    const inputStyle = {
        padding: '0.6rem', // Adjusted slightly for this page if needed, but keeping consistent
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '0.9rem',
        outline: 'none'
    };

    const selectStyle = {
        ...inputStyle,
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        backgroundColor: 'white',
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.2rem',
        paddingRight: '2rem', // Ensure text doesn't overlap arrow
        cursor: 'pointer'
    };

    const tableHeaderStyle = { padding: '1rem', borderBottom: '2px solid #eee', fontWeight: 'bold', color: '#666', fontSize: '0.9rem', textAlign: 'left' };
    const tableCellStyle = { padding: '1rem', borderBottom: '1px solid #f0f0f0', color: '#333' };

    let x = 1;

    return (
        <div style={{ padding: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1f2937' }}>Expenses Management</h1>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    {/* Report Section */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginRight: '1rem', paddingRight: '1rem', borderRight: 'none' }}>
                        <span style={{ fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>Monthly Report:</span>
                        <input
                            type="month"
                            value={reportMonth}
                            max={new Date().toISOString().slice(0, 7)}
                            min="2026-01"
                            onChange={(e) => setReportMonth(e.target.value)}
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                        <button
                            onClick={handleDownloadReport}
                            disabled={downloading}
                            style={{
                                padding: '0.5rem 1rem',
                                background: downloading ? '#ccc' : '#e67e22',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: downloading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {downloading ? 'Downloading...' : <><FaFilePdf /> Download PDF</>}
                        </button>
                    </div>

                    {/* Filters */}
                    <select
                        style={selectStyle}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="">All Months</option>
                        {availableMonths.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">All Types</option>
                        {availableTypes.map((t, idx) => (
                            <option key={idx} value={t.type}>{t.type}</option>
                        ))}
                    </select>

                    <button
                        onClick={openAddModal}
                        style={{ padding: '0.6rem 1.2rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaPlus /> Add Expense
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'auto', flex: 1 }}>
                <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ ...tableHeaderStyle, width: '5%' }}>#</th>
                            <th style={{ ...tableHeaderStyle, width: '15%' }}>Date</th>
                            <th style={{ ...tableHeaderStyle, width: '15%' }}>Type</th>
                            <th style={{ ...tableHeaderStyle, width: '20%' }}>Note</th>
                            <th style={{ ...tableHeaderStyle, width: '15%' }}>Amount</th>
                            <th style={{ ...tableHeaderStyle, width: '10%' }}>Actions</th>

                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading expenses...</td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No expenses found.</td></tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} style={{ background: 'white', transition: 'background 0.2s' }}>
                                    <td style={tableCellStyle}>{x++}</td>
                                    <td style={tableCellStyle}>
                                        {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={{ padding: '0.25rem 0.5rem', background: '#F0FDF4', color: '#15803d', borderRadius: '4px', border: '1px solid #DCFCE7', fontSize: '0.85rem' }}>
                                            {expense.type}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>{expense.note || '-'}</td>
                                    <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>IQD {Number(expense.amount).toLocaleString()}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleViewClick(expense)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', marginRight: '1rem', fontSize: '1rem' }}
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(expense)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', marginRight: '1rem', fontSize: '1rem' }}
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(expense.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem' }}
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODALS */}

            {/* Add/Edit Expense Modal */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '450px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Type (Company)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        value={newExpense.type}
                                        onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                                        style={{ flex: 1, padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    >
                                        <option value="">Select Type</option>
                                        {availableTypes.map((t, idx) => (
                                            <option key={idx} value={t.type}>{t.type}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setIsAddTypeModalOpen(true)}
                                        style={{ padding: '0.6rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                                        title="Add New Type"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Amount</label>
                                <input
                                    type="number"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Date</label>
                                <input
                                    type="date"
                                    value={newExpense.expense_date}
                                    onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Note (Optional)</label>
                                <textarea
                                    value={newExpense.note}
                                    onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px' }}
                                ></textarea>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                style={{ padding: '0.6rem 1.2rem', color: '#4b5563', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitExpense}
                                style={{ padding: '0.6rem 1.2rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                            >
                                {editingExpenseId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Type Modal */}
            {isAddTypeModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '350px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>Add New Type</h2>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Type Name</label>
                            <input
                                type="text"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                placeholder="e.g. Rent, Utilities"
                                autoFocus
                            />
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={() => setIsAddTypeModalOpen(false)}
                                style={{ padding: '0.6rem 1.2rem', color: '#4b5563', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddType}
                                style={{ padding: '0.6rem 1.2rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Add Type
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Expense Modal */}
            {isViewModalOpen && viewExpense && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Expense Details</h2>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
                            >&times;</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#111827' }}>{viewExpense.type}</div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</label>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>IQD {Number(viewExpense.amount).toLocaleString()}</div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
                                <div style={{ fontSize: '1rem', color: '#374151' }}>
                                    {viewExpense.expense_date ? new Date(viewExpense.expense_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note</label>
                                <div style={{ fontSize: '1rem', color: '#374151', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: '60px' }}>
                                    {viewExpense.note || 'No notes provided.'}
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af' }}>Created By</label>
                                    <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>{viewExpense.processed_by || 'Unknown'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af' }}>Created At</label>
                                    <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                                        {viewExpense.created_at ? new Date(viewExpense.created_at).toLocaleString() : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                style={{ padding: '0.75rem 1.5rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ReportsPage;
