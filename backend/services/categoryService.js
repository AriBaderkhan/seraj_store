import appError from "../utils/appError.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import path from "path";

async function createCategory({ name, description, image }) {

    const created = await categoryModel.create({ name, description, image });
    if (!created) throw appError('FAILED_CREATE_CATEGORY', 'Category not created', 400);
    return created;
}

async function findAllCategories() {
    const categories = await categoryModel.findAll();
    if (!categories) throw appError('FAILED_FIND_ALL_CATEGORIES', 'Categories not found', 400);
    return categories;
}

async function findCategoryById(category_id) {
    const category = await categoryModel.findCategoryById(category_id);
    if (!category) throw appError('FAILED_FIND_CATEGORY_BY_ID', 'Category not found', 400);
    return category;
}

function deleteFileIfExists(publicPath) {
    // publicPath example: "/uploads/categories/xxx.webp"
    if (!publicPath || publicPath.startsWith('http')) return;

    const relative = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
    const fullPath = path.join(process.cwd(), relative);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}
async function updateCategory(category_id, { name, description, newImage }) {
    const existing = await categoryModel.findCategoryById(category_id);
    if (!existing) throw appError("CATEGORY_NOT_FOUND", "Category not found", 404);

    let image = existing.image;

    if (newImage) {
        if (existing.image) {
            deleteFileIfExists(existing.image);
        }
        image = newImage;
    }

    const updated = await categoryModel.updateById(name, description, image, category_id);
    if (!updated) throw appError('FAILED_UPDATE_CATEGORY', 'Category not updated', 400);
    return updated;
}

async function deleteCategoryById(category_id) {
    const deleted = await categoryModel.deleteCategoryById(category_id);
    if (!deleted) throw appError('FAILED_DELETE_CATEGORY_BY_ID', 'Category not deleted', 400);
    return deleted;
}

export default { createCategory, findAllCategories, findCategoryById, updateCategory, deleteCategoryById }