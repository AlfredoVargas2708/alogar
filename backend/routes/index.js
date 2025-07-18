const router = require('express').Router();

const productsRoutes = require('./products.routes');
const salesRoutes = require('./sales.routes');
const emailRoutes = require('./emails.routes');

router.use('/products', productsRoutes);
router.use('/sales', salesRoutes);
router.use('/emails', emailRoutes);

module.exports = router;