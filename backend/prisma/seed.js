const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Upsert Users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
      phone: '+1-555-0100',
      password: 'password123',
      balance: 50000,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob',
      username: 'bob',
      email: 'bob@example.com',
      phone: '+1-555-0101',
      password: 'qwerty',
      balance: 0,
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      name: 'Charlie',
      username: 'charlie',
      email: 'charlie@example.com',
      phone: '+1-555-0102',
      password: 'letmein',
      balance: 100000,
    },
  });

  // Upsert Items
  const laptop = await prisma.item.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Laptop',
      price: 1000000,
      stock: 10,
    },
  });

  const mouse = await prisma.item.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Mouse',
      price: 50000,
      stock: 100,
    },
  });

  const keyboard = await prisma.item.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Keyboard',
      price: 150000,
      stock: 50,
    },
  });

  const monitor = await prisma.item.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Monitor',
      price: 300000,
      stock: 20,
    },
  });

  // Upsert Transactions
  await prisma.transaction.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user_id: alice.id,
      item_id: laptop.id,
      quantity: 1,
      total: 1000000,
      status: 'paid',
      description: 'Beli laptop untuk kerja',
    },
  });

  await prisma.transaction.upsert({
    where: { id: 2 },
    update: {},
    create: {
      user_id: alice.id,
      item_id: mouse.id,
      quantity: 2,
      total: 100000,
      status: 'paid',
      description: 'Mouse cadangan',
    },
  });

  await prisma.transaction.upsert({
    where: { id: 3 },
    update: {},
    create: {
      user_id: bob.id,
      item_id: keyboard.id,
      quantity: 1,
      total: 150000,
      status: 'pending',
      description: 'Keyboard mekanikal',
    },
  });

  await prisma.transaction.upsert({
    where: { id: 4 },
    update: {},
    create: {
      user_id: charlie.id,
      item_id: monitor.id,
      quantity: 1,
      total: 300000,
      status: 'pending',
      description: 'Monitor 24 inch',
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
