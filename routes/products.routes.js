const router = require('express').Router();

const { ProductsController } = require('../controllers/index')
let ProdCtrl = new ProductsController

module.exports = router;