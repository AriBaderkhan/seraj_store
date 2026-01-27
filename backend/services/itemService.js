import appError from "../utils/appError.js";
import pool from "../db_connection.js"; // Added missing import
import categoryModel from "../models/categoryModel.js";
import itemModel from "../models/itemModel.js";
import purchaseModel from "../models/purchaseModel.js"; // Added missing import

async function createItem(allInputs) {
    const { name, brand_id, category_id, is_imei_required, details, image,
        storage, sim_type, color, imei1, imei2, purchase_price, status,
        qty, unit_cost, stock_qty, serial_no, purchase_notes, created_by,
        unit_sell_price, selling_price, warranty_month, phone_detail, other_item_detail } = allInputs;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        let item_id;

        const purchase = await purchaseModel.createPurchase(client, { created_by, notes: purchase_notes ?? null });
        if (!purchase) throw new appError("FAILED_CREATE_PURCHASE", "Purchase not created", 400);
        const purchase_id = purchase.id;
        if (is_imei_required === true) {
            const item = await itemModel.createItemPhones(client, {
                name, brand_id, category_id,
                is_imei_required, details, image,
                storage, sim_type, color, created_by, serial_no
            });
            item_id = item.id;
            const itemImei = await itemModel.createImeiRow(client, {
                item_id, imei1, imei2, purchase_price, selling_price, status, created_by, warranty_month, phone_detail, purchase_id
            });

        } else {
            const item = await itemModel.createItemOthers(client, {
                name, brand_id, category_id,
                stock_qty, is_imei_required, details, image, created_by, serial_no
            });
            item_id = item.id;

            const purchaseRow = await itemModel.createPurchaseRow(client, {
                item_id, purchase_id, stock_qty, unit_cost, unit_sell_price, other_item_detail
            });
        }

        await client.query("COMMIT");
        return { message: "Item created successfully", itemId: item_id }; // Return something

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function findAllItemsByCategoryId(category_id, filters) {
    const category = await categoryModel.findCategoryById(category_id);
    if (!category) throw new appError("CATEGORY_NOT_FOUND", "Category not found", 404);

    const result = await itemModel.findAllItemsByCategoryId(category_id, filters);
    return result;
}

async function findItemById(item_id) {
    const item = await itemModel.findItemById(item_id);
    if (!item) throw new appError("ITEM_NOT_FOUND", "Item not found", 404);

    if (item.is_imei_required) {
        // If it's a phone, fetch the IMEIs
        const imeis = await itemModel.findImeisByItemId(item_id);

        // Calculate dynamic stock for display
        const stock_count = imeis.filter(i => i.status === 'in_stock').length;

        // Return item merged with IMEI info
        return {
            ...item,
            stock_qty: stock_count, // Override static qty with real count
            imeis: imeis            // List of serials
        };
    } else {
        const purchase = await itemModel.findPurchaseByItemId(item_id);

        return {
            ...item,
            purchase: purchase
        };
    }
}

async function updateItem(item_id, updateData, updated_by) {
    const item = await itemModel.findItemById(item_id);
    if (!item) throw new appError("ITEM_NOT_FOUND", "Item not found", 404);

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 0. Remove undefined/null keys to safe-guard dynamic queries
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);


        // 1. Separate common item fields from correction fields
        const { purchase_price, selling_price, warranty_month, unit_cost, unit_sell_price, stock_qty, purchase_notes, ...itemFields } = updateData;

        // 2. Update basic item info if any
        if (Object.keys(itemFields).length > 0) {
            // Include updated_by in the general update
            await itemModel.updateItem(client, item_id, { ...itemFields, updated_by });
        }

        // 3. Correction Logic

        if (item.is_imei_required) {
            // PHONE: Fix purchase_price in item_imeis if provided
            if (purchase_price !== undefined) {
                await itemModel.updateItemPhonePrice(client, item_id, purchase_price, selling_price, warranty_month);
            } else if (unit_cost !== undefined) {
            }
        } else {
            if (unit_cost !== undefined || stock_qty !== undefined) {
                await itemModel.updateItemOtherStockCost(client, item_id, { stock_qty, unit_cost, unit_sell_price });
            }
            if (purchase_notes !== undefined) {
                await itemModel.updatePurchaseNotesByItemId(client, item_id, purchase_notes);
            }
        }

        await client.query("COMMIT");
        return { message: "Item updated successfully" };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function deleteItem(item_id) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const item = await itemModel.findItemById(item_id);
        if (!item) throw new appError("FAILED_FEATCHED_ITEM", "Item Not exist", 400);

        // Delete dependencies first (Foreign Key Logic)
        await itemModel.deleteImeisByItemId(client, item_id);
        await itemModel.deletePurchaseItemsByItemId(client, item_id);

        // Delete the item
        await itemModel.deleteItem(client, item_id);

        await client.query("COMMIT");
        return { message: "Item deleted successfully" };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
async function addPurchase(item_id, body, created_by) {
    const { imei1, imei2, purchase_price, selling_price, status, warranty_month, phone_detail, unit_sell_price, unit_cost, qty, other_item_detail, purchase_notes } = body
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const item = await itemModel.findItemById(item_id);
        const isphone = item.is_imei_required;

        const purchase = await purchaseModel.createPurchase(client, { created_by, purchase_notes });
        if (!purchase) throw new appError("FAILED_CREATE_PURCHASE", "Purchase not created", 400);
        const purchase_id = purchase.id;

        if (isphone) {
            const itemImei = await itemModel.createImeiRow(client, {
                item_id, imei1, imei2, purchase_price, selling_price, status, warranty_month, phone_detail, created_by, purchase_id
            });
            const imeis = await itemModel.findImeisByItemId(item_id);
            const stock_qty = imeis.filter(i => i.status === 'in_stock').length;
            await itemModel.updateItemStockQty(client, item_id, stock_qty);
        } else {
            const purchaseRow = await itemModel.createPurchaseRow(client, {
                item_id, purchase_id, qty, unit_cost, unit_sell_price, other_item_detail
            });
            const update_stock_qty = item.stock_qty += purchaseRow.qty;
            await itemModel.updateItemStockQty(client, item_id, update_stock_qty);
        }


        await client.query("COMMIT");
        return { message: "Purchase added successfully", purchaseId: purchase.id };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function updateDevice(device_id, body, updated_by) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const device = await purchaseModel.findDeviceById(client, device_id);
        if (!device) throw new appError("FAILED_FEATCHED_DEVICE", "Device Not exist", 400);
        const item_id = device.item_id;
        const { purchase_notes, ...deviceFields } = body;
        await purchaseModel.updateDevice(client, deviceFields, device_id, updated_by);

        if (purchase_notes !== undefined) {
            await itemModel.updatePurchaseNotesByItemId(client, item_id, purchase_notes);
        }
        await client.query("COMMIT");
        return { message: "Device updated successfully" };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function updateOtherItem(other_item_id, body) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const oter_item = await purchaseModel.findOtherItemById(client, other_item_id);
        if (!oter_item) throw new appError("FAILED_FEATCHED_DEVICE", "Device Not exist", 400);
        const item_id = oter_item.item_id;
        const { purchase_notes, ...other_item_fields } = body;
        const updatedOtherItem = await purchaseModel.updateOtherItem(client, other_item_fields, other_item_id);

        if (purchase_notes !== undefined) {
            await itemModel.updatePurchaseNotesByItemId(client, item_id, purchase_notes);
        }

        if (updatedOtherItem.qty !== undefined) {
            const item = await itemModel.findItemById(item_id);
            const oldQty = oter_item.qty || 0;
            const newQty = updatedOtherItem.qty;
            const diff = Number(newQty) - Number(oldQty);

            const update_stock_qty = Number(item.stock_qty) + diff;
            await itemModel.updateItemStockQty(client, item_id, update_stock_qty);
        }
        await client.query("COMMIT");
        return { message: "Other Item updated successfully" };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function deleteDevice(device_id) {
    const client = await pool.connect();
    try {
        const device = await purchaseModel.findDeviceById(client, device_id);
        if (!device) throw new appError("FAILED_FEATCHED_DEVICE", "Device Not exist", 400);
        await purchaseModel.deleteDevice(client, device_id);
        return { message: "Device deleted successfully" };
    } finally {
        client.release();
    }
}

async function deleteOtherItem(other_item_id) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN"); // Use transaction for safety

        const oter_item = await purchaseModel.findOtherItemById(client, other_item_id);
        if (!oter_item) throw new appError("FAILED_FEATCHED_DEVICE", "Device Not exist", 400);

        const item_id = oter_item.item_id;
        const deletedQty = Number(oter_item.qty || 0);

        // Delete the batch
        await purchaseModel.deleteOtherItem(client, other_item_id);

        // Update Total Stock
        const item = await itemModel.findItemById(item_id);
        const currentStock = Number(item.stock_qty || 0);
        const newStock = Math.max(0, currentStock - deletedQty); // Prevent negative stock

        await itemModel.updateItemStockQty(client, item_id, newStock);

        await client.query("COMMIT");
        return { message: "Other Item deleted successfully" };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export default {
    createItem, findAllItemsByCategoryId, findItemById, updateItem, deleteItem,
    addPurchase, updateDevice, updateOtherItem, deleteDevice, deleteOtherItem
}





