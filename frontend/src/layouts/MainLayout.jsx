import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaBars } from 'react-icons/fa';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    // Handle window resize to auto-show/hide sidebar
    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            if (desktop) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                isDesktop={isDesktop}
                closeMenu={() => !isDesktop && setIsSidebarOpen(false)}
            />

            <div style={{
                flex: 1,
                marginLeft: isDesktop ? '250px' : '0',
                transition: 'margin-left 0.3s'
            }}>
                {/* Mobile Header */}
                {!isDesktop && (
                    <header style={{
                        background: 'var(--primary-color)',
                        padding: '1rem',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        zIndex: 30,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            <FaBars />
                        </button>
                        <h1 style={{ marginLeft: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Mobile Shop</h1>
                    </header>
                )}

                {/* Main Content */}
                <main style={{ padding: '2rem' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
