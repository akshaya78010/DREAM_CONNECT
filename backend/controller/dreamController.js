const Dream = require('../model/Dream');

const getDreams = async (req, res) => {
  try {
    const dreams = await Dream.find({ isPrivate: false })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json(dreams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeFeed = async (req, res) => {
  try {
    const User = require('../model/User');
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });
    
    // Find public dreams from people followed by the current user
    const dreams = await Dream.find({ 
      user: { $in: currentUser.following },
      isPrivate: false 
    })
    .populate('user', 'username email')
    .sort({ createdAt: -1 });
    res.json(dreams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyDreams = async (req, res) => {
  try {
    const dreams = await Dream.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(dreams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDream = async (req, res) => {
  try {
    const { title, description, category, location, isPrivate, milestones } = req.body;
    let mediaUrl = '';
    let mediaType = 'none';
    let media = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        let type = 'none';
        if (file.mimetype.startsWith('video/')) type = 'video';
        else if (file.mimetype.startsWith('audio/')) type = 'audio';
        else if (file.mimetype.startsWith('image/')) type = 'image';
        
        const url = `http://localhost:3000/uploads/${file.filename}`;
        media.push({ url, mType: type });
        
        if (index === 0) {
          mediaUrl = url;
          mediaType = type;
        }
      });
    }

    const parsedMilestones = milestones ? JSON.parse(milestones) : [];

    const dream = new Dream({
      user: req.user._id,
      title, description, category, location, 
      isPrivate: isPrivate === 'true',
      milestones: parsedMilestones,
      mediaUrl, mediaType, media
    });
    
    const createdDream = await dream.save();
    res.status(201).json(createdDream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleMilestone = async (req, res) => {
  try {
    const dream = await Dream.findById(req.params.id);
    if (!dream) return res.status(404).json({ message: 'Dream not found' });
    if (dream.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    
    const milestone = dream.milestones.id(req.params.milestoneId);
    if (milestone) {
      milestone.completed = !milestone.completed;
      await dream.save();
      res.json(dream);
    } else {
      res.status(404).json({ message: 'Milestone not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markFulfilled = async (req, res) => {
  try {
    const dream = await Dream.findById(req.params.id);
    if (!dream) return res.status(404).json({ message: 'Dream not found' });
    if (dream.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    
    dream.isFulfilled = true;
    await dream.save();
    res.json(dream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeDream = async (req, res) => {
  try {
    const dream = await Dream.findById(req.params.id);
    if (!dream) return res.status(404).json({ message: 'Dream not found' });
    const isLiked = dream.likes.includes(req.user._id);
    if (isLiked) {
      dream.likes = dream.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      dream.likes.push(req.user._id);
    }
    await dream.save();
    res.json(dream.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const dream = await Dream.findById(req.params.id);
    if (!dream) return res.status(404).json({ message: 'Dream not found' });
    dream.comments.push({ user: req.user._id, text });
    await dream.save();
    
    // Return populated comments
    const populatedDream = await Dream.findById(req.params.id).populate('comments.user', 'username');
    res.status(201).json(populatedDream.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDreams, getHomeFeed, getMyDreams, createDream, toggleMilestone, markFulfilled, likeDream, addComment };
