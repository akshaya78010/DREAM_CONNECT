const express = require('express');
const { getMyProfile, getUserProfile, searchUsers, followUser, acceptRequest, rejectRequest, togglePrivacy } = require('../controller/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getMyProfile);
router.get('/search', searchUsers); // public search
router.get('/:id', protect, getUserProfile); // view other profiles
router.put('/:id/follow', protect, followUser);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);
router.put('/toggle-privacy', protect, togglePrivacy);

module.exports = router;