import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import AppImage from '../components/AppImage';
import { FaEdit, FaTrash, FaSave, FaPlus, FaImage, FaTimes } from 'react-icons/fa';

const CategoryPage = () => {
    const { categories, addCategory, editCategory, removeCategory, loading } = useCategories();

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        if (image) {
            data.append('image', image);
        }

        let success = false;
        if (editingId) {
            success = await editCategory(editingId, data);
        } else {
            success = await addCategory(data);
        }

        if (success) {
            handleCloseModal();
            // If it was an add, also reset form
            if (!editingId) {
                setFormData({ name: '', description: '' });
                setImage(null);
            }
            e.target.reset?.();
        }
    };

    const handleEditClick = (category) => {
        // Backend uses .id, not .category_id
        setEditingId(category.id);
        setFormData({
            name: category.category_name,
            description: category.description || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setImage(null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Categories</h2>
            </div>

            <div className="content-grid">
                {/* Add Form Card (Always visible) */}
                {!editingId && (
                    <div className="card" style={{ height: 'fit-content' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <FaPlus style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Add New Category</h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Category Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Wireless Earphones"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category Image</label>
                                <input
                                    type="file"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    className="form-input"
                                    accept="image/*"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                <FaSave style={{ marginRight: '0.5rem' }} /> Save Category
                            </button>
                        </form>
                    </div>
                )}

                <div className="card" style={{ gridColumn: editingId ? '1 / span 2' : 'auto' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Current Categories</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (<tr><td colSpan="4">Loading...</td></tr>) : categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>
                                            {cat.image ? (
                                                <AppImage
                                                    src={cat.image}
                                                    alt={cat.category_name}
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}><FaImage color="#ccc" /></div>
                                            )}
                                        </td>
                                        <td>{cat.category_name}</td>
                                        <td>{cat.description || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditClick(cat)} className="btn btn-sm" style={{ backgroundColor: '#0EA5E9', color: 'white' }}><FaEdit /></button>
                                                <button onClick={() => removeCategory(cat.id)} className="btn btn-sm btn-danger"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                            <h3 style={{ fontWeight: 'bold' }}>Edit Category</h3>
                            <button onClick={handleCloseModal} className="close-btn"><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Category Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">New Image (Optional)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setImage(e.target.files[0])}
                                        className="form-input"
                                        accept="image/*"
                                    />
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

export default CategoryPage;
