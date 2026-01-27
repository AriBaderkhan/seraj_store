import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../../hooks/useItems';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '../../hooks/useBrands';
import { FaSave, FaArrowLeft, FaMobileAlt, FaBox } from 'react-icons/fa';
import { createItemFormData } from '../../utils/formUtils';

// --- Sub-components for cleaner structure ---

const ItemTypeToggle = ({ isPhone, setIsPhone }) => (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
            type="button"
            onClick={() => setIsPhone(true)}
            className="btn"
            style={{
                flex: 1,
                background: isPhone ? 'var(--primary-color)' : '#f3f4f6',
                color: isPhone ? 'white' : '#6b7280',
                gap: '0.5rem',
                transition: 'all 0.2s'
            }}>
            <FaMobileAlt /> Mobile Phone
        </button>
        <button
            type="button"
            onClick={() => setIsPhone(false)}
            className="btn"
            style={{
                flex: 1,
                background: !isPhone ? 'var(--primary-color)' : '#f3f4f6',
                color: !isPhone ? 'white' : '#6b7280',
                gap: '0.5rem',
                transition: 'all 0.2s'
            }}>
            <FaBox /> General Item
        </button>
    </div>
);

const PhoneFields = ({ formData, handleChange }) => (
    <>
        <div className="form-group">
            <label className="form-label">Color</label>
            <input type="text" name="color" className="form-input" value={formData.color} onChange={handleChange} placeholder="e.g. Natural Titanium" />
        </div>
        <div className="form-group">
            <label className="form-label">Storage</label>
            <select name="storage" className="form-input" value={formData.storage} onChange={handleChange}>
                <option value="">Select Storage</option>
                <option value="64GB">64GB</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
                <option value="1TB">1TB</option>
            </select>
        </div>
        <div className="form-group">
            <label className="form-label">SIM Type</label>
            <select name="sim_type" className="form-input" value={formData.sim_type} onChange={handleChange}>
                <option value="">Select SIM</option>
                <option value="One SIM">One SIM</option>
                <option value="eSIM">eSIM</option>
                <option value="Dual SIM">Dual SIM</option>
            </select>
        </div>
        <div className="form-group">
            <label className="form-label">Purchase Price (IQD)</label>
            <input type="number" name="purchase_price" className="form-input" value={formData.purchase_price} onChange={handleChange} placeholder="0.00" />
        </div>
        <div className="form-group">
            <label className="form-label">Selling Price (IQD)</label>
            <input type="number" name="selling_price" className="form-input" value={formData.selling_price} onChange={handleChange} placeholder="0.00" />
        </div>
        <div className="form-group">
            <label className="form-label">Warranty (Months) <span style={{ color: '#9ca3af', fontSize: '0.85em' }}>(Optional)</span></label>
            <input type="number" name="warranty_month" className="form-input" value={formData.warranty_month} onChange={handleChange} placeholder="e.g. 12" />
        </div>
        <div className="form-group">
            <label className="form-label">IMEI 1 <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="imei1" className="form-input" required value={formData.imei1} onChange={handleChange} placeholder="Primary IMEI" />
        </div>
        <div className="form-group">
            <label className="form-label">IMEI 2 <span style={{ color: '#9ca3af', fontSize: '0.85em' }}>(Optional)</span></label>
            <input type="text" name="imei2" className="form-input" value={formData.imei2} onChange={handleChange} placeholder="Secondary IMEI" />
        </div>
    </>
);

const GeneralItemFields = ({ formData, handleChange }) => (
    <>
        <div className="form-group">
            <label className="form-label">Starting Stock Quantity <span style={{ color: '#9ca3af', fontSize: '0.85em' }}>(Optional)</span></label>
            <input type="number" name="stock_qty" className="form-input" value={formData.stock_qty} onChange={handleChange} placeholder="0" />
        </div>
        <div className="form-group">
            <label className="form-label">Unit Cost (IQD)</label>
            <input type="number" name="unit_cost" className="form-input" value={formData.unit_cost} onChange={handleChange} placeholder="0.00" />
        </div>
        <div className="form-group">
            <label className="form-label">Unit Sell Price (IQD)</label>
            <input type="number" name="unit_sell_price" className="form-input" value={formData.unit_sell_price} onChange={handleChange} placeholder="0.00" />
        </div>
    </>
);

