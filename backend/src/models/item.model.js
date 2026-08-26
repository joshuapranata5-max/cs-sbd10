const { prisma } = require('../config/database');

class Item {
  static async findAll() {
    const items = await prisma.item.findMany({
      orderBy: { id: 'asc' },
    });
    return items;
  }

  static async findById(id) {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id, 10) },
    });
    return item;
  }

  static async create({ name, price, stock }) {
    const item = await prisma.item.create({
      data: {
        name,
        price,
        stock,
      },
    });
    return item;
  }

  static async update(id, { name, price, stock }) {
    const item = await prisma.item.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        price,
        stock,
      },
    });
    return item;
  }

  static async decreaseStock(id, quantity) {
    // In raw SQL we had AND stock >= quantity.
    // In Prisma, we can use an interactive transaction or rely on where condition.
    // But updateMany allows complex where, or we can just fetch and check, then update.
    // However, Prisma preview feature supports atomic updates with conditions.
    // For now, we can try catching the error or checking first if we don't have atomic check.
    // Actually, decrementing is atomic. We can decrement, but if it goes below zero we might violate a CHECK constraint if we had one.
    // Without CHECK constraint, we can do it in a transaction:
    return await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: parseInt(id, 10) } });
      if (!item || item.stock < quantity) {
        return null; // Equivalent to returning 0 rows in raw SQL if stock >= $1 failed
      }
      const updated = await tx.item.update({
        where: { id: parseInt(id, 10) },
        data: {
          stock: { decrement: quantity },
        },
        select: { stock: true }
      });
      return updated;
    });
  }
}

module.exports = Item;