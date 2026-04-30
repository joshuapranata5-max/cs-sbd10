const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');
const bcrypt = require('bcrypt');

class UserService {
  static async register({ name, username, email, phone, password }) {
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      throw new AppError('User with this email already exists', 400);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
    });

    return user;
  }

  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    return { user: { id: user.id, name: user.name, username: user.username, email: user.email, phone: user.phone, balance: user.balance } };
  }

  static async updateProfile(id, updateData) {

    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const updatedUser = await User.update(id, updateData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    return updatedUser;
  }

  static async getTransactionHistory(userId) {

    const transactions = await User.getTransactions(userId);
    return transactions;
  }

  static async getTotalSpent(userId) {
    
    const transactions = await User.getTransactions(userId);
    const total = transactions.reduce((sum, t) => sum + t.total, 0);
    return total;
  }

  static async getUserByEmail(email) {
    const user = await User.findByEmail(email);
    return user; 
  }
}

module.exports = UserService;