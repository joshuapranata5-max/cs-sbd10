const UserService = require('../services/user.service');
const jwt = require('jsonwebtoken');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user } = await UserService.login(email, password);
      const payload = {
        userId: user.id,
        email: user.email
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: { user, token}
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;