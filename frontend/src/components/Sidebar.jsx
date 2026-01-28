import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaBoxOpen,
    FaTruck,
    FaTags,
    FaShoppingCart,
    FaChartPie,
    FaSignOutAlt,
    FaFilePdf
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
// import { useState } from 'react';

const Sidebar = ({ isOpen, isDesktop, closeMenu }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/login');
        }
    };

    const navItems = [
        { name: 'Dashboard', icon: <FaChartPie />, path: '/dashboard' },
        { name: 'Items', icon: <FaBoxOpen />, path: '/items' },
        { name: 'Selling', icon: <FaShoppingCart />, path: '/selling' },
        // { name: 'Suppliers', icon: <FaTruck />, path: '/suppliers' },
        { name: 'Categories', icon: <FaTags />, path: '/categories' },
        { name: 'Brands', icon: <FaTags />, path: '/brands' },
    ];

    const { user } = useAuth();

    // Only Admin and Manager see Reports
    console.log("Current User Role:", user?.role);
    if (user?.role === 'admin' || user?.role === 'manager') {
        navItems.push({ name: 'Reports', icon: <FaFilePdf />, path: '/reports' });
    }

    return (
        <>
            {/* Overlay for mobile - only exists in DOM on mobile */}
            {!isDesktop && isOpen && (
                <div
                    onClick={closeMenu}
                    className="overlay is-open"
                />
            )}


            <aside
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: '250px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    zIndex: 50,
                    transition: 'transform 0.3s ease-in-out',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                // On desktop (min-width logic via media query handled in CSS or override here)
                className="sidebar"
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Mobile Shop</h1>
                </div>

                <nav style={{ flex: 1, padding: '1rem 0' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => { }} // Keep open on mobile navigation
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1.5rem',
                                color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                                backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'transparent',
                                borderLeft: isActive ? '4px solid white' : '4px solid transparent',
                                textDecoration: 'none',
                                marginBottom: '0.25rem'
                            })}
                        >
                            <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>{item.icon}</span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem 1.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        width: '100%',
                        textAlign: 'left'
                    }}
                >
                    <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}><FaSignOutAlt /></span>
                    <span>Logout</span>
                </button>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(211, 195, 195, 0.1)' }}>
                    <h2 style={{ fontSize: '0.7rem' }}>Powered By <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Tradi Company</span></h2>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
