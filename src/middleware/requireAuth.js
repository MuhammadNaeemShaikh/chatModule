const jwt = require('jsonwebtoken')

const requireAuth = async  (req, res, next) => {
  try {
      // verify user is authenticated
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({msg: 'Authorization token required'})
  }
    const token = req.headers.authorization.split(' ')[1];

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.id;
    if (req.params.id && req.params.id !== userId) {
      res.status(400).json({msg: 'Invalid user ID thats why you dont have access.'});
    } else {
      next();
    }
  } catch (error) {
    res.status(400).json({msg: 'Invalid token.'});
 }
};
module.exports = requireAuth;