import Joi from 'joi';

const createBrandSchema = Joi.object({
    name: Joi.string().required(),
    category_ids: Joi.array().items(Joi.number().integer().positive()).required(),
    description: Joi.string().optional()
});

function createBrand(req, res, next) {
    const { error } = createBrandSchema.validate(req.body);
    if (error) { return res.status(400).json({ message: error.details[0].message }); }
    next();
}

const updateBrandSchema = createBrandSchema
    .fork(['name', 'category_ids', 'description'], (field) => field.optional())

function updateBrand(req, res, next) {
    const { error } = updateBrandSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
}

export default { createBrand, updateBrand };
