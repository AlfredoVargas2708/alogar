const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const apiRoute = require('./routes/index');

app.use('/api', apiRoute)

app.listen(PORT, () => {
    console.log('Server running in http://localhost:3000')
})