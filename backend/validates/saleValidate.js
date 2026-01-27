import Joi from 'joi';

const createSaleSchema = Joi.object({

    // Sale Header
    total_amount: Joi.number().required(),
    total_paid: Joi.number().required(), // For change calculation
    customer_name: Joi.string().allow('').optional(),
    payment_method: Joi.string().valid('cash', 'card', 'upi').default('cash').optional(),
});

function createSale(req, res, next) {
    const { error } = createSaleSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
}


const updateSaleSchema = Joi.object({
    total_amount: Joi.number().optional(),
    total_paid: Joi.number().optional(),
    customer_name: Joi.string().allow('').optional(),
    payment_method: Joi.string().valid('cash', 'card', 'upi').default('cash').optional(),
});
function updateSale(req, res, next) {
    const { error } = updateSaleSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
}


export default { createSale, updateSale }