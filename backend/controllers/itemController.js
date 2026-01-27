import itemService from "../services/itemService.js";
import asyncWrap from "../utils/asyncWrap.js";
import { uploadFileToSupabase } from "../utils/supabaseStorage.js";
const createItem = asyncWrap(async (req, res) => {
    const { name, brand_id, category_id, details, storage,
        sim_type, color, imei1, imei2, purchase_price, status, qty,
        unit_cost, stock_qty, serial_no, purchase_notes, unit_sell_price, selling_price, warranty_month } = req.body;

    // Fix: form-data sends boolean as string "true"/"false"
    const is_imei_required = req.body.is_imei_required === 'true' || req.body.is_imei_required === true;

    const created_by = req.user.id;

    const image = req.file ? await uploadFileToSupabase(req.file, 'items') : null;

    const allInputs = {
        name, brand_id, category_id, is_imei_required, details, image,
        storage, sim_type, color, imei1, imei2, purchase_price, status,
        qty, unit_cost, stock_qty, serial_no, purchase_notes, created_by,
        unit_sell_price, selling_price, warranty_month
    }
    const result = await itemService.createItem(allInputs);
    res.status(201).json(result);
});

const findAllItemsByCategoryId = asyncWrap(async (req, res) => {
    const category_id = Number(req.params.categoryId);
    const filters = req.query; // Capture query params (search, color, etc.)
    const items = await itemService.findAllItemsByCategoryId(category_id, filters);
    res.status(200).json(items);
});

const findItemById = asyncWrap(async (req, res) => {
    const item_id = Number(req.params.id);
    const item = await itemService.findItemById(item_id);
    res.status(200).json(item);
});

const updateItem = asyncWrap(async (req, res) => {
    const item_id = Number(req.params.id);
    const updated_by = req.user.id;

    // If new image, add path
    const image = req.file ? await uploadFileToSupabase(req.file, 'items') : undefined;

    // Spread body, conditionally add image if present
    const updateData = { ...req.body };
    if (image) updateData.image_path = image;

    // Coerce numeric types (form-data sends strings)
    // Fix: Use !== undefined to allow value '0'
    if (updateData.stock_qty !== undefined) updateData.stock_qty = Number(updateData.stock_qty);
    if (updateData.unit_cost !== undefined) updateData.unit_cost = Number(updateData.unit_cost);
    if (updateData.purchase_price !== undefined) updateData.purchase_price = Number(updateData.purchase_price);

    const result = await itemService.updateItem(item_id, updateData, updated_by);
    res.status(200).json(result);
});

const deleteItem = asyncWrap(async (req, res) => {
    const item_id = Number(req.params.itemId);
    const result = await itemService.deleteItem(item_id);
    res.status(200).json(result);
});
const addPurchase = asyncWrap(async (req, res) => {
    const item_id = Number(req.params.itemId);
    const created_by = req.user.id;
    const result = await itemService.addPurchase(item_id, req.body, created_by);
    res.status(200).json(result);
});

const updateDevice = asyncWrap(async (req, res) => {
    const device_id = Number(req.params.deviceId);
    const updated_by = req.user.id;
    const result = await itemService.updateDevice(device_id, req.body, updated_by);
    res.status(200).json(result);
});

const updateOtherItem = asyncWrap(async (req, res) => {
    const other_item_id = Number(req.params.otherItemId);
    const result = await itemService.updateOtherItem(other_item_id, req.body);
    res.status(200).json(result);
});
const deleteDevice = asyncWrap(async (req, res) => {
    const device_id = Number(req.params.deviceId);
    const result = await itemService.deleteDevice(device_id);
    res.status(200).json(result);
});

const deleteOtherItem = asyncWrap(async (req, res) => {
    const other_item_id = Number(req.params.otherItemId);
    const result = await itemService.deleteOtherItem(other_item_id);
    res.status(200).json(result);
});

export default { createItem, findAllItemsByCategoryId, findItemById, updateItem, deleteItem, addPurchase, updateDevice, updateOtherItem, deleteDevice, deleteOtherItem }