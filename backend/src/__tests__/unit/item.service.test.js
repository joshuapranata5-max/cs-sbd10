const ItemService = require('../../../src/services/item.service');
const Item = require('../../../src/models/item.model');
const { AppError } = require('../../../src/middleware/errorHandler');

jest.mock('../../../src/models/item.model');

describe('ItemService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllItems', () => {
    it('should return all items', async () => {
      const mockItems = [{ id: 1, name: 'Item A', price: 100, stock: 10 }];
      Item.findAll.mockResolvedValue(mockItems);

      const result = await ItemService.getAllItems();
      expect(result).toEqual(mockItems);
      expect(Item.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getItemById', () => {
    it('should return item if found', async () => {
      const mockItem = { id: 1, name: 'Item A', price: 100, stock: 10 };
      Item.findById.mockResolvedValue(mockItem);

      const result = await ItemService.getItemById(1);
      expect(result).toEqual(mockItem);
      expect(Item.findById).toHaveBeenCalledWith(1);
    });

    it('should throw 404 if item not found', async () => {
      Item.findById.mockResolvedValue(null);

      await expect(ItemService.getItemById(99)).rejects.toThrow(AppError);
      await expect(ItemService.getItemById(99)).rejects.toHaveProperty('statusCode', 404);
    });
  });

  describe('createItem', () => {
    it('should create an item successfully', async () => {
      const newItem = { name: 'New Item', price: 200, stock: 5 };
      const createdItem = { id: 2, ...newItem };
      Item.create.mockResolvedValue(createdItem);

      const result = await ItemService.createItem(newItem);
      expect(result).toEqual(createdItem);
      expect(Item.create).toHaveBeenCalledWith(newItem);
    });
  });

  describe('updateItem', () => {
    it('should update item and return updated item', async () => {
      const updateData = { price: 250 };
      const updatedItem = { id: 1, name: 'Item A', price: 250, stock: 10 };
      Item.update.mockResolvedValue(updatedItem);

      const result = await ItemService.updateItem(1, updateData);
      expect(result).toEqual(updatedItem);
    });

    it('should throw 404 if updating non-existent item', async () => {
      Item.update.mockResolvedValue(null);
      await expect(ItemService.updateItem(99, {})).rejects.toThrow('Item not found');
    });
  });
});
