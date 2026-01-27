import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import validateIdParam from '../validates/idValidate.js';
import validateCategory from '../validates/categoryValidate.js';
import uploadImage from '../middlewares/uploadImage.js';
import categoryController from '../controllers/categoryController.js';

router.use(authMiddleware)

router.post(
    "/",
    roleMiddleware('admin', 'manager', 'staff'),
    uploadImage("categories").single("image"),
    validateCategory.createCategory,
    categoryController.createCategory
);

router.get(
    "/",
    roleMiddleware('admin', 'manager', 'staff'),
    categoryController.findAllCategories
);

router.get(
    "/:categoryId",
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam("categoryId"),
    categoryController.findCategoryById
);

router.put(
    "/:categoryId",
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam("categoryId"),
    uploadImage("categories").single("image"),
    validateCategory.updateCategory,
    categoryController.updateCategoryById
);

router.delete(
    "/:categoryId",
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam("categoryId"),
    categoryController.deleteCategoryById
);
export default router;