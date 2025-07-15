const router = require('express').Router();

const { SalesController } = require('../controllers/index');
let SalesCtrl = new SalesController();

router.get('/', SalesCtrl.getSales);
router.get('/between-dates', SalesCtrl.getSalesBetween)

module.exports = router;
