import saleModel from '../models/saleModel.js'
import pool from '../db_connection.js'
import itemModel from '../models/itemModel.js'
import appError from '../utils/appError.js'
import cartModel from '../models/cartModel.js'

async function findItem(query) {
    const result = await saleModel.findItem(query)
    return result
}

async function saleCreate(total_amount, total_paid, customer_name, payment_method, sold_by) {
    const client = await pool.connect()

    try {
        await client.query("BEGIN");

        const saleCreated = await saleModel.saleCreate({
            customer_name, total_amount, total_paid, payment_method, sold_by
        }, client)
        const sale_id = saleCreated.id

        const items = await cartModel.findAllItemsInCart();
        for (const item of items) {
            const itemData = await itemModel.findItemById(item.item_id)
            if (!itemData) throw appError('ITEM_NOT_FOUND', 'Item not found', 404)

            let warrantyStartDate = null;
            let warrantyEndDate = null;

            if (item.imei) {
                // PHONE LOGIC
                const imeisList = await itemModel.findImeisByItemId({ item_id: item.item_id });
                const targetImei = imeisList.find(row => row.imei1 === item.imei || row.imei2 === item.imei);

                if (!targetImei) throw appError('IMEI_NOT_FOUND', `IMEI ${item.imei} not found`, 404);
                if (targetImei.status === 'sold') throw appError('ITEM_ALREADY_SOLD', `Item ${item.imei} already sold`, 400);

                if (targetImei.warranty_month) {
                    warrantyStartDate = new Date();
                    const end = new Date();
                    end.setMonth(end.getMonth() + targetImei.warranty_month);
                    warrantyEndDate = end;
                }

                // Update IMEI Status
                await client.query("UPDATE item_imeis SET status = 'sold' WHERE imei1 = $1", [item.imei]);
            } else {
                // PRODUCT LOGIC
                if (item.qty > itemData.stock_qty) throw appError('INSUFFICIENT_STOCK', 'Insufficient stock', 400);
                const UpdatedStock = itemData.stock_qty - item.quantity;
                await itemModel.updateItemStockQty(client, item.item_id, UpdatedStock)
            }

            // Create Sale Item
            await saleModel.saleItemCreate({
                sale_id,
                item_id: item.item_id,
                qty: item.quantity,
                unit_price: item.selling_price,
                imei: item.imei || null,
                warranty_start_date: warrantyStartDate || null,
                warranty_end_date: warrantyEndDate || null
            }, client)
        }
        const receiptData = {
            store: {
                name: "Seraj Phone",
                address: "Naz Naz Street"
            },
            customerName: customer_name || "Walk-in",
            items,
            totalPaid: total_paid,
            saleDate: saleCreated.created_at
        }

        await cartModel.deleteEntireCart();
        await client.query("COMMIT");
        return {
            saleCreated,
            receiptData
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }

}

async function findAllSales(search) {
    const result = await saleModel.findAllSales(search);
    if (!result) return [];
    return result
}
async function findSale(sale_id) {
    const sale = await saleModel.findSale(sale_id);
    if (!sale) return []
    return sale;
}

async function updateSale(sale_id, total_amount, total_paid, customer_name, payment_method) {
    const sale = await saleModel.findSale(sale_id);
    if (!sale) throw appError('SALE_NOT_FOUND', 'Sale not found', 404)
    const fields = {
        total_amount,
        total_paid,
        customer_name,
        payment_method
    }
    const result = await saleModel.updateSale(sale_id, fields)
    return result
}

async function deleteSale(sale_id) {
    const sale = await saleModel.findSale(sale_id);
    if (!sale) throw appError('SALE_NOT_FOUND', 'Sale not found', 404)
    const result = await saleModel.deleteSale(sale_id)
    return result
}

export default { findItem, saleCreate, findAllSales, findSale, updateSale, deleteSale }