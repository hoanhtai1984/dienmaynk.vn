const express = require('express');
const { create } = require('../controllers/ordersController');

const router = express.Router();

router.post('/', create);

module.exports = router;
