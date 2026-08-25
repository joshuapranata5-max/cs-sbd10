const request = require('supertest');
const app = require('../../../src/app');
const TransactionService = require('../../../src/services/transaction.service');
const redis = require('../../../src/database/redis');
const jwt = require('jsonwebtoken');

jest.mock('../../../src/services/transaction.service');
jest.mock('../../../src/database/redis', () => ({
  xadd: jest.fn(),
}));

describe('Transaction Routes', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ userId: 1, email: 'test@test.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /transaction/create', () => {
    it('should create transaction and return 201', async () => {
      const reqBody = { user_id: 1, item_id: 1, quantity: 2, description: 'Test' };
      const mockTx = { id: 100, total: 200, ...reqBody };
      
      TransactionService.createTransaction.mockResolvedValue(mockTx);
      redis.xadd.mockResolvedValue('12345-0');

      const response = await request(app)
        .post('/transaction/create')
        .set('Authorization', `Bearer ${token}`)
        .send(reqBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.payload).toEqual(mockTx);
      expect(redis.xadd).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app)
        .post('/transaction/create')
        .send({ user_id: 1, item_id: 1, quantity: 2 });

      expect(response.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/transaction/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ user_id: 'not_an_int', item_id: 1, quantity: -1 }); // Invalid data

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('User ID must be an integer');
    });
  });

  describe('POST /transaction/pay/:id', () => {
    it('should pay transaction and return 200', async () => {
      TransactionService.payTransaction.mockResolvedValue({ transactionId: 100 });

      const response = await request(app)
        .post('/transaction/pay/100')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.payload.status).toBe('paid');
    });
  });
});
