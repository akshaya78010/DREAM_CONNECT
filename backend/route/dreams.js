const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDreams, getHomeFeed, getMyDreams, createDream, toggleMilestone, markFulfilled, likeDream, addComment } = require('../controller/dreamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.get('/', getDreams);
router.get('/home-feed', protect, getHomeFeed);
router.get('/my-wall', protect, getMyDreams);
router.post('/', protect, upload.array('media', 10), createDream);
router.put('/:id/milestone/:milestoneId', protect, toggleMilestone);
router.put('/:id/fulfill', protect, markFulfilled);
router.put('/:id/like', protect, likeDream);
router.post('/:id/comment', protect, addComment);

module.exports = router;