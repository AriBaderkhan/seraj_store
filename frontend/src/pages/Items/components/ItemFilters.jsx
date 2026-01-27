import React from 'react';
import { FaSearch } from 'react-icons/fa';

const ItemFilters = ({ filters, onFilterChange, brands, hasMobileCategory }) => {
    return (
        <div className="card" style={{ padding: '1rem', borderTop: 'none', marginBottom: '1.5rem' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
            }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search name..."
                            className="form-input"
                            style={{ paddingLeft: '2.5rem' }}
                            value={filters.search}
                            onChange={onFilterChange}
                        />
                    </div>
                </div>

                <select name="brand_id" className="form-input" value={filters.brand_id} onChange={onFilterChange}>
                    <option value="">By Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
                </select>

                {hasMobileCategory && (
                    <>
                        <select name="storage" className="form-input" value={filters.storage} onChange={onFilterChange}>
                            <option value="">By Storage</option>
                            <option value="64GB">64GB</option>
                            <option value="128GB">128GB</option>
                            <option value="256GB">256GB</option>
                            <option value="512GB">512GB</option>
                            <option value="1TB">1TB</option>
                        </select>
                        <select name="sim_type" className="form-input" value={filters.sim_type} onChange={onFilterChange}>
                            <option value="">By SIM</option>
                            <option value="One SIM">One SIM</option>
                            <option value="eSIM">eSIM</option>
                            <option value="Dual SIM">Dual SIM</option>
                        </select>
                        <select name="color" className="form-input" value={filters.color} onChange={onFilterChange}>
                            <option value="">By Color</option>
                            <option value="Black">Black</option>
                            <option value="White">White</option>
                            <option value="Titanium">Titanium</option>
                            <option value="Blue">Blue</option>
                        </select>
                    </>
                )}
            </div>
        </div>
    );
};

export default ItemFilters;
