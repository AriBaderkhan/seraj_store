import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../../hooks/useItems';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '../../hooks/useBrands';
import * as itemService from '../../services/itemService';
import AppImage from '../../components/AppImage';
import { FaPlus, FaMobileAlt, FaBoxOpen, FaEye, FaEdit, FaTrash, FaArrowLeft, FaShoppingCart, FaPlusCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

import ItemFilters from './components/ItemFilters';
import ItemDetailsModal from './components/ItemDetailsModal';
import EditItemModal from './components/EditItemModal';
import AddPurchaseModal from './components/AddPurchaseModal';


const ItemPage = () => {
    const navigate = useNavigate();
    const { items, loading: loadingItems, fetchItems, editItem, deleteItem, error: itemsError } = useItems();
    const { categories, loading: loadingCats } = useCategories();
    const { fetchBrandsByCategory } = useBrands();

    // State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryBrands, setCategoryBrands] = useState([]);
    const [filters, setFilters] = useState({
        search: '', color: '', storage: '', sim_type: '', brand_id: ''
    });
    const [pageError, setPageError] = useState(null); // Local error state for non-hook ops

    const [detailsModal, setDetailsModal] = useState({ open: false, data: null });
    const [editModal, setEditModal] = useState({ open: false, data: null });
    const [purchaseModal, setPurchaseModal] = useState({ open: false, item: null });

    // Effect: Fetch items when category/filters change
    useEffect(() => {
        if (selectedCategory) {
            fetchItems(selectedCategory.id, filters);
        }
    }, [selectedCategory, filters, fetchItems]);

    // Effect: Fetch brands when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetchBrandsByCategory(selectedCategory.id)
                .then(setCategoryBrands)
                .catch(err => {
                    console.error("Failed to fetch brands", err);
                    setCategoryBrands([]);
                });
        } else {
            setCategoryBrands([]);
        }
    }, [selectedCategory, fetchBrandsByCategory]);

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        // Reset filters when entering a new category
        setFilters({ search: '', color: '', storage: '', sim_type: '', brand_id: '' });
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleViewDetails = async (itemId) => {
        try {
            const data = await itemService.getItemDetails(itemId);
            setDetailsModal({ open: true, data });
            setPageError(null);
        } catch (error) {
            setPageError("Failed to load item details");
        }
    };

    const handleEditClick = async (item) => {
        try {
            // Fetch full details to ensure we have pricing/stock info for the modal
            const fullItemData = await itemService.getItemDetails(item.id);
            setEditModal({ open: true, data: fullItemData });
        } catch (error) {
            console.error("Failed to load item for edit", error);
            // Fallback to basic item data if detailed fetch fails, though modal might lack some fields
            setEditModal({ open: true, data: item });
        }
    };

    const handleEditSave = async (id, data) => {
        const success = await editItem(id, data);
        if (success) {
            setEditModal({ open: false, data: null });
            fetchItems(selectedCategory.id, filters);
        }
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            await deleteItem(id);
            // fetchItems is dependent on filters, so it might need manual refresh or just let state update if deleteItem updates local state?
            // useItems hook likely updates local state, but let's re-fetch to be safe if useItems doesn't auto-update list
            fetchItems(selectedCategory.id, filters);
        }
    }

    const handleAddToCart = (item) => {
        // Placeholder for Cart Logic
        toast.success(`Added ${item.name} to cart!`);
        console.log("Add to cart:", item);
    };

    const handleAddPurchaseClick = (item) => {
        setPurchaseModal({ open: true, item });
    };

    const handleAddPurchaseSave = async (id, data) => {
        try {
            await itemService.addPurchase(id, data);
            toast.success("Purchase added successfully");
            setPurchaseModal({ open: false, item: null });
            fetchItems(selectedCategory.id, filters);
            fetchItems(selectedCategory.id, filters);
        } catch (error) {
            console.error("Add Purchase failed", error);
            setPageError(error.response?.data?.message || "Failed to add purchase");
        }
    };

    // --- RENDER ---

    if (!selectedCategory) {
        return (
            <div>
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 className="page-title">Items Management</h2>
                    <button onClick={() => navigate('/items/add')} className="btn btn-primary " style={{ fontSize: '0.8rem' }}>
                        <FaPlus style={{ marginRight: '0.5rem' }} /> Add New Item
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    Select a category to view items
                </div>

                {/* Error Display (Categories) */}
                {pageError && (
                    <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        {pageError}
                    </div>
                )}

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem'
                }}>
                    {loadingCats ? <p>Loading categories...</p> : categories.map(cat => (
                        <div key={cat.id} onClick={() => handleCategoryClick(cat)} className="card"
                            style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="text-4xl text-primary mb-4 flex justify-center items-center h-16 text-red-800 ">
                                {cat.category_name.toLowerCase().includes('mobile') || cat.category_name.toLowerCase().includes('phone')
                                    ? <FaMobileAlt /> : <FaBoxOpen />}
                            </div>
                            <h3 style={{ fontWeight: 'bold' }}>{cat.category_name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                {cat.description || 'View categorized items'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <button onClick={handleBackToCategories} className="btn" style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <FaArrowLeft />
                    </button>
                    <h2 className="page-title">{selectedCategory.category_name}</h2>
                </div>

                <ItemFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    brands={categoryBrands}
                    hasMobileCategory={selectedCategory.category_name.toLowerCase().includes('phone') || selectedCategory.category_name.toLowerCase().includes('mobile')}
                />

            </div>

            {/* Error Display (Items) */}
            {(pageError || itemsError) && (
                <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    {pageError || itemsError}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {loadingItems ? <p>Loading items...</p> : items.length === 0 ? <p>No items found.</p> : items.map(item => (
                    <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            height: '200px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderBottom: '1px solid #eee', position: 'relative'
                        }}>
                            {item.image_path ? (
                                <AppImage
                                    src={item.image_path}
                                    alt={item.name}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <span style={{ color: '#999' }}>No Image</span>
                            )}
                            <span className="badge" style={{ position: 'absolute', top: '10px', right: '10px', background: item.stock_qty > 0 ? '#DEF7EC' : '#FDE8E8', color: item.stock_qty > 0 ? '#03543F' : '#9B1C1C' }}>
                                {item.stock_qty > 0 ? `${item.stock_qty} in Stock` : 'Out of Stock'}
                            </span>
                        </div>
                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#666' }}>
                                {item.storage && <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>{item.storage}</span>}
                                {item.color && <span className="badge" style={{ background: '#F0FDF4', color: '#16A34A' }}>{item.color}</span>}
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button onClick={() => handleViewDetails(item.id)} className="btn-icon" style={{ background: '#EEF2FF', color: '#4F46E5', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }} title="View Details">
                                            <FaEye size={14} />
                                        </button>
                                        <button onClick={() => handleEditClick(item)} className="btn-icon" style={{ background: '#F3F4F6', color: '#374151', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }} title="Edit Item">
                                            <FaEdit size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(item.id)} className="btn-icon" style={{ background: '#FDE8E8', color: '#C81E1E', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }} title="Delete Item">
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                    <button onClick={() => handleAddPurchaseClick(item)} className="btn-icon" style={{ background: '#F0FDF4', color: '#16A34A', padding: '0 0.5rem', height: '30px', display: 'flex', alignItems: 'center', gap: '0.25rem', borderRadius: '4px', border: '1px solid #16A34A' }} title="Add New Stock">
                                        <FaPlusCircle /> Add
                                    </button>
                                </div>
                                <button onClick={() => handleAddToCart(item)} className="btn" style={{ width: '100%', background: 'rgb(255 125 102)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                                    <FaShoppingCart /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ItemDetailsModal
                isOpen={detailsModal.open}
                onClose={() => setDetailsModal({ open: false, data: null })}
                data={detailsModal.data}
                onRefresh={() => handleViewDetails(detailsModal.data.id)}
            />

            <EditItemModal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, data: null })}
                item={editModal.data}
                categories={categories}
                brands={categoryBrands}
                onSave={handleEditSave}
            />

            <AddPurchaseModal
                isOpen={purchaseModal.open}
                onClose={() => setPurchaseModal({ open: false, item: null })}
                item={purchaseModal.item}
                onSave={handleAddPurchaseSave}
            />
        </div>
    );
};

export default ItemPage;
