import React, { useState } from 'react';
import useSale from '../hooks/useSale';

const SellingPage = () => {
    // Usng our custom hook for all logic
    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        loading,
        cart,
        addToCart,
        removeFromCart,
        calculateTotal,
        completeSale
    } = useSale();

    // Checkout UI State (Specific to this page view)
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [payTotal, setPayTotal] = useState('');

    // Error State
    const [errors, setErrors] = useState({});

    // Error Component Helper
    const ErrorDisplay = ({ error }) => {
        if (!error) return null;
        return (
            <div style={{ color: '#d32f2f', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⚠️</span>
                <span>{error}</span>
            </div>
        );
    };

    const handleComplete = async () => {
        setErrors({}); // Clear previous errors
        try {
            await completeSale({
                total_paid: payTotal,
                customer_name: customerName,
                payment_method: paymentMethod
            });
            setPayTotal('');
            setCustomerName('');
            setPaymentMethod('');
        } catch (error) {
            console.error("Sale Error:", error);
            // If we have a support code, show it nicely
            const errorMsg = error.support_code
                ? `${error.message} (Support Code: ${error.support_code})`
                : error.message || "Sale failed";

            // Map to fields if possible, else general error (or map to 'payTotal' if it looks like a payment error?)
            // For now, let's put it in a general 'sale' error or just show it above the button if it's not field specific.
            // But user asked for inline. Let's assume most errors are general or stock related (which show in toast mainly, but here we capture sale submission errors).

            setErrors({ form: errorMsg });
        }
    };


    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none'
    };

    const selectStyle = {
        ...inputStyle,
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        backgroundColor: 'white',
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.2rem'
    };

    const headerStyle = {
        background: 'var(--primary-color)',
        color: 'white',
        padding: '1rem',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 'bold',
        fontSize: '1.1rem'
    };

    const cardStyle = {
        background: 'white',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '1rem',
        overflow: 'hidden'
    };

    // Auto-fill Pay Total when cart changes
    React.useEffect(() => {
        const total = calculateTotal();
        if (total > 0) {
            setPayTotal(total.toString());
        } else {
            setPayTotal('');
        }
    }, [cart, calculateTotal]);

    // Responsive Check
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

    React.useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{
            display: isDesktop ? 'flex' : 'block',
            height: isDesktop ? 'calc(100vh - 100px)' : 'auto',
            gap: '1.5rem',
            overflow: isDesktop ? 'hidden' : 'auto',
            paddingBottom: isDesktop ? 0 : '2rem' // Add space at bottom for mobile scrolling
        }}>

            {/* LEFT SIDE: AVAILABLE ITEMS */}
            <div style={{
                width: isDesktop ? '66%' : '100%',
                display: 'flex',
                flexDirection: 'column',
                height: isDesktop ? '100%' : '600px', // Give it a fixed height on mobile or let it go auto? '600px' prevents infinite scroll confusion if list is long.
                marginBottom: isDesktop ? 0 : '2rem'
            }}>
                {/* Header */}
                <div style={headerStyle}>
                    <h2 style={{ margin: 0 }}>Available Items</h2>
                    <button
                        onClick={() => window.location.href = '/sales-history'}
                        style={{
                            marginLeft: 'auto',
                            background: 'white',
                            color: 'var(--primary-color)',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Scan History
                    </button>
                </div>

                {/* Content Box */}
                <div style={cardStyle}>
                    {/* Search Bar */}
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Search items by name or ID..."
                            style={inputStyle}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Table Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '50px 3fr 1fr 80px 100px', gap: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #eee', fontWeight: 'bold', color: '#666' }}>
                        <div>#ID</div>
                        <div>Item Name</div>
                        <div>Price</div>
                        <div>Stock</div>
                        <div style={{ textAlign: 'center' }}>Action</div>
                    </div>



                    {/* Table Body */}
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Searching...</div>
                        ) : !Array.isArray(searchResults) || searchResults.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
                                Scan barcode or search name...
                            </div>
                        ) : (
                            searchResults.map((item, index) => {
                                // Local state for input (we can't easily use useState inside map, so we'll use a controlled input approach by item ID)
                                // Actually, simpler approach for now: Just use an uncontrolled input ref or a simple state object in the parent if possible.
                                // But useState inside map is bad.
                                // Better: Create a sub-component for the row OR just use a single 'qty' state if we select item first.
                                // User asked for "small input below the quantity to write quantity".
                                // Let's use a controlled input map in the main component or just a simple input that passes value on click.
                                // Simplest way without refactoring to subcomponents:
                                // Use `document.getElementById` or similar is hacky.
                                // Let's try to keep it simple: We need a state `quantities` map { [itemId]: qty }.

                                return (
                                    <div key={index} style={{
                                        display: isDesktop ? 'grid' : 'flex',
                                        flexDirection: isDesktop ? 'initial' : 'column',
                                        gridTemplateColumns: '50px 3fr 1fr 80px 100px',
                                        gap: '1rem',
                                        padding: '0.75rem 0',
                                        borderBottom: '1px solid #f0f0f0',
                                        alignItems: isDesktop ? 'center' : 'flex-start'
                                    }}>
                                        <div style={{ color: '#888', fontSize: '0.85rem' }}>#{item.id}</div>
                                        <div style={{ fontWeight: '500' }}>
                                            {item.name}
                                            {item.imei1 && <span style={{ display: 'block', fontSize: '0.75rem', color: '#666' }}>IMEI: {item.imei1}</span>}
                                            {item.item_type === 'product' && item.serial_no && <span style={{ display: 'block', fontSize: '0.75rem', color: '#666' }}>SN: {item.serial_no}</span>}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#444' }}>
                                            IQD {Number(item.selling_price).toLocaleString()}
                                        </div>
                                        <div>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: item.stock_qty > 0 ? '#DEF7EC' : '#FDE8E8',
                                                color: item.stock_qty > 0 ? '#03543F' : '#9B1C1C'
                                            }}>
                                                {item.stock_qty}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            {item.item_type !== 'phone' && (
                                                <input
                                                    id={`qty-${item.id}`}
                                                    type="number"
                                                    min="1"
                                                    defaultValue="1"
                                                    placeholder="1"
                                                    style={{
                                                        width: '100%',
                                                        padding: '4px 8px',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '6px',
                                                        fontSize: '0.9rem',
                                                        textAlign: 'center',
                                                        marginBottom: '4px',
                                                        background: '#fff'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            )}
                                            <button
                                                onClick={() => {
                                                    let qtyToAdd = 1;
                                                    if (item.item_type !== 'phone') {
                                                        const input = document.getElementById(`qty-${item.id}`);
                                                        if (input) qtyToAdd = Number(input.value) || 1;
                                                    }
                                                    addToCart(item, qtyToAdd);
                                                }}
                                                disabled={item.stock_qty <= 0}
                                                style={{
                                                    background: item.stock_qty > 0 ? 'var(--primary-color)' : '#ccc',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.4rem 1rem',
                                                    borderRadius: '6px',
                                                    cursor: item.stock_qty > 0 ? 'pointer' : 'not-allowed',
                                                    fontSize: '0.9rem',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: CURRENT BILL */}
            <div style={{ width: isDesktop ? '33%' : '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={headerStyle}>
                    <h2>Current Bill</h2>
                </div>

                {/* Bill Content */}
                <div style={cardStyle}>

                    {/* Cart Table Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 30px', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #eee', fontWeight: 'bold', color: '#666', fontSize: '0.9rem' }}>
                        <div>Item</div>
                        <div style={{ textAlign: 'center' }}>Qty</div>
                        <div style={{ textAlign: 'right' }}>Total</div>
                        <div></div>
                    </div>

                    {/* Cart Items (Scrollable) */}
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem', marginBottom: '1rem' }}>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc', fontSize: '0.9rem' }}>Cart is empty</div>
                        ) : (
                            cart.map((item, index) => (
                                <div key={index} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 30px',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0',
                                    borderBottom: '1px solid #f0f0f0',
                                    alignItems: 'center',
                                    fontSize: '0.9rem'
                                }}>
                                    <div style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                                        {item.name}
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            value={item.qty}
                                            readOnly
                                            style={{ width: '40px', textAlign: 'center', border: '1px solid #eee', borderRadius: '4px', background: '#f9f9f9', color: '#333' }}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                        IQD {Number(item.total_amount).toLocaleString()}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => removeFromCart(index, item.id)} /* Passing item.id (item_id) for deletion handling */
                                            style={{ background: '#FDE8E8', color: '#C81E1E', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Total Section */}
                    <div
                        className="bg-gradient-to-br from-red-50 to-white border border-red-100 p-5 rounded-xl shadow-sm"
                        style={{ marginBottom: '2.5rem' }}
                    >
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Payable</span>
                                {/* <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full w-fit font-medium">Tax Included</span> */}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-gray-400">IQD</span>
                                <span className="text-4xl font-black text-gray-800 tracking-tight">
                                    {calculateTotal().toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#555' }}>Pay Total</label>
                            <input
                                type="number"
                                style={{
                                    ...inputStyle,
                                    borderColor: errors.payTotal ? '#d32f2f' : '#ddd'
                                }}
                                placeholder="Pay the amount"
                                value={payTotal}
                                onChange={(e) => setPayTotal(e.target.value)}
                            />
                            {/* Future: If we mapped payment errors specifically to this field */}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#555' }}>Customer Name</label>
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="Optional"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#555' }}>Payment Method</label>
                            <select
                                style={selectStyle}
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="">Select Method</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="upi">UPI</option>
                            </select>
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <button
                                onClick={handleComplete}
                                disabled={loading || cart.length === 0}
                                className="btn btn-success w-full  bg-green-800 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer display-flex items-center justify-center gap-2 box-shadow-md hover:box-shadow-lg active:scale-95 transition-all duration-200"
                            >
                                Complete Sale
                            </button>
                            {/* General Form Error / Sale Error displayed here */}
                            <ErrorDisplay error={errors.form} />
                        </div>
                    </div>

                </div>
            </div >
        </div >
    );
};

export default SellingPage;
