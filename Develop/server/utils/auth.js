const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req }, next) {
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    };

    if (!token) {
     // throw new Error('You have no token!');
     return req
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      context.user = data;
    } catch {
      console.log('Invalid token');
      throw new Error('invalid token!');
    }

    // send to next endpoint
    return req;
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
