import asyncWrap from '../utils/asyncWrap.js';
import categoryService from '../services/categoryService.js';

const createCategory = asyncWrap(async (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const category = await categoryService.createCategory({ name, description, image });

    res.status(201).json({ message: "Category created successfully", data: category });
});

const findAllCategories = asyncWrap(async (req, res) => {
    const categories = await categoryService.findAllCategories();
    res.status(200).json({ message: "Categories found successfully", data: categories });
});

const findCategoryById = asyncWrap(async (req, res) => {
    const category_id = Number(req.params.categoryId);
    const category = await categoryService.findCategoryById(category_id);
    res.status(200).json({ message: "Category found successfully", data: category });
});


const updateCategoryById = asyncWrap(async (req, res) => {
    const category_id = Number(req.params.categoryId);
    const { name, description } = req.body;

    // if a new image uploaded, build the public path that you store in DB
    const newImage = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const updated = await categoryService.updateCategory(category_id,
        { name, description, newImage });

    res.status(200).json({ message: "Category updated successfully", data: updated });
});


const deleteCategoryById = asyncWrap(async (req, res) => {
    const category_id = Number(req.params.categoryId);
    const deleted = await categoryService.deleteCategoryById(category_id);
    res.status(200).json({ message: "Category deleted successfully", data: deleted });
});

export default { createCategory, findAllCategories, findCategoryById, updateCategoryById, deleteCategoryById };
