const express = require('express');
const optionalCustomer = require('../middleware/optionalCustomer');
const { create } = require('../controllers/contactController');

const router = express.Router();

router.post('/', optionalCustomer, create);

module.exports = router;
