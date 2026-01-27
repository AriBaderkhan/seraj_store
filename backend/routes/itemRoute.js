import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import validateIdParam from '../validates/idValidate.js';

import uploadImage from '../middlewares/uploadImage.js';

import itemController from '../controllers/itemController.js';
import validateItem from '../validates/itemValidate.js';
import validatePurchase from '../validates/purchaseValidate.js';

router.use(authMiddleware)

router.post('/',
    roleMiddleware('admin', 'manager', 'staff'),
    uploadImage("items").single("image"),
    validateItem.createItem,
    itemController.createItem
)

router.get('/:categoryId',
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam('categoryId'),
    itemController.findAllItemsByCategoryId
)

router.get('/details/:id',
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam('id'),
    itemController.findItemById
)

router.put('/:id',
    roleMiddleware('admin', 'manager', 'staff'),
    uploadImage("items").single("image"),
    validateItem.updateItem,
    itemController.updateItem
)

router.delete('/:itemId',
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam('itemId'),
    itemController.deleteItem
)


router.post('/:itemId/add_purchase',
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam('itemId'),
    validatePurchase.createPurchase,
    itemController.addPurchase
)

router.put('/update_device/:deviceId',
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam('deviceId'),
    validatePurchase.updateDevice,
    itemController.updateDevice
)

router.put('/update_other_item/:otherItemId',
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam('otherItemId'),
    validatePurchase.updateOther,
    itemController.updateOtherItem
)

router.delete('/delete_device/:deviceId',
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam('deviceId'),
    itemController.deleteDevice
)

router.delete('/delete_other_item/:otherItemId',
    roleMiddleware('admin', 'manager', 'staff'),
    validateIdParam('otherItemId'),
    itemController.deleteOtherItem
)
export default router;