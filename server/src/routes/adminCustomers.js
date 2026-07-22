const express = require('express');
const requireAdmin = require('../middleware/requireAdmin');
const requireRole = require('../middleware/requireRole');
const { list, create, detail, setNeedsAttention, activity } = require('../controllers/adminCustomersController');

const router = express.Router();

router.use(requireAdmin);
router.use(requireRole('OWNER', 'MANAGER', 'STAFF'));

router.get('/', list);
router.post('/', create);
router.get('/activity', activity);
router.get('/:id', detail);
router.patch('/:id/needs-attention', setNeedsAttention);

module.exports = router;
