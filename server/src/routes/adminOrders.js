const express = require('express');
const requireAdmin = require('../middleware/requireAdmin');
const { list, detail, updateStatus } = require('../controllers/adminOrdersController');

const router = express.Router();

router.use(requireAdmin);

router.get('/', list);
router.get('/:id', detail);
router.patch('/:id', updateStatus);

module.exports = router;
