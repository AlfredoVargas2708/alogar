const router = require('express').Router();

const productsRoutes = require('./products.routes');
const salesRoutes = require('./sales.routes');
const emailRoutes = require('./emails.routes');
const usersRoutes = require('./users.routes')

router.use('/products', productsRoutes);
router.use('/sales', salesRoutes);
router.use('/emails', emailRoutes);
router.use('/users', usersRoutes);

module.exports = router;