const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const VideoSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", VideoSchema);

exports.addVideo = (res, data) => {
  const video = new Video(data);

  return video
    .save()
   
};


exports.getAllVideos = () => {
 

return   Video.find()
};