// --- Main Component ---

const AddItemPage = () => {
    const navigate = useNavigate();
    const { addItem, loading } = useItems();
    const { categories } = useCategories();
    const { fetchBrandsByCategory } = useBrands();

    // State
    const [isPhone, setIsPhone] = useState(true);
    const [image, setImage] = useState(null);
    const [filteredBrands, setFilteredBrands] = useState([]);

    const [formData, setFormData] = useState({
        name: '', brand_id: '', category_id: '', details: '',
        color: '', storage: '', sim_type: '', imei1: '', imei2: '',
        purchase_price: '', stock_qty: '0', unit_cost: '0', purchase_notes: '',
        serial_no: '', warranty_month: '', selling_price: '', unit_sell_price: ''
    });

    // Effect: Fetch brands when category changes
    useEffect(() => {
        if (formData.category_id) {
            fetchBrandsByCategory(formData.category_id)
                .then(data => setFilteredBrands(data))
                .catch(console.error);
        } else {
            setFilteredBrands([]);
        }
        // NOTE: We don't reset brand_id here to avoid loops, but user must re-select if they change category.
        // Actually, strictly speaking, if category changes, brand usually becomes invalid.
        // Let's handle brand reset in the handler for better UX, or here if we track 'prevCategory'.
    }, [formData.category_id, fetchBrandsByCategory]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // If category changed, reset brand
            if (name === 'category_id' && prev.category_id !== value) {
                newData.brand_id = '';
            }
            return newData;
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.category_id || !formData.brand_id || !formData.name) {
            // Let HTML5 required handle this, but double check logic if needed
            return;
        }

        const data = createItemFormData(formData, image, isPhone);
        const success = await addItem(data);
        if (success) navigate('/items');
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate('/items')} className="btn" style={{ background: 'white', padding: '0.6rem', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <FaArrowLeft />
                </button>
                <h2 className="page-title">Add New Item</h2>
            </div>

            <div className="card">
                <ItemTypeToggle isPhone={isPhone} setIsPhone={setIsPhone} />

                <form onSubmit={handleFormSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                        {/* Core Info */}
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Item Name <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. iPhone 15 Pro Max"
                                style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category <span style={{ color: 'red' }}>*</span></label>
                            <select name="category_id" className="form-input" required value={formData.category_id} onChange={handleChange}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Brand <span style={{ color: 'red' }}>*</span></label>
                            <select name="brand_id" className="form-input" required value={formData.brand_id} onChange={handleChange} disabled={!formData.category_id}>
                                <option value="">{formData.category_id ? 'Select Brand' : 'Select Category First'}</option>
                                {filteredBrands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Serial Number <span style={{ color: '#9ca3af', fontSize: '0.85em' }}>(Optional)</span></label>
                            <input type="text" name="serial_no" className="form-input" value={formData.serial_no} onChange={handleChange} placeholder="Manufacturer Serial No." />
                        </div>

                        {/* Type Specific Fields */}
                        {isPhone ? (
                            <PhoneFields formData={formData} handleChange={handleChange} />
                        ) : (
                            <GeneralItemFields formData={formData} handleChange={handleChange} />
                        )}

                        {/* Image & Description */}
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Item Image</label>
                            <div style={{ border: '2px dashed #e5e7eb', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}>
                                <input
                                    type="file"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    accept="image/*"
                                    style={{ width: '100%' }} // Simple file input for now
                                />
                                {/* Could enhance UI here, but sticking to functional simplicity first */}
                            </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Description / Details</label>
                            <textarea name="details" className="form-textarea" rows="4" value={formData.details} onChange={handleChange} placeholder="Item specifications, unique features, etc." />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Initial Purchase Notes <span style={{ color: '#9ca3af', fontSize: '0.85em' }}>(Optional)</span></label>
                            <textarea name="purchase_notes" className="form-textarea" rows="2" value={formData.purchase_notes} onChange={handleChange} placeholder="Where was it bought? Group info? etc." />
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                            <FaSave style={{ marginRight: '0.5rem' }} /> {loading ? 'Saving Item...' : 'Create New Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemPage;
