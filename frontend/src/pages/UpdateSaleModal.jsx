import React, { useState, useEffect } from 'react';


const UpdateSaleModal = ({ sale, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        total_amount: '',
        total_paid: '',
        payment_method: 'cash'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (sale) {
            setFormData({
                customer_name: sale.customer_name || '',
                total_amount: sale.total_amount,
                total_paid: sale.total_paid,
                payment_method: sale.payment_method || 'cash'
            });
        }
    }, [sale]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onUpdate(sale.id, formData);
            onClose();
        } catch (error) {
            console.error("Update Error:", error);
            setError("Failed to update sale");
        } finally {
            setLoading(false);
        }
    };

    if (!sale) return null;

    const modalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };

    const modalContentStyle = {
        backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
        width: '500px', maxWidth: '90%'
    };

    const inputGroupStyle = { marginBottom: '1rem' };
    const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' };
    const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={{ marginTop: 0 }}>Edit Sale</h2>
                {error && (
                    <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Customer Name</label>
                        <input
                            type="text"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Total Amount (IQD)</label>
                        <input
                            type="number"
                            name="total_amount"
                            value={formData.total_amount}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Total Paid (IQD)</label>
                        <input
                            type="number"
                            name="total_paid"
                            value={formData.total_paid}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Payment Method</label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="upi">UPI</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateSaleModal;
