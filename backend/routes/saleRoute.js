import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import validateIdParam from '../validates/idValidate.js';

import saleController from '../controllers/saleController.js';
import saleValidate from '../validates/saleValidate.js';
router.use(authMiddleware)

router.get(
    '/find_item',
    roleMiddleware('manager', 'staff', 'admin'),
    saleController.findItem
)
router.post(
    '/create_sale',
    roleMiddleware('manager', 'staff', 'admin'),
    saleValidate.createSale,
    saleController.saleCreate
)

router.get(
    '/',
    roleMiddleware('manager', 'staff', 'admin'),
    saleController.findAllSales
)

router.get(
    '/:saleId',
    roleMiddleware('manager', 'staff', 'admin'),
    validateIdParam('saleId'),
    saleController.findSale
)

router.put(
    '/:saleId',
    roleMiddleware('manager', 'staff', 'admin'),
    validateIdParam('saleId'),
    saleValidate.updateSale,
    saleController.updateSale
)
router.delete(
    '/:saleId',
    roleMiddleware('manager', 'staff', 'admin'),
    validateIdParam('saleId'),
    saleController.deleteSale
)

router.get(
    '/pdf/:saleId',
    roleMiddleware('manager', 'staff', 'admin'),
    saleController.downloadSalePdf
)

export default router
