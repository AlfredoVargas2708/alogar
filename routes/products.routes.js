const router = require('express').Router();

const { ProductsController } = require('../controllers/index')
let ProdCtrl = new ProductsController

router.get('/', ProdCtrl.getProducts);

module.exports = router;