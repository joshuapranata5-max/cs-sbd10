const UserService = require('../services/user.service');
const { AppError } = require('../middleware/errorHandler');
const redis = require('../database/redis');
const User = require('../models/user.model');

class UserController {
  static async register(req, res, next) {
    try {
      const { name, username, email, phone, password } = req.body;
      const user = await UserService.register({ name, username, email, phone, password });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { id, name, username, email, phone, password, balance } = req.body;
      const updatedUser = await UserService.updateProfile(id, { name, username, email, phone, password, balance });

      if (updatedUser && updatedUser.email){
        const redisKey = `user:${updatedUser.email}`;
        await redis.del(redisKey);
        console.log(`Cache Invalidation: Redis Key'${redisKey}' berhasil dihapus.`);
      }
      res.status(200).json({
        success: true, 
        message: 'User updated successfully',
        payload: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionHistory(req, res, next) {
    try {
      // For simplicity, use user_id from query param (insecure)
      const userId = req.query.user_id || 1;
      const history = await UserService.getTransactionHistory(userId);
      res.status(200).json({
        success: true,
        message: 'Transaction history retrieved',
        payload: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTotalSpent(req, res, next) {
    try {
      const userId = req.query.user_id || 1;
      const totalSpent = await UserService.getTotalSpent(userId);
      res.status(200).json({
        success: true,
        message: 'Total spent retrieved',
        payload: { total_spent: totalSpent },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserByEmail(req, res){
    try{
      const {email} = req.params;
      const redisKey = `user:${email}`;
      const cacheedData = await redis.get(redisKey);

      if (cacheedData){
        return res.status(200).json({
          success: true,
          message: "User retrieved from cache",
          payload: JSON.parse(cacheedData)
        })
      }

      const user = await UserService.getUserByEmail(email);

      if (!user){
        return res.status(400).json({
          success: false,
          message: 'User not found'
        })
      }
      await redis.set(redisKey, JSON.stringify(user), 'EX', 60)
      res.status(200).json({
        success : true,
        message: "Data retrieved from postgreSQL (Cache Miss)",
        payload : user
      })
    } catch(err){
      next(err);
    }
  }
}

module.exports = UserController;