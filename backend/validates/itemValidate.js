import Joi from 'joi';


const createItemSchema = Joi.object({
    // common
    name: Joi.string().required(),
    brand_id: Joi.number().required(),
    category_id: Joi.number().required(),

    is_imei_required: Joi.boolean().required(),

    details: Joi.string().allow('').optional(),
    image: Joi.string().allow('').optional(),

    // -------- PHONE ONLY --------
    storage: Joi.string().when("is_imei_required", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),

    sim_type: Joi.string().when("is_imei_required", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),

    color: Joi.string().when("is_imei_required", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden(), // covers can have color
    }),

    imei1: Joi.string().when("is_imei_required", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),

    imei2: Joi.string().allow('').when("is_imei_required", {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
    }),

    purchase_price: Joi.number().when("is_imei_required", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),

    selling_price: Joi.number().when("is_imei_required", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    status: Joi.string().valid("in_stock", "sold", "returned").when("is_imei_required", {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
    }),

    warranty_month: Joi.alternatives().try(Joi.number(), Joi.string().allow('').valid(null)).when("is_imei_required", {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
    }),
    // -------- NON-PHONE ONLY --------
    unit_cost: Joi.number().when("is_imei_required", {
        is: false,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),

    unit_sell_price: Joi.number().when("is_imei_required", {
        is: false,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),

    stock_qty: Joi.number().integer().min(0).when("is_imei_required", {
        is: false,
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
    }),

    serial_no: Joi.string().allow('').optional(),
    purchase_notes: Joi.string().allow('').optional(),
});

function createItem(req, res, next) {
    const { error } = createItemSchema.validate(req.body);
    if (error) {
        // Validation failure only returns error message; no file cleanup needed for memory storage
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

const updateItemSchema = Joi.object({
    // Optional Updates
    name: Joi.string().optional(),
    brand_id: Joi.number().optional(),
    category_id: Joi.number().optional(),
    details: Joi.string().allow('').optional(),
    image: Joi.string().allow('').optional(),

    // Phone Specs
    storage: Joi.string().optional(),
    sim_type: Joi.string().optional(),
    color: Joi.string().optional(),

    // Corrections
    stock_qty: Joi.number().integer().min(0).optional(),
    unit_cost: Joi.number().optional(),
    purchase_price: Joi.number().optional(),
    purchase_notes: Joi.string().allow('').optional(),

    // FORBIDDEN (Breaking changes)
    is_imei_required: Joi.forbidden(),
    imei1: Joi.forbidden(),
    imei2: Joi.forbidden(),

    // Allow serial_no in update too
    serial_no: Joi.string().allow('').optional(),
});

function updateItem(req, res, next) {
    const { error } = updateItemSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

export default { createItem, updateItem }