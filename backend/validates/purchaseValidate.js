import Joi from 'joi';

const createPurchaseSchema = Joi.object({

    // -------- PHONE ONLY --------
    imei1: Joi.string().optional(),
    imei2: Joi.string().allow('').optional(),
    purchase_price: Joi.number().optional(),
    selling_price: Joi.number().optional(),
    status: Joi.string().valid("in_stock", "sold", "returned").optional(),
    warranty_month: Joi.alternatives().try(Joi.number(), Joi.string().allow('').valid(null)).optional(),
    phone_detail: Joi.string().allow('').optional(),

    // -------- NON-PHONE ONLY --------
    unit_cost: Joi.number().optional(),
    unit_sell_price: Joi.number().optional(),
    qty: Joi.number().integer().min(0).optional(),
    other_item_detail: Joi.string().allow('').optional(),

    purchase_notes: Joi.string().allow('').optional(),
});

function createPurchase(req, res, next) {
    const { error } = createPurchaseSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
}


const updateDeviceSchema = Joi.object({
    imei1: Joi.string().optional(),
    imei2: Joi.string().allow('').optional(),
    purchase_price: Joi.number().optional(),
    selling_price: Joi.number().optional(),
    status: Joi.string().valid("in_stock", "sold", "returned").optional(),
    warranty_month: Joi.alternatives().try(Joi.number(), Joi.string().allow('').valid(null)).optional(),
    purchase_notes: Joi.string().allow('').optional(),
});
function updateDevice(req, res, next) {
    const { error } = updateDeviceSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
}

const updateOtherSchema = Joi.object({
    unit_cost: Joi.number().allow('').optional(),
    unit_sell_price: Joi.number().optional(),
    qty: Joi.number().integer().min(0).optional(),
    other_item_detail: Joi.string().allow('').optional(),
    purchase_notes: Joi.string().allow('').optional(),
});
function updateOther(req, res, next) {
    const { error } = updateOtherSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
}
export default { createPurchase, updateDevice, updateOther }