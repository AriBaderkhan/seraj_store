import Joi from 'joi';

const createCartSchema = Joi.object({


    item_id: Joi.number().required(), // Item ID
    item_name: Joi.string().required(),
    imei: Joi.string().allow('', null).optional(),
    qty: Joi.number().integer().min(1).required(),
    selling_price: Joi.number().required(),
});

function createCart(req, res, next) {
    const { error } = createCartSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
}

export default { createCart }