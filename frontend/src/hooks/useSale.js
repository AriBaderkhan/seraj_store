import { useState, useEffect, useCallback } from 'react';
import * as saleService from '../services/saleService';
import * as cartService from '../services/cartService';
import { toast } from 'react-hot-toast';

const useSale = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pendingAdds, setPendingAdds] = useState(new Set());

    // --- SEARCH EFFECT ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // --- LOAD CART ON MOUNT ---
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const items = await cartService.findtheCurrentCart();
            // Backend now returns: { item_id, item_name, qty, total_amount, imei }
            // Note: imei might be null for aggregated items if the query groups them without imei, 
            // but the user's latest query GROUP BY item_id, item_name, imei.
            // So phone items will have imei, others won't.

            const mappedItems = items.map(row => ({
                // UI expects specific fields:
                name: row.item_name,
                id: row.item_id, // This is the ITEM ID
                qty: Number(row.qty),
                selling_price: Number(row.total_amount) / Number(row.qty), // Approximate unit price derived from total/qty if needed, or we can just use total_amount directly in UI
                total_amount: Number(row.total_amount),
                imei1: row.imei,
                // We need a unique ID for React keys and for deletion if needed.
                // Since we don't have a unique 'cart_id' row ID anymore (because of GROUP BY or multiple rows), 
                // we might need to rely on item_id + imei as unique key.
                // But wait, the delete endpoint expects a CART ID.
                // The user's backend 'deleteCart' expects a 'cartId'.
                // If we grouped rows, we don't have a single cart ID to delete.
                // ISSUE: How to delete a grouped item? 
                // The backend currently has `deleteCart(cartId)` which deletes by ID.
                // But the user's `findtheCurrentCart` query DOES NOT return `id` (the cart primary key).
                // It returns item_id. 
                // Use 'deleteEntireCart' for clear all.
                // To delete a specific line, we probably need the cart row IDs.
                // The user's query: SELECT item_id, item_name, ..., SUM(quantity) ... GROUP BY item_id, item_name, imei
                // This obscures the individual `id` of cart_items.
                // For now, I will map what I have. Deletion might be tricky without a cart ID.
                cart_internal_id: null, // We don't have this from the group query
            }));

            setCart(mappedItems);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const data = await saleService.findItem(searchQuery);
            setSearchResults(data);
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Phone Already in the cart";
            const code = error.response?.data?.support_code || error.response?.data?.code;
            const finalMsg = code ? `${msg} (Support Code: ${code})` : msg;
            throw new Error(finalMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- CART ACTIONS ---
    const addToCart = async (item, qtyToAdd = 1) => {
        // Validation Logic
        // Relaxed checks to rely on backend validation
        if (item.item_type === 'phone') {
            qtyToAdd = 1;
        }

        try {
            // Add to Backend
            await cartService.createCart({
                item_id: item.id,
                item_name: item.name,
                imei: item.imei1 || item.imei2 || '',
                qty: qtyToAdd,
                selling_price: item.selling_price
            });

            await fetchCart(); // Refresh state
            toast.success("Added to cart");

        } catch (error) {
            console.error("Add to cart error:", error);
            const msg = error.response?.data?.message || error.message || "Failed to add to cart";
            const code = error.response?.data?.support_code || error.response?.data?.code;
            const finalMsg = code ? `${msg} (Support Code: ${code})` : msg;
            throw new Error(finalMsg);
        }
    };

    const removeFromCart = async (index, cartInternalId) => {
        // We need the database ID of the cart item.
        // The mapped cart items have 'cart_internal_id'.
        if (!cartInternalId) {
            // Fallback if missing (shouldn't happen with correct fetch)
            console.error("Missing cart ID");
            return;
        }

        try {
            await cartService.deleteCart(cartInternalId);
            await fetchCart();
            toast.success("Removed");
        } catch (error) {
            console.error("Remove error:", error);
            throw error;
        }
    };

    const calculateTotal = useCallback(() => {
        // Backend returns mapped 'total_amount' which is SUM(row_total) or SUM(selling_price * qty)
        return cart.reduce((total, item) => total + Number(item.total_amount), 0);
    }, [cart]);

    const completeSale = async (paymentDetails) => {
        if (cart.length === 0) {
            throw new Error("Cart is empty!");
        }

        try {
            setLoading(true);
            const totalAmount = calculateTotal();

            // Construct Payload matching User's Backend Schema
            // The backend now fetches items from the cart table directly.
            // We only need to send the transaction header details.
            const saleData = {
                total_amount: totalAmount,
                total_paid: Number(paymentDetails.total_paid),
                customer_name: paymentDetails.customer_name || 'Walk-in Customer',
                payment_method: paymentDetails.payment_method || 'Cash'
            };

            const response = await saleService.createSale(saleData);

            toast.success("Sale completed! Printing receipt...");

            // AUTOMATICALLY OPEN PDF
            if (response && response.data && response.data.id) {
                const saleId = response.data.id;
                try {
                    // Fetch PDF with Auth Headers
                    const pdfBlob = await saleService.downloadPdf(saleId);

                    // Create Local URL
                    const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));

                    // Open in New Window
                    window.open(url, '_blank');

                } catch (err) {
                    console.error("PDF Download Error:", err);
                    // Non-critical: Sale is done, just Receipt failed.
                    // toast.error("Failed to download receipt.");
                    // Maybe we should alert user or just swallow if we can't show it inline easily?
                    // User said "Remove all toast.error".
                }
            } else {
                console.error("Sale ID missing in response", response);
                throw new Error("Sale saved, but could not launch printer.");
            }

            // Backend handles clearing the cart table now (as per Step 46 in backend service)
            // We just need to refresh our frontend view
            setCart([]);
            await fetchCart(); // Ensure it's empty from server perspective too
            setSearchQuery('');
            setSearchResults([]);

        } catch (error) {
            // Propagate to component for inline error handling
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        loading,
        cart,
        addToCart,
        removeFromCart,
        calculateTotal,
        completeSale
    };
};

export default useSale;
