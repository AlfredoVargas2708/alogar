const router = require('express').Router();

const productsRoutes = require('./products.routes');

router.use('/products', productsRoutes);

module.exports = router;