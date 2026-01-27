import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

const EditItemModal = ({ isOpen, onClose, item, categories, brands, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', brand_id: '', category_id: '', details: '',
        color: '', storage: '', sim_type: '', imei1: '', imei2: '',
        purchase_price: '', selling_price: '', warranty_month: '',
        stock_qty: '', unit_cost: '', unit_sell_price: '', purchase_notes: '', serial_no: ''
    });
    const [image, setImage] = useState(null);

    // Determine type safely
    const isPhone = item ? (item.is_imei_required === true || item.is_imei_required === 1 || item.category_name?.toLowerCase().includes('phone')) : false;

    useEffect(() => {
        if (item) {
            // For phones, if we have IMEIs, pick the first one's pricing as default/representative
            const firstImei = (item.imeis && item.imeis.length > 0) ? item.imeis[0] : {};
            // For others, use item fields directly or purchase info if available
            const purchaseInfo = (item.purchase && item.purchase.length > 0) ? item.purchase[0] : {};

            setFormData({
                name: item.name || '',
                brand_id: item.brand_id || '',
                category_id: item.category_id || '',
                details: item.details || '',
                serial_no: item.serial_no || '',

                // Phone Specifics
                color: item.color || '',
                storage: item.storage || '',
                sim_type: item.sim_type || '',

                // Pricing / Warranty (Phone: from firstImei, Other: from purchaseInfo/item)
                purchase_price: firstImei.purchase_price || item.purchase_price || '',
                selling_price: firstImei.selling_price || item.selling_price || '',
                warranty_month: firstImei.warranty_month || item.warranty_month || '',

                // General Item Specifics
                stock_qty: item.stock_qty || '0',
                unit_cost: purchaseInfo.unit_cost || item.unit_cost || '',
                unit_sell_price: purchaseInfo.unit_sell_price || item.unit_sell_price || '',
                purchase_notes: purchaseInfo.purchase_notes || item.purchase_notes || ''
            });
            setImage(null);
        }
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData();
        // Core Fields
        data.append('name', formData.name);
        data.append('brand_id', formData.brand_id);
        data.append('category_id', formData.category_id);
        data.append('details', formData.details || '');
        data.append('serial_no', formData.serial_no || '');

        if (image) data.append('image', image);

        // Type Specific Fields
        if (isPhone) {
            data.append('color', formData.color || '');
            data.append('storage', formData.storage || '');
            data.append('sim_type', formData.sim_type || '');

            // Pricing & Warranty for Phones
            data.append('purchase_price', formData.purchase_price || '');
            data.append('selling_price', formData.selling_price || '');
            data.append('warranty_month', formData.warranty_month || '');
        } else {
            // General Items
            data.append('stock_qty', formData.stock_qty || 0);
            data.append('unit_cost', formData.unit_cost || '');
            data.append('unit_sell_price', formData.unit_sell_price || '');
            data.append('purchase_notes', formData.purchase_notes || '');
        }

        onSave(item.id, data);
    };

    if (!isOpen || !item) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h3 style={{ fontWeight: 'bold' }}>Edit {isPhone ? 'Phone' : 'Item'}</h3>
                    <button onClick={onClose} className="close-btn"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* --- Grid Layout for Desktop, Stack for Mobile --- */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                        {/* LHS: Basic Info */}
                        <div>
                            <div className="section-header" style={{ borderBottom: '1px solid #eee', marginBottom: '1rem', paddingBottom: '0.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                Basic Information
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Item Name <span style={{ color: 'red' }}>*</span></label>
                                    <input type="text" className="form-input" required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category <span style={{ color: 'red' }}>*</span></label>
                                    <select className="form-input" required
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Brand <span style={{ color: 'red' }}>*</span></label>
                                    <select className="form-input" required
                                        value={formData.brand_id}
                                        onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}>
                                        <option value="">Select Brand</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Serial Number <span style={{ fontSize: '0.8em', color: '#999' }}>(Optional)</span></label>
                                    <input type="text" className="form-input"
                                        value={formData.serial_no}
                                        onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* RHS: Specifics & Pricing */}
                        <div>
                            {isPhone ? (
                                <>
                                    <div className="section-header" style={{ borderBottom: '1px solid #eee', marginBottom: '1rem', paddingBottom: '0.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                        Specs & Pricing
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Color</label>
                                            <input type="text" className="form-input" value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Storage</label>
                                            <select className="form-input" value={formData.storage}
                                                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}>
                                                <option value="">Select</option>
                                                <option value="64GB">64GB</option>
                                                <option value="128GB">128GB</option>
                                                <option value="256GB">256GB</option>
                                                <option value="512GB">512GB</option>
                                                <option value="1TB">1TB</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">SIM Type</label>
                                            <select className="form-input" value={formData.sim_type}
                                                onChange={(e) => setFormData({ ...formData, sim_type: e.target.value })}>
                                                <option value="One SIM">One SIM</option>
                                                <option value="eSIM">eSIM</option>
                                                <option value="Dual SIM">Dual SIM</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Warranty (Mon)</label>
                                            <input type="number" className="form-input" value={formData.warranty_month}
                                                onChange={(e) => setFormData({ ...formData, warranty_month: e.target.value })} placeholder="e.g. 12" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Purchase (IQD)</label>
                                            <input type="number" className="form-input" value={formData.purchase_price}
                                                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Selling (IQD)</label>
                                            <input type="number" className="form-input" value={formData.selling_price}
                                                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="section-header" style={{ borderBottom: '1px solid #eee', marginBottom: '1rem', paddingBottom: '0.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                        Inventory & Pricing
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Stock Qty</label>
                                            <input type="number" className="form-input" value={formData.stock_qty}
                                                onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Unit Cost (IQD)</label>
                                            <input type="number" className="form-input" value={formData.unit_cost}
                                                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Unit Sell (IQD)</label>
                                            <input type="number" className="form-input" value={formData.unit_sell_price}
                                                onChange={(e) => setFormData({ ...formData, unit_sell_price: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label className="form-label">Purchase Notes</label>
                                        <textarea className="form-textarea" rows="2"
                                            value={formData.purchase_notes}
                                            onChange={(e) => setFormData({ ...formData, purchase_notes: e.target.value })} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* --- Footer / Description --- */}
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label">Details / Description</label>
                                <textarea className="form-textarea" rows="3"
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Update Image <span style={{ fontSize: '0.8em', color: '#999' }}>(Optional)</span></label>
                                <input type="file" onChange={(e) => setImage(e.target.files[0])} className="form-input" accept="image/*" />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ background: '#f3f4f6', color: '#333' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            <FaSave style={{ marginRight: '0.5rem' }} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemModal;
