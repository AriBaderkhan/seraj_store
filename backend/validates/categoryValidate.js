import Joi from 'joi';


const createCategorySchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    image: Joi.string().optional()
});

function createCategory(req, res, next) {
    const { error } = createCategorySchema.validate(req.body);
    if (error) {
        // If validation fails, we don't need to manually delete from memory storage.
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

const updateCategorySchema = createCategorySchema
    .fork(['name', 'description', 'image'], (field) => field.optional())

function updateCategory(req, res, next) {
    const { error } = updateCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
}

export default { createCategory, updateCategory };
