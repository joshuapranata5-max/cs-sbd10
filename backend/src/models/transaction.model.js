const { prisma } = require('../config/database');

class Transaction {
  static async create({ user_id, item_id, quantity, total, description }) {
    const transaction = await prisma.transaction.create({
      data: {
        user_id: parseInt(user_id, 10),
        item_id: parseInt(item_id, 10),
        quantity: parseInt(quantity, 10),
        total: parseInt(total, 10),
        description,
      },
    });
    return transaction;
  }

  static async findById(id) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id, 10) },
    });
    return transaction;
  }

  static async findByUserId(userId) {
    const transactions = await prisma.transaction.findMany({
      where: { user_id: parseInt(userId, 10) },
      orderBy: { created_at: 'desc' },
    });
    return transactions;
  }

  static async updateStatus(id, status) {
    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });
    return transaction;
  }

  static async delete(id) {
    const transaction = await prisma.transaction.delete({
      where: { id: parseInt(id, 10) },
    });
    return transaction;
  }

  static async pay(transactionId, userId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get transaction and verify ownership
      const transaction = await tx.transaction.findUnique({
        where: { id: parseInt(transactionId, 10) },
      });

      if (!transaction || transaction.user_id !== parseInt(userId, 10)) {
        throw new Error('Transaction not found or does not belong to user');
      }
      if (transaction.status !== 'pending') {
        throw new Error('Transaction is not pending');
      }

      // 2. Get user balance
      const user = await tx.user.findUnique({
        where: { id: parseInt(userId, 10) },
      });

      if (!user || user.balance == null || user.balance < transaction.total) {
        throw new Error('Insufficient balance');
      }

      // 3. Deduct balance
      const newBalance = user.balance - transaction.total;
      await tx.user.update({
        where: { id: parseInt(userId, 10) },
        data: { balance: newBalance },
      });

      // 4. Update transaction status
      await tx.transaction.update({
        where: { id: parseInt(transactionId, 10) },
        data: { status: 'paid' },
      });

      return { success: true, newBalance, transactionId: transaction.id };
    });
  }
}

module.exports = Transaction;