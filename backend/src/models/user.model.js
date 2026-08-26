const { prisma } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });
    return user;
  }

  static async create({ name, username, email, phone, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        phone,
        password: hashedPassword,
      },
    });
    return user;
  }

  // Used to increment or update balance based on context
  // The original updateBalance used SET balance = balance + $1 OR SET balance = $1 depending on the exact method signature.
  // We'll provide both. Let's see how it was called in transaction service. It passed `amount` or `newBalance`.
  // Wait, there are two `updateBalance` methods in the previous code!
  static async updateBalance(id, amount_or_newBalance, isIncrement = false) {
    // By default, if the transaction logic expects setting the absolute balance, we do that.
    // Let's implement setting new balance as the primary, increment if explicitly requested.
    let data = { balance: amount_or_newBalance };
    if (isIncrement) {
        data = { balance: { increment: amount_or_newBalance } };
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data,
    });
    return user.balance; // returning just the balance as expected by some old methods
  }

  static async updateProfile(id, { name, phone }) {
    const user = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        phone,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        balance: true,
        created_at: true,
      },
    });
    return user;
  }

  static async getTransactions(userId) {
    const transactions = await prisma.transaction.findMany({
      where: { user_id: parseInt(userId, 10) },
      orderBy: { created_at: 'desc' },
    });
    return transactions;
  }

  static async getTransactionHistory(userId) {
    const transactions = await prisma.transaction.findMany({
      where: { user_id: parseInt(userId, 10) },
      orderBy: { created_at: 'desc' },
      include: {
        item: {
          select: {
            name: true,
            price: true,
          }
        }
      }
    });

    // Map to match the old SQL structure expectation
    return transactions.map(t => ({
      transaction_id: t.id,
      quantity: t.quantity,
      total: t.total,
      status: t.status,
      created_at: t.created_at,
      item_name: t.item.name,
      item_price: t.item.price,
    }));
  }

  static async getTotalSpent(userId) {
    const result = await prisma.transaction.aggregate({
      _sum: {
        total: true,
      },
      where: {
        user_id: parseInt(userId, 10),
        status: 'paid',
      },
    });
    return result._sum.total || 0;
  }
}

module.exports = User;