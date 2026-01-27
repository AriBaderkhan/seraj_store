import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import validateIdParam from '../validates/idValidate.js';

import cartValidate from '../validates/cartValidate.js';
import cartController from '../controllers/cartController.js';

router.use(authMiddleware)

router.post(
    "/",
    roleMiddleware('admin', 'manager', 'staff'),
    cartValidate.createCart,
    cartController.createCart
);

router.get(
    "/",
    roleMiddleware('admin', 'manager', 'staff'),
    cartController.findtheCurrentCart
);

router.delete(
    "/:cartId",
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam("cartId"),
    cartController.deleteCart
);
export default router;