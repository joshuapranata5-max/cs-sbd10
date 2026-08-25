const TransactionService = require('../../../src/services/transaction.service');
const Transaction = require('../../../src/models/transaction.model');
const Item = require('../../../src/models/item.model');
const { AppError } = require('../../../src/middleware/errorHandler');

jest.mock('../../../src/models/transaction.model');
jest.mock('../../../src/models/item.model');

describe('TransactionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create transaction successfully if stock is sufficient', async () => {
      const mockItem = { id: 1, name: 'Item A', price: 100, stock: 10 };
      const reqData = { user_id: 1, item_id: 1, quantity: 2, description: 'Test' };
      
      Item.findById.mockResolvedValue(mockItem);
      Transaction.create.mockResolvedValue({ id: 100, total: 200, ...reqData });

      const result = await TransactionService.createTransaction(reqData);
      
      expect(Item.findById).toHaveBeenCalledWith(1);
      expect(Transaction.create).toHaveBeenCalledWith({
        ...reqData,
        total: 200 // 100 * 2
      });
      expect(result.total).toBe(200);
    });

    it('should throw 404 if item not found', async () => {
      Item.findById.mockResolvedValue(null);
      await expect(TransactionService.createTransaction({ item_id: 99 })).rejects.toThrow('Item not found');
    });

    it('should throw 400 if stock is insufficient', async () => {
      Item.findById.mockResolvedValue({ id: 1, stock: 1 });
      await expect(TransactionService.createTransaction({ item_id: 1, quantity: 5 })).rejects.toThrow('Insufficient stock');
    });
  });

  describe('payTransaction', () => {
    it('should change status to paid if transaction is pending', async () => {
      const mockTransaction = { id: 100, status: 'pending', total: 200 };
      Transaction.findById.mockResolvedValue(mockTransaction);
      Transaction.updateStatus.mockResolvedValue({ ...mockTransaction, status: 'paid' });

      const result = await TransactionService.payTransaction(100);
      expect(Transaction.updateStatus).toHaveBeenCalledWith(100, 'paid');
      expect(result.transactionId).toBe(100);
    });

    it('should throw error if transaction is not pending', async () => {
      Transaction.findById.mockResolvedValue({ id: 100, status: 'paid' });
      await expect(TransactionService.payTransaction(100)).rejects.toThrow('Transaction is not pending');
    });
  });
});
