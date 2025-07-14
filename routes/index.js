const router = require('express').Router();

router.get('/', (req, res) => {
    return res.status(200).json({ message: 'Hola desde la api!'})
})

module.exports = router;