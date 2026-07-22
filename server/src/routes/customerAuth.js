const express = require('express');
const {
  register,
  login,
  googleLogin,
  facebookLogin,
  me,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  deleteAccount,
} = require('../controllers/customerAuthController');
const requireCustomer = require('../middleware/requireCustomer');
const { createLoginLimiter, createAccountActionLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', createAccountActionLimiter(), register);
router.post('/login', createLoginLimiter(), login);
router.post('/google', createAccountActionLimiter(), googleLogin);
router.post('/facebook', createAccountActionLimiter(), facebookLogin);
router.get('/me', requireCustomer, me);
router.patch('/me', requireCustomer, updateProfile);
router.delete('/me', requireCustomer, deleteAccount);
router.post('/logout', requireCustomer, logout);
router.post('/forgot-password', createAccountActionLimiter(), forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
