import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import validateIdParam from '../validates/idValidate.js';
import validateBrand from '../validates/brandValidate.js';
import brandController from '../controllers/brandController.js';

router.use(authMiddleware)

router.post(
    "/",
    roleMiddleware('admin', 'manager', 'staff'),
    validateBrand.createBrand,
    brandController.createBrand
);

router.get(
    "/",
    roleMiddleware('admin', 'manager', 'staff'),
    brandController.findAllBrands
);

router.get(
    "/:brandId",
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam("brandId"),
    brandController.findBrandById
);

router.get(
    "/category/:categoryId",
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam("categoryId"),
    brandController.findBrandsByCategoryId
);

router.put(
    "/:brandId",
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam("brandId"),
    validateBrand.updateBrand,
    brandController.updateBrand
);

router.delete(
    "/:brandId",
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam("brandId"),
    brandController.deleteBrandById
);
export default router;