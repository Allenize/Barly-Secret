const multer = require('multer');

const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png|gif|webp/;
  const allowedVideo = /mp4|webm|ogg|mov/;
  const isImage = allowedImage.test(file.mimetype);
  const isVideo = allowedVideo.test(file.mimetype) || file.mimetype.startsWith('video/');
  if (isImage || isVideo) cb(null, true);
  else cb(new Error('Only images and videos are allowed'));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter,
});

module.exports = upload;