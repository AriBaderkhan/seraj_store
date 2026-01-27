import asyncWrap from "../utils/asyncWrap.js";
import saleService from '../services/saleService.js'
import { buildBillAsPDF } from '../src/pdf/buildBillAsPDF.js'
const findItem = asyncWrap(async (req, res) => {
    const { query } = req.query
    const result = await saleService.findItem(query)
    res.status(200).json({
        success: true,
        message: "Item found successfully",
        data: result
    })
})

const saleCreate = asyncWrap(async (req, res) => {
    const { total_amount, total_paid, customer_name, payment_method } = req.body
    const sold_by = req.user.id
    const result = await saleService.saleCreate(total_amount, total_paid, customer_name, payment_method, sold_by)

    console.log(result.saleCreated.customer_name, result.saleCreated.payment_method)
    res.status(200).json({
        success: true,
        message: "Sale created successfully",
        data: result.saleCreated
    })
})

const findAllSales = asyncWrap(async (req, res) => {
    const { search } = req.query
    const result = await saleService.findAllSales(search);
    res.status(200).json({
        message: "All Sales Here",
        data: result
    })
})

const findSale = asyncWrap(async (req, res) => {
    const sale_id = Number(req.params.saleId);
    const result = await saleService.findSale(sale_id);
    res.status(200).json({
        message: "Sale Here",
        data: result
    })
})

const updateSale = asyncWrap(async (req, res) => {
    const sale_id = Number(req.params.saleId);
    const { total_amount, total_paid, customer_name, payment_method } = req.body
    const result = await saleService.updateSale(sale_id, total_amount, total_paid, customer_name, payment_method)
    res.status(200).json({
        message: "Sale updated successfully",
        data: result
    })
})

const deleteSale = asyncWrap(async (req, res) => {
    const sale_id = Number(req.params.saleId);
    const result = await saleService.deleteSale(sale_id)
    res.status(200).json({
        message: "Sale deleted successfully",
        data: result
    })
})


// Download Sale PDF
const downloadSalePdf = asyncWrap(async (req, res) => {
    const sale_id = Number(req.params.saleId);

    // Fetch Sale Data
    const sale = await saleService.findSale(sale_id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Construct Receipt Data Object (Re-using logic)
    const receiptData = {
        store: {
            name: "Seraj Phone",
            address: "Naz Naz Street"
        },
        customerName: sale.customer_name || "Walk-in",
        items: sale.items.map(item => ({
            item_name: item.item_name, // Ensure this field exists in query!
            quantity: item.quantity,
            warranty_end_date: item.warranty_end_date
        })),
        total: sale.total_amount,
        totalPaid: sale.total_paid,
        saleDate: sale.created_at
    };

    const pdfBuffer = await buildBillAsPDF(receiptData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Receipt_${sale_id}_${receiptData.saleDate}_${receiptData.customerName}.pdf"`);
    res.status(200).send(pdfBuffer);
});

export default { findItem, saleCreate, findAllSales, findSale, updateSale, deleteSale, downloadSalePdf }