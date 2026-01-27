import React, { useState } from 'react';
import { FaTimes, FaEdit, FaTrash, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import EditUnitModal from './EditUnitModal';
import * as itemService from '../../../services/itemService';
import useSale from '../../../hooks/useSale';

const ItemDetailsModal = ({ isOpen, onClose, data, onRefresh }) => {
    const [editModal, setEditModal] = useState({ open: false, unit: null, type: null });
    const [error, setError] = useState(null);
    const { addToCart } = useSale();

    console.log("ItemDetailsModal Render:", { isOpen, data });

    if (!isOpen) return null;
    if (!data) {
        console.log("ItemDetailsModal: No Data provided");
        return null;
    }

    try {
        const handleEditClick = (unit, type) => {
            setEditModal({ open: true, unit, type });
        };

        const handleSaveUnit = async (id, formData) => {
            try {
                if (editModal.type === 'device') {
                    await itemService.updateDevice(id, formData);
                } else {
                    await itemService.updateOtherItem(id, formData);
                }
                toast.success("Unit updated successfully");
                setEditModal({ open: false, unit: null, type: null });
                if (onRefresh) onRefresh();
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error("Update failed", error);
                setError("Failed to update unit");
            }
        };

        const handleDeleteClick = async (id, type) => {
            if (!window.confirm("Are you sure you want to delete this unit? This cannot be undone.")) return;
            try {
                if (type === 'device') {
                    await itemService.deleteDevice(id);
                } else {
                    await itemService.deleteOtherItem(id);
                }
                toast.success("Unit deleted successfully");
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error("Delete failed", error);
                setError("Failed to delete unit");
            }
        };

        // Safely get IMEI and Purchase arrays
        const imeis = Array.isArray(data.imeis) ? data.imeis : [];
        const purchaseBatches = Array.isArray(data.purchase) ? data.purchase : [];

        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '1000px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div className="modal-header">
                        <h3 style={{ fontWeight: 'bold' }}>Item Details</h3>
                        <button onClick={onClose} className="close-btn"><FaTimes /></button>
                    </div>
                    <div className="modal-body">
                        {error && (
                            <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div>
                                {data.image_path ? (
                                    <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:1999'}${data.image_path}`} alt={data.name} className="item-image" style={{ width: '100%', height: '300px', objectFit: 'contain', background: '#f9fafb' }} />
                                ) : (
                                    <div className="item-image" style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>No Image</div>
                                )}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{data.name}</h2>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{data.brand_name} | {data.category_name}</div>

                                <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: '#F9FAFB', border: 'none' }}>
                                    <p style={{ margin: 0, lineHeight: '1.6' }}>{data.details || 'No additional details available.'}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {!!data.is_imei_required ? (
                                        <>
                                            <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '4px' }}>{data.storage}</span>
                                            <span className="badge" style={{ background: '#F0FDF4', color: '#16A34A', padding: '4px 8px', borderRadius: '4px' }}>{data.color}</span>
                                        </>
                                    ) : (
                                        <span className="badge" style={{ background: '#FFF7ED', color: '#C2410C', padding: '4px 8px', borderRadius: '4px' }}>
                                            Total Stock: {data.stock_qty}
                                        </span>
                                    )}
                                    {data.serial_no && (
                                        <span className="badge" style={{ background: '#F3F4F6', color: '#374151', padding: '4px 8px', borderRadius: '4px' }}>
                                            S/N: {data.serial_no}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!!data.is_imei_required && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--primary-color)', display: 'inline-block', paddingBottom: '0.5rem' }}>Stock Units (IMEI)</h4>
                                {imeis.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>IMEI 1</th>
                                                    <th>IMEI 2</th>
                                                    <th>Buy Price</th>
                                                    <th>Sell Price</th>
                                                    <th>Warranty</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {imeis.map(imei => (
                                                    <tr key={imei.id}>
                                                        <td>{imei.imei1}</td>
                                                        <td>{imei.imei2 || '-'}</td>
                                                        <td>IQD {imei.purchase_price}</td>
                                                        <td>{imei.selling_price ? `IQD ${imei.selling_price}` : '-'}</td>
                                                        <td>{imei.warranty_month ? `${imei.warranty_month}m` : '-'}</td>
                                                        <td>
                                                            <span style={{ color: imei.status === 'in_stock' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                                {imei.status === 'in_stock' ? 'In Stock' : imei.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button onClick={() => handleEditClick(imei, 'device')} className="btn-icon" style={{ color: '#4F46E5' }} title="Edit">
                                                                    <FaEdit />
                                                                </button>
                                                                <button onClick={() => handleDeleteClick(imei.id, 'device')} className="btn-icon" style={{ color: '#C81E1E' }} title="Delete">
                                                                    <FaTrash />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const itemPayload = {
                                                                            id: data.id,
                                                                            name: data.name,
                                                                            item_type: 'phone',
                                                                            imei1: imei.imei1,
                                                                            selling_price: imei.selling_price
                                                                        };
                                                                        if (addToCart) addToCart(itemPayload, 1);
                                                                    }}
                                                                    className="btn-icon"
                                                                    style={{ color: '#16A34A' }}
                                                                    title="Sell"
                                                                >
                                                                    <FaShoppingCart />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '4px', textAlign: 'center', color: '#666' }}>
                                        No stock units available. Add new stock to see it here.
                                    </div>
                                )}
                            </div>
                        )}

                        {!data.is_imei_required && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--primary-color)', display: 'inline-block', paddingBottom: '0.5rem' }}>Purchase Batches</h4>
                                {purchaseBatches.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>Qty</th>
                                                    <th>Unit Cost</th>
                                                    <th>Unit Sell</th>
                                                    <th>Notes</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {purchaseBatches.map(p => (
                                                    <tr key={p.id}>
                                                        <td>{p.qty}</td>
                                                        <td>IQD {p.unit_cost}</td>
                                                        <td>{p.unit_sell_price ? `IQD ${p.unit_sell_price}` : '-'}</td>
                                                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.purchase_notes || '-'}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button onClick={() => handleEditClick(p, 'other')} className="btn-icon" style={{ color: '#4F46E5' }} title="Edit">
                                                                    <FaEdit />
                                                                </button>
                                                                <button onClick={() => handleDeleteClick(p.id, 'other')} className="btn-icon" style={{ color: '#C81E1E' }} title="Delete">
                                                                    <FaTrash />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const itemPayload = {
                                                                            id: data.id,
                                                                            name: data.name,
                                                                            item_type: 'product',
                                                                            stock_qty: data.stock_qty,
                                                                            selling_price: p.unit_sell_price
                                                                        };
                                                                        if (addToCart) addToCart(itemPayload, 1);
                                                                    }}
                                                                    className="btn-icon"
                                                                    style={{ color: '#16A34A' }}
                                                                    title="Sell"
                                                                >
                                                                    <FaShoppingCart />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '4px', textAlign: 'center', color: '#666' }}>
                                        No purchase batches available. Add new stock to see it here.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <EditUnitModal
                    isOpen={editModal.open}
                    onClose={() => setEditModal({ open: false, unit: null, type: null })}
                    unit={editModal.unit}
                    type={editModal.type}
                    onSave={handleSaveUnit}
                />
            </div >
        );
    } catch (error) {
        console.error("ItemDetailsModal Crash:", error);
        return <div style={{ padding: '2rem', color: 'red' }}>Error loading item details: {error.message}</div>;
    }
};

export default ItemDetailsModal;
