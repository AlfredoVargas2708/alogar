const router = require('express').Router();

const { ProductsController } = require('../controllers/index')
let ProdCtrl = new ProductsController

router.get('/', ProdCtrl.getProducts);
router.get('/by-product/:product', ProdCtrl.getProductByName);
router.get('/by-category/:category_ids', ProdCtrl.getProductsByCategories);
router.get('/by-code/:code', ProdCtrl.getProductByCode);

module.exports = router;