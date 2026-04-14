const User = require("../model/User");

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username")
      .populate("followRequests", "username");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -followRequests")
      .populate("followers", "username")
      .populate("following", "username");

    if (user) {
      // If private and not following, we can return limited info here, but we will return everything
      // the frontend will hide posts based on `user.isPrivate` and checking if logged-in user is in `followers`
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("username");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow || !currentUser)
      return res.status(404).json({ message: "User not found" });

    // Ensure users don't duplicate
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId.toString(),
    );
    const isRequested = userToFollow.followRequests.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      userToFollow.followers.pull(req.user._id);
    } else {
      // Direct Follow
      currentUser.following.push(targetUserId);
      userToFollow.followers.push(req.user._id);
    }

    await currentUser.save();
    await userToFollow.save();
    res.json({ message: "Action processed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const currentUser = await User.findById(req.user._id);
    const requester = await User.findById(requesterId);

    if (
      currentUser.followRequests.some(
        (id) => id.toString() === requesterId.toString(),
      )
    ) {
      currentUser.followRequests.pull(requesterId);
      currentUser.followers.push(requesterId);
      requester.following.push(req.user._id);

      await currentUser.save();
      await requester.save();
      res.json({ message: "Request accepted" });
    } else {
      res.status(400).json({ message: "No request found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const currentUser = await User.findById(req.user._id);

    if (
      currentUser.followRequests.some(
        (id) => id.toString() === requesterId.toString(),
      )
    ) {
      currentUser.followRequests.pull(requesterId);
      await currentUser.save();
      res.json({ message: "Request rejected" });
    } else {
      res.status(400).json({ message: "No request found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const togglePrivacy = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    currentUser.isPrivate = !currentUser.isPrivate;
    await currentUser.save();
    res.json({ isPrivate: currentUser.isPrivate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  getUserProfile,
  searchUsers,
  followUser,
  acceptRequest,
  rejectRequest,
  togglePrivacy,
};
