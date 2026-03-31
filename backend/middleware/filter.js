const Filter = require('bad-words');
const filter = new Filter();

const filterContent = (req, res, next) => {
  if (req.body.content) {
    try {
      req.body.content = filter.clean(req.body.content);
    } catch (e) {
      // If bad-words fails, pass through
    }
  }
  next();
};

module.exports = filterContent;
