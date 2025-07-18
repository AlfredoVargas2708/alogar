const router = require('express').Router();

const { EmailController } = require('../controllers/index');
let EmailCtrl = new EmailController();

router.post('/restart', EmailCtrl.sendResetEmail)

module.exports = router