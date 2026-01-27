import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

const AddPurchaseModal = ({ isOpen, onClose, item, onSave }) => {
    const [formData, setFormData] = useState({
        imei1: '',
        imei2: '',
        purchase_price: '',
        selling_price: '',
        warranty_month: '',
        status: 'in_stock',
        purchase_notes: '',
        qty: '',
        unit_cost: '',
        unit_sell_price: '',
        phone_detail: '',
        other_item_detail: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                imei1: '',
                imei2: '',
                purchase_price: '',
                selling_price: '',
                warranty_month: '',
                status: 'in_stock',
                purchase_notes: '',
                qty: '',
                unit_cost: '',
                unit_sell_price: '',
                phone_detail: '',
                other_item_detail: ''
            });
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            purchase_notes: formData.purchase_notes
        };

        if (isPhone) {
            payload.imei1 = formData.imei1;
            payload.imei2 = formData.imei2;
            payload.status = formData.status;
            payload.phone_detail = formData.phone_detail;

            // Handle numeric fields - only add if they have values to avoid empty string validation errors
            if (formData.purchase_price) payload.purchase_price = Number(formData.purchase_price);
            if (formData.selling_price) payload.selling_price = Number(formData.selling_price);
            if (formData.warranty_month) payload.warranty_month = Number(formData.warranty_month);

        } else {
            payload.other_item_detail = formData.other_item_detail;

            if (formData.qty) payload.qty = Number(formData.qty);
            if (formData.unit_cost) payload.unit_cost = Number(formData.unit_cost);
            if (formData.unit_sell_price) payload.unit_sell_price = Number(formData.unit_sell_price);
        }

        onSave(item.id, payload);
    };

    if (!isOpen || !item) return null;

    const isPhone = item.is_imei_required;

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
                <div className="modal-header">
                    <h3 style={{ fontWeight: 'bold' }}>Add Stock for {item.name}</h3>
                    <button onClick={onClose} className="close-btn"><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div style={{ display: 'grid', gap: '1rem' }}>

                        {isPhone ? (
                            <>
                                <div className="form-group">
                                    <label className="form-label">IMEI 1</label>
                                    <input type="text" className="form-input" value={formData.imei1} required
                                        onChange={e => setFormData({ ...formData, imei1: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">IMEI 2 (Optional)</label>
                                    <input type="text" className="form-input" value={formData.imei2}
                                        onChange={e => setFormData({ ...formData, imei2: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Purchase (IQD)</label>
                                        <input type="number" className="form-input" value={formData.purchase_price} required
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
                                        <label className="form-label">Detail</label>
                                        <input type="text" className="form-input" value={formData.phone_detail}
                                            onChange={e => setFormData({ ...formData, phone_detail: e.target.value })} placeholder="e.g. US Version" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Quantity</label>
                                    <input type="number" className="form-input" value={formData.qty} required min="1"
                                        onChange={e => setFormData({ ...formData, qty: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Unit Cost (IQD)</label>
                                        <input type="number" className="form-input" value={formData.unit_cost} required
                                            onChange={e => setFormData({ ...formData, unit_cost: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Unit Sell (IQD)</label>
                                        <input type="number" className="form-input" value={formData.unit_sell_price}
                                            onChange={e => setFormData({ ...formData, unit_sell_price: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Detail</label>
                                    <input type="text" className="form-input" value={formData.other_item_detail}
                                        onChange={e => setFormData({ ...formData, other_item_detail: e.target.value })} placeholder="e.g. Batch #5" />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">Purchase Notes</label>
                            <textarea className="form-textarea" rows="2" value={formData.purchase_notes}
                                onChange={e => setFormData({ ...formData, purchase_notes: e.target.value })}
                                placeholder="Notes about this purchase..." />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary">
                                <FaSave style={{ marginRight: '0.5rem' }} /> Add Purchase
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPurchaseModal;
