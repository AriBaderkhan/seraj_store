import { useState, useMemo } from 'react';
import { useBrands } from '../hooks/useBrands';
import { useCategories } from '../hooks/useCategories';
import AppImage from '../components/AppImage';
import { FaEdit, FaTrash, FaSave, FaPlus, FaTimes } from 'react-icons/fa';

const BrandPage = () => {
    const { brands, addBrand, editBrand, removeBrand, loading: loadingBrands } = useBrands();
    const { categories, loading: loadingCats } = useCategories();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_ids: []
    });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const safeBrands = useMemo(() => Array.isArray(brands) ? brands : [], [brands]);
    const safeCategories = useMemo(() => Array.isArray(categories) ? categories : [], [categories]);

    const handleCategoryToggle = (catId) => {
        setFormData(prev => {
            const currentIds = Array.isArray(prev.category_ids) ? prev.category_ids : [];
            const isSelected = currentIds.includes(catId);
            if (isSelected) {
                return { ...prev, category_ids: currentIds.filter(id => id !== catId) };
            } else {
                return { ...prev, category_ids: [...currentIds, catId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionData = {
            name: formData.name,
            description: formData.description,
            category_ids: Array.isArray(formData.category_ids) ? formData.category_ids : []
        };

        let success = false;
        if (editingId) {
            success = await editBrand(editingId, submissionData);
        } else {
            success = await addBrand(submissionData);
        }

        if (success) {
            handleCloseModal();
            if (!editingId) {
                setFormData({ name: '', description: '', category_ids: [] });
            }
        }
    };

    const handleEditClick = (brand) => {
        if (!brand) return;
        setEditingId(brand.id);

        let catIds = [];
        try {
            let rawCats = brand.categories;
            if (typeof rawCats === 'string') {
                rawCats = JSON.parse(rawCats);
            }
            if (Array.isArray(rawCats)) {
                catIds = rawCats
                    .filter(c => c !== null && typeof c === 'object')
                    .map(c => c.category_id || c.id)
                    .filter(id => id != null);
            }
        } catch (e) {
            console.error("Failed to parse categories for brand edit", e);
        }

        setFormData({
            name: brand.brand_name || '',
            description: brand.description || '',
            category_ids: catIds
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', category_ids: [] });
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Brands</h2>
            </div>

            <div className="content-grid">
                {!editingId && (
                    <div className="card" style={{ height: 'fit-content' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <FaPlus style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Add New Brand</h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Brand Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Samsung"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select Categories</label>
                                <div style={{
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    border: '1px solid var(--border-color)',
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    {loadingCats ? <p>Loading categories...</p> :
                                        safeCategories.map(cat => (
                                            <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(formData.category_ids) && formData.category_ids.includes(cat.id)}
                                                    onChange={() => handleCategoryToggle(cat.id)}
                                                />
                                                <span>{cat.category_name}</span>
                                            </label>
                                        ))}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                <FaSave style={{ marginRight: '0.5rem' }} /> Save Brand
                            </button>
                        </form>
                    </div>
                )}

                <div className="card" style={{ gridColumn: editingId ? '1 / span 2' : 'auto' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Current Brands</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Categories</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingBrands ? (<tr><td colSpan="4">Loading...</td></tr>) :
                                    safeBrands.map((brand) => {

                                        let cats = [];
                                        try {
                                            let rawCats = brand.categories;
                                            if (typeof rawCats === 'string') rawCats = JSON.parse(rawCats);
                                            if (Array.isArray(rawCats)) {
                                                cats = rawCats.filter(c => c !== null && typeof c === 'object');
                                            }
                                        } catch (e) { cats = []; }

                                        return (
                                            <tr key={brand.id}>
                                                <td>{brand.brand_name || '-'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                        {cats.length > 0 ?
                                                            cats.map((c, idx) => (
                                                                <span key={idx} style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                                    {c.category_name || c.name || 'Category'}
                                                                </span>
                                                            )) : '-'}
                                                    </div>
                                                </td>
                                                <td>{brand.description || '-'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleEditClick(brand)} className="btn btn-sm" style={{ backgroundColor: '#0EA5E9', color: 'white' }} title="Edit"><FaEdit /></button>
                                                        <button onClick={() => removeBrand(brand.id)} className="btn btn-sm btn-danger" title="Delete"><FaTrash /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                {!loadingBrands && safeBrands.length === 0 && (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>No brands found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 style={{ fontWeight: 'bold' }}>Edit Brand</h3>
                            <button onClick={handleCloseModal} className="close-btn"><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Brand Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="3"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Select Categories</label>
                                    <div style={{
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                        border: '1px solid var(--border-color)',
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        {safeCategories.map(cat => (
                                            <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(formData.category_ids) && formData.category_ids.includes(cat.id)}
                                                    onChange={() => handleCategoryToggle(cat.id)}
                                                />
                                                <span>{cat.category_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="button" onClick={handleCloseModal} className="btn" style={{ flex: 1, backgroundColor: '#eee' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        <FaSave style={{ marginRight: '0.5rem' }} /> Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandPage;
