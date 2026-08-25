// src/__tests__/unit/user.service.test.js
const UserService = require('../../services/user.service');
const User = require('../../models/user.model');
const bcrypt = require('bcrypt');

// Mock model dan bcrypt agar tidak berinteraksi dengan DB dan hashing berat
jest.mock('../../../src/models/user.model');
jest.mock('bcrypt');

describe('UserService - Login', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Bersihkan mock setelah tiap test
  });

  it('seharusnya melempar error (401) jika email tidak ditemukan', async () => {
    // Skenario: User.findByEmail mengembalikan null
    User.findByEmail.mockResolvedValue(null);

    // Assert bahwa service melemparkan AppError
    await expect(UserService.login('salah@email.com', 'password123'))
      .rejects
      .toThrow('Invalid email or password');
  });

  it('seharusnya berhasil login dan mengembalikan data user jika kredensial benar', async () => {
    const mockUser = {
      id: 1, name: 'Budi', username: 'budi123', email: 'budi@mail.com', password: 'hashedpassword', balance: 0
    };

    // Skenario: Email ditemukan, dan password cocok
    User.findByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const result = await UserService.login('budi@mail.com', 'password123');

    // Assert (Pengecekan)
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('budi@mail.com');
    expect(result.user.password).toBeUndefined(); // Pastikan password tidak ikut ter-return
  });
});
