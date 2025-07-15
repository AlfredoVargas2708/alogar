const router = require('express').Router();

const { ProductsController } = require('../backend/controllers/index')
let ProdCtrl = new ProductsController

router.get('/', ProdCtrl.getProducts);
router.get('/by-product/:product', ProdCtrl.getProductByName);

module.exports = router;