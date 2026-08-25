const request = require('supertest');
const app = require('../../../src/app');
const ItemService = require('../../../src/services/item.service');

jest.mock('../../../src/services/item.service');

describe('Item Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /items', () => {
    it('should return 200 and list of items', async () => {
      const mockItems = [{ id: 1, name: 'Item A', price: 100, stock: 10 }];
      ItemService.getAllItems.mockResolvedValue(mockItems);

      const response = await request(app).get('/items');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.payload).toEqual(mockItems);
    });
  });

  describe('POST /items', () => {
    it('should return 201 and created item', async () => {
      const reqBody = { name: 'Item B', price: 200, stock: 5 };
      const createdItem = { id: 2, ...reqBody };
      ItemService.createItem.mockResolvedValue(createdItem);

      const response = await request(app).post('/items').send(reqBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.payload).toEqual(createdItem);
    });
  });
});
