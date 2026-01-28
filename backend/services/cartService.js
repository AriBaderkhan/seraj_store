import cartModel from '../models/cartModel.js';
import appError from '../utils/appError.js';

async function createCart(item_id, item_name, imei, qty, selling_price) {
    if (imei) {
        const cartList = await cartModel.findAllItemsInCart();
        const targetImei = cartList.find(row => row.imei === imei);
        if (targetImei) throw appError('IMEI_ALREADY_IN_THE_CART', `IMEI ${imei} already in the cart`, 400);
    }

    const cart = await cartModel.createCart(item_id, item_name, imei, qty, selling_price);
    if (!cart) throw appError('CART_NOT_CREATED', 'Cart not created', 400);

    return cart;
}

async function findtheCurrentCart() {
    const carts = await cartModel.findtheCurrentCart();
    return carts;
}

async function deleteCart(cartId) {
    const cart = await cartModel.deleteCart(cartId);
    return cart;
}

export default { createCart, findtheCurrentCart, deleteCart }