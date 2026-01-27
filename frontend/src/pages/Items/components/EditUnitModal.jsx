import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

const EditUnitModal = ({ isOpen, onClose, unit, type, onSave }) => {
    const [formData, setFormData] = useState({});

    // 'type' can be 'device' (phone) or 'other' (accessory/general)

    useEffect(() => {
        if (unit) {
            if (type === 'device') {
                setFormData({
                    imei1: unit.imei1 || '',
                    imei2: unit.imei2 || '',
                    purchase_price: unit.purchase_price || '',
                    selling_price: unit.selling_price || '',
                    warranty_month: unit.warranty_month || '',
                    status: unit.status || 'in_stock',
                    purchase_notes: '', // Notes might not be on the unit directly if it's joined, but let's allow editing if backed supports
                    // Note: Backend updateDevice supports purchase_notes update which updates the linked purchase
                });
            } else {
                setFormData({
                    qty: unit.qty || 0,
                    unit_cost: unit.unit_cost || '',
                    unit_sell_price: unit.unit_sell_price || '',
                    purchase_notes: unit.purchase_notes || ''
                });
            }
        }
    }, [unit, type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(unit.id, formData);
    };

    if (!isOpen || !unit) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}> {/* Higher z-index to sit on top of details modal */}
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
                <div className="modal-header">
                    <h3 style={{ fontWeight: 'bold' }}>Edit {type === 'device' ? 'Device Unit' : 'Stock Entry'}</h3>
                    <button onClick={onClose} className="close-btn"><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div style={{ display: 'grid', gap: '1rem' }}>

                        {type === 'device' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">IMEI 1</label>
                                    <input type="text" className="form-input" value={formData.imei1}
                                        onChange={e => setFormData({ ...formData, imei1: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">IMEI 2</label>
                                    <input type="text" className="form-input" value={formData.imei2}
                                        onChange={e => setFormData({ ...formData, imei2: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Purchase (IQD)</label>
                                        <input type="number" className="form-input" value={formData.purchase_price}
                                            onChange={e => setFormData({ ...formData, purchase_price: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Selling (IQD)</label>
                                        <input type="number" className="form-input" value={formData.selling_price}
                                            onChange={e => setFormData({ ...formData, selling_price: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Warranty (Mos)</label>
                                        <input type="number" className="form-input" value={formData.warranty_month}
                                            onChange={e => setFormData({ ...formData, warranty_month: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select className="form-input" value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="in_stock">In Stock</option>
                                            <option value="sold">Sold</option>
                                            <option value="returned">Returned</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {type === 'other' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Quantity</label>
                                    <input type="number" className="form-input" value={formData.qty}
                                        onChange={e => setFormData({ ...formData, qty: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Unit Cost (IQD)</label>
                                        <input type="number" className="form-input" value={formData.unit_cost}
                                            onChange={e => setFormData({ ...formData, unit_cost: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Unit Sell (IQD)</label>
                                        <input type="number" className="form-input" value={formData.unit_sell_price}
                                            onChange={e => setFormData({ ...formData, unit_sell_price: e.target.value })} />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">Purchase Notes (Edit to update)</label>
                            <textarea className="form-textarea" rows="2" value={formData.purchase_notes}
                                onChange={e => setFormData({ ...formData, purchase_notes: e.target.value })}
                                placeholder="Update notes linked to this purchase..." />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary">
                                <FaSave style={{ marginRight: '0.5rem' }} /> Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUnitModal;
