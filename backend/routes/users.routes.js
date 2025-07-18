const router = require('express').Router();

const { UsersController } = require('../controllers/index');
let UserCtrl = new UsersController();

router.post('/reset-password', UserCtrl.resetPassword);

module.exports = router;