const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const dreamSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    category: { type: String, default: "General" },
    location: { type: String, default: "" },
    milestones: [milestoneSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    isFulfilled: { type: Boolean, default: false },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, default: "none" },
    media: [
      {
        url: String,
        mType: String,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Dream", dreamSchema);
