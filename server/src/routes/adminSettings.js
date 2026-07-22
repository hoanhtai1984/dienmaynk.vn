const express = require('express');
const { update } = require('../controllers/adminSettingsController');
const { uploadThemeImage } = require('../controllers/adminThemeUploadController');
const { get: getMailSettings, update: updateMailSettings } = require('../controllers/adminMailSettingsController');
const { get: getOAuthSettings, update: updateOAuthSettings } = require('../controllers/adminOAuthSettingsController');
const { upload, convertToWebp } = require('../middleware/uploadTheme');
const requireAdmin = require('../middleware/requireAdmin');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAdmin);
router.use(requireRole('OWNER', 'MANAGER'));

router.put('/', update);
router.post('/theme-upload', upload.single('image'), convertToWebp, uploadThemeImage);
router.get('/mail', getMailSettings);
router.put('/mail', updateMailSettings);
router.get('/oauth', getOAuthSettings);
router.put('/oauth', updateOAuthSettings);

module.exports = router;
