const multer = require('multer');

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const mime = allowed.test(file.mimetype);
  if (mime) cb(null, true);
  else cb(new Error('Only images are allowed'));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB
  fileFilter,
});

module.exports = upload;