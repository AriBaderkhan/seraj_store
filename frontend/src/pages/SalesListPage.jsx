import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Use navigate for back button
import * as saleService from '../services/saleService';
import { toast } from 'react-hot-toast';
import UpdateSaleModal from './UpdateSaleModal'; // Import the modal

const SalesListPage = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedSaleId, setExpandedSaleId] = useState(null);
    const [expandedItems, setExpandedItems] = useState([]); // Store items for the expanded sale
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [pageError, setPageError] = useState(null); // Add error state

    // Edit State
    const [editingSale, setEditingSale] = useState(null);

    // Initial Fetch
    useEffect(() => {
        fetchSales();
    }, []);

    // Fetch Sales List
    const fetchSales = async (query = '') => {
        try {
            setLoading(true);
            const data = await saleService.findAllSales(query);
            // Sort by date descending if not already
            const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setSales(sorted);
        } catch (error) {
            console.error("Fetch Sales Error:", error);
            setPageError("Failed to load sales history");
        } finally {
            setLoading(false);
        }
    };

    // Handle Search
    const handleSearch = (e) => {
        setSearch(e.target.value);
    };
    const executeSearch = () => {
        fetchSales(search);
    }

    // Expand Row Logic
    const toggleRow = async (saleId) => {
        if (expandedSaleId === saleId) {
            setExpandedSaleId(null);
            setExpandedItems([]);
            return;
        }

        try {
            setExpandedSaleId(saleId);
            setLoadingDetails(true);
            const saleDetails = await saleService.findSale(saleId);
            if (saleDetails && saleDetails.items) {
                setExpandedItems(saleDetails.items);
            } else {
                setExpandedItems([]);
                // toast.error("No items found for this sale."); // Just show empty list or nothing
            }
        } catch (error) {
            console.error("Fetch Sale Details Error:", error);
            setPageError("Failed to load sale details");
        } finally {
            setLoadingDetails(false);
        }
    };

    // --- ACTIONS ---
    const handleDelete = async (saleId, e) => {
        e.stopPropagation(); // Prevent row expand
        if (!window.confirm("Are you sure you want to delete this sale? This action cannot be undone.")) return;

        try {
            await saleService.deleteSale(saleId);
            toast.success("Sale deleted successfully");
            fetchSales(search); // Refresh list
        } catch (error) {
            console.error("Delete Error:", error);
            setPageError("Failed to delete sale");
        }
    };

    const handleEditClick = (sale, e) => {
        e.stopPropagation();
        setEditingSale(sale);
    };

    const handleUpdateSale = async (saleId, updatedData) => {
        try {
            await saleService.updateSale(saleId, updatedData);
            toast.success("Sale updated successfully");
            fetchSales(search); // Refresh list
        } catch (error) {
            throw error; // Let modal handle error toast
        }
    };

    // --- DATE FORMATTER ---
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // Ensure string is treated as UTC if lacking timezone info, or standard parsing
        // If the problem is that it's just wrong, we might need to debug. 
        // But assuming standard ISO from DB:
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    // --- STYLES ---
    const tableHeaderStyle = { padding: '1rem', borderBottom: '2px solid #eee', fontWeight: 'bold', color: '#666', fontSize: '0.9rem', textAlign: 'left' };
    const tableCellStyle = { padding: '1rem', borderBottom: '1px solid #f0f0f0', color: '#333' };

    let x = 1;
    return (
        <div style={{ padding: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/selling')} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>
                        ← Back
                    </button>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1f2937' }}>Sales History</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search by Customer Name..."
                        value={search}
                        onChange={handleSearch}
                        onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                        style={{ padding: '0.6rem', width: '300px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none' }}
                    />
                    <button onClick={executeSearch} style={{ padding: '0.6rem 1.2rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Search
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {
                pageError && (
                    <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{pageError}</span>
                        <button onClick={() => setPageError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontWeight: 'bold' }}>&times;</button>
                    </div>
                )
            }

            {/* Table Container */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={tableHeaderStyle}>#</th>
                            <th style={tableHeaderStyle}>Customer</th>
                            <th style={tableHeaderStyle}>Date</th>
                            <th style={tableHeaderStyle}>Total</th>
                            <th style={tableHeaderStyle}>Paid / Remaining</th>
                            <th style={tableHeaderStyle}>Status</th>
                            <th style={tableHeaderStyle}>Actions</th>
                            <th style={tableHeaderStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No sales found.</td></tr>
                        ) : (
                            sales.map((sale, index) => (
                                <React.Fragment key={sale.id}>
                                    {/* Main Row */}
                                    <tr
                                        onClick={() => toggleRow(sale.id)}
                                        style={{ cursor: 'pointer', background: expandedSaleId === sale.id ? '#f0f9ff' : 'white', transition: 'background 0.2s' }}
                                    >
                                        <td style={tableCellStyle}>{index + 1}</td>
                                        <td style={tableCellStyle}>{sale.customer_name || 'No Name'}</td>
                                        <td style={tableCellStyle}>{formatDate(sale.created_at)}</td>
                                        <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>IQD {Number(sale.total_amount).toLocaleString()}</td>
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.95rem' }}>
                                                <span style={{ color: 'green' }}>Paid: IQD {Number(sale.total_paid).toLocaleString()}</span>
                                                {(Number(sale.total_amount) - Number(sale.total_paid)) > 0 &&
                                                    <span style={{ color: 'red' }}>Due: IQD {(Number(sale.total_amount) - Number(sale.total_paid)).toLocaleString()}</span>
                                                }
                                            </div>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                background: (Number(sale.total_amount) - Number(sale.total_paid)) <= 0 ? '#DEF7EC' : '#FDE8E8',
                                                color: (Number(sale.total_amount) - Number(sale.total_paid)) <= 0 ? '#03543F' : '#9B1C1C',
                                                fontWeight: 'bold'
                                            }}>
                                                {(Number(sale.total_amount) - Number(sale.total_paid)) <= 0 ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => handleEditClick(sale, e)}
                                                    style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(sale.id, e)}
                                                    style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                        <td style={tableCellStyle}>{expandedSaleId === sale.id ? '▲' : '▼'}</td>
                                    </tr>

                                    {/* Expandable Details Row */}
                                    {expandedSaleId === sale.id && (
                                        <tr>
                                            <td colSpan="8" style={{ padding: 0, borderBottom: '1px solid #e5e7eb' }}>
                                                <div style={{ background: '#f9fafb', padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                                                    {loadingDetails ? (
                                                        <div>Loading items...</div>
                                                    ) : (
                                                        <div>
                                                            <h4 style={{ margin: '0 0 1rem 0', color: '#4b5563' }}>Items in this Sale</h4>
                                                            <table style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}>
                                                                <thead>
                                                                    <tr style={{ background: '#f3f4f6' }}>
                                                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280' }}>Item Name</th>
                                                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280' }}>Qty</th>
                                                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280' }}>Unit Price</th>
                                                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280' }}>IMEI (if any)</th>
                                                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280' }}>Warranty_start</th>
                                                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280' }}>Warranty_end</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {expandedItems.map((item, idx) => (
                                                                        <tr key={idx} style={{ borderTop: '1px solid #f3f4f6' }}>
                                                                            <td style={{ padding: '0.75rem', color: '#374151' }}>{item.item_name}</td>
                                                                            <td style={{ padding: '0.75rem', color: '#374151' }}>{item.quantity}</td>
                                                                            <td style={{ padding: '0.75rem', color: '#374151' }}>IQD {Number(item.unit_price).toLocaleString()}</td>
                                                                            <td style={{ padding: '0.75rem', color: '#374151', fontFamily: 'monospace' }}>{item.imei || '-'}</td>
                                                                            <td style={{ padding: '0.75rem', color: '#374151', fontSize: '0.85rem' }}>
                                                                                {item.warranty_start_date ?
                                                                                    ` ${new Date(item.warranty_start_date).toLocaleDateString()}` :
                                                                                    '-'
                                                                                }
                                                                            </td>
                                                                            <td style={{ padding: '0.75rem', color: '#374151', fontSize: '0.85rem' }}>
                                                                                {item.warranty_end_date ?
                                                                                    ` ${new Date(item.warranty_end_date).toLocaleDateString()}` :
                                                                                    '-'
                                                                                }
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <UpdateSaleModal
                sale={editingSale}
                onClose={() => setEditingSale(null)}
                onUpdate={handleUpdateSale}
            />
        </div >
    );
};

export default SalesListPage;
