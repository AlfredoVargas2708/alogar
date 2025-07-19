const router = require('express').Router();

const { UsersController } = require('../controllers/index');
let UserCtrl = new UsersController();

router.post('/sign-up', UserCtrl.signUp);
router.post('/login', UserCtrl.login);
router.post('/reset-password', UserCtrl.resetPassword);

module.exports = router;