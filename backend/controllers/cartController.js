import asyncWrap from "../utils/asyncWrap.js";
import cartService from '../services/cartService.js'

const createCart = asyncWrap(async (req, res) => {
    const { item_id, item_name, imei, qty, selling_price } = req.body;

    const result = await cartService.createCart(item_id, item_name, imei, qty, selling_price);
    res.status(201).json({ data: result });
})

const findtheCurrentCart = asyncWrap(async (req, res) => {
    const result = await cartService.findtheCurrentCart();
    res.status(200).json({ data: result });
})

const deleteCart = asyncWrap(async (req, res) => {
    const cartId = Number(req.params.cartId);
    const result = await cartService.deleteCart(cartId);
    res.status(200).json({ data: result });
})

export default { createCart, findtheCurrentCart, deleteCart }
