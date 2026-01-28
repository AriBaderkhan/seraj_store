import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { FaSave, FaArrowLeft, FaMobileAlt, FaBox, FaImage } from 'react-icons/fa';

const AddItemPage = () => {
    const navigate = useNavigate();
    const { addItem, loading } = useItems();
    const { categories } = useCategories();
    const { brands, fetchBrandsByCategory } = useBrands();
    const [filteredBrands, setFilteredBrands] = useState([]);

    const [isPhone, setIsPhone] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        brand_id: '',
        category_id: '',
        details: '',
        color: '',
        storage: '',
        sim_type: '',
        imei1: '',
        imei2: '',
        purchase_price: '',
        stock_qty: '0',
        unit_cost: '0',
        purchase_notes: '',
        serial_no: '',
        warranty_month: '',
        selling_price: '',
        unit_sell_price: ''
    });
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;

        setFormData({ ...formData, [name]: value });

        if (name === 'category_id') {
            if (value) {
                fetchBrandsByCategory(value).then(data => setFilteredBrands(data));
            } else {
                setFilteredBrands([]);
            }
            setFormData(prev => ({ ...prev, category_id: value, brand_id: '' }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('brand_id', formData.brand_id);
        data.append('category_id', formData.category_id);
        data.append('details', formData.details);
        data.append('is_imei_required', isPhone);
        if (formData.serial_no) data.append('serial_no', formData.serial_no);
        if (image) data.append('image', image);

        if (isPhone) {
            data.append('color', formData.color);
            data.append('storage', formData.storage);
            data.append('sim_type', formData.sim_type);
            if (formData.imei1) data.append('imei1', formData.imei1);
            if (formData.imei2) data.append('imei2', formData.imei2);
            data.append('purchase_price', formData.purchase_price);
            data.append('selling_price', formData.selling_price);
            if (formData.warranty_month) data.append('warranty_month', formData.warranty_month);
            data.append('status', 'in_stock');
        } else {
            data.append('stock_qty', formData.stock_qty);
            data.append('unit_cost', formData.unit_cost);
            data.append('unit_sell_price', formData.unit_sell_price);
        }

        data.append('purchase_notes', formData.purchase_notes);

        const success = await addItem(data);
        if (success) {
            navigate('/items');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate('/items')} className="btn" style={{ background: 'white', padding: '0.5rem' }}>
                    <FaArrowLeft />
                </button>
                <h2 className="page-title">Add New Item</h2>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setIsPhone(true)}
                        className="btn"
                        style={{
                            flex: 1,
                            background: isPhone ? 'var(--primary-color)' : '#f3f4f6',
                            color: isPhone ? 'white' : '#6b7280',
                            gap: '0.5rem'
                        }}>
                        <FaMobileAlt /> Mobile Phone
                    </button>
                    <button
                        onClick={() => setIsPhone(false)}
                        className="btn"
                        style={{
                            flex: 1,
                            background: !isPhone ? 'var(--primary-color)' : '#f3f4f6',
                            color: !isPhone ? 'white' : '#6b7280',
                            gap: '0.5rem'
                        }}>
                        <FaBox /> General Item
                    </button>
                </div>

                <form onSubmit={handleFormSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Item Name</label>
                            <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} placeholder="e.g. iPhone 15 Pro Max" />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Serial Number (Optional)</label>
                            <input type="text" name="serial_no" className="form-input" value={formData.serial_no} onChange={handleChange} placeholder="Manufacturer Serial No." />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Brand</label>
                            <select name="brand_id" className="form-input" required value={formData.brand_id} onChange={handleChange}>
                                <option value="">Select Brand</option>
                                {filteredBrands.length > 0
                                    ? filteredBrands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)
                                    : <option disabled>Select Category First</option>
                                }
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category_id" className="form-input" required value={formData.category_id} onChange={handleChange}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                            </select>
                        </div>

                        {isPhone && (
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
                                        <option value="Physical">Physical</option>
                                        <option value="eSIM">eSIM</option>
                                        <option value="Dual SIM">Dual SIM</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Purchase Price ($)</label>
                                    <input type="number" name="purchase_price" className="form-input" value={formData.purchase_price} onChange={handleChange} placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Selling Price ($)</label>
                                    <input type="number" name="selling_price" className="form-input" value={formData.selling_price} onChange={handleChange} placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Warranty (Months) (Optional)</label>
                                    <input type="number" name="warranty_month" className="form-input" value={formData.warranty_month} onChange={handleChange} placeholder="e.g. 12" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">IMEI 1</label>
                                    <input type="text" name="imei1" className="form-input" value={formData.imei1} onChange={handleChange} placeholder="IMEI Number (Optional)" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">IMEI 2 (Optional)</label>
                                    <input type="text" name="imei2" className="form-input" value={formData.imei2} onChange={handleChange} placeholder="Second imei" />
                                </div>
                            </>
                        )}

                        {!isPhone && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Starting Stock Quantity (Optional)</label>
                                    <input type="number" name="stock_qty" className="form-input" value={formData.stock_qty} onChange={handleChange} placeholder="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Unit Cost ($)</label>
                                    <input type="number" name="unit_cost" className="form-input" value={formData.unit_cost} onChange={handleChange} placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Unit Sell Price ($)</label>
                                    <input type="number" name="unit_sell_price" className="form-input" value={formData.unit_sell_price} onChange={handleChange} placeholder="0.00" />
                                </div>
                            </>
                        )}

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Item Image</label>
                            <input type="file" onChange={(e) => setImage(e.target.files[0])} className="form-input" accept="image/*" />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Description / Details</label>
                            <textarea name="details" className="form-textarea" rows="3" value={formData.details} onChange={handleChange} placeholder="Item specifications, unique features, etc." />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Initial Purchase Notes (Optional)</label>
                            <textarea name="purchase_notes" className="form-textarea" rows="2" value={formData.purchase_notes} onChange={handleChange} placeholder="Where was it bought? Group info? etc." />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                            <FaSave style={{ marginRight: '0.5rem' }} /> {loading ? 'Saving...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemPage;
