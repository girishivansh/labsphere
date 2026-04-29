const express = require('express');
const { getAllItems, getItemById, createItem, updateItem, deleteItem, getLowStockItems } = require('../controllers/itemsController');
const { authenticate, authorize, ROLES } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');
const router = express.Router();

router.use(authenticate, tenantScope);

router.get('/',          getAllItems);
router.get('/low-stock', getLowStockItems);
router.get('/:id',       getItemById);
router.post('/',         authorize(ROLES.INSTITUTE_ADMIN, ROLES.LAB_INCHARGE), createItem);
router.put('/:id',       authorize(ROLES.INSTITUTE_ADMIN, ROLES.LAB_INCHARGE), updateItem);
router.delete('/:id',    authorize(ROLES.INSTITUTE_ADMIN),                     deleteItem);

module.exports = router;
