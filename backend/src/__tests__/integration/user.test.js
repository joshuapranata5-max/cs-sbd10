const request = require('supertest');
const app = require('../../../src/app');
const UserService = require('../../../src/services/user.service');
const redis = require('../../../src/database/redis');
const jwt = require('jsonwebtoken');

jest.mock('../../../src/services/user.service');
jest.mock('../../../src/database/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

describe('User Routes', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ userId: 1, email: 'test@test.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /user/update', () => {
    it('should update user and invalidate cache', async () => {
      const mockUpdatedUser = { id: 1, email: 'test@test.com', name: 'New Name' };
      UserService.updateProfile.mockResolvedValue(mockUpdatedUser);
      redis.del.mockResolvedValue(1);

      const response = await request(app)
        .put('/user/update')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: 1, name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(redis.del).toHaveBeenCalledWith('user:test@test.com');
    });
  });

  describe('GET /user/:email', () => {
    it('should return user from cache if exists', async () => {
      const mockCacheData = { id: 1, email: 'test@test.com' };
      redis.get.mockResolvedValue(JSON.stringify(mockCacheData));

      const response = await request(app)
        .get('/user/test@test.com')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('cache');
      expect(response.body.payload).toEqual(mockCacheData);
      expect(UserService.getUserByEmail).not.toHaveBeenCalled();
    });

    it('should query db and set cache if not in cache', async () => {
      const mockUser = { id: 1, email: 'test@test.com' };
      redis.get.mockResolvedValue(null);
      UserService.getUserByEmail.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/user/test@test.com')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Cache Miss');
      expect(UserService.getUserByEmail).toHaveBeenCalledWith('test@test.com');
      expect(redis.set).toHaveBeenCalled();
    });
  });
});
