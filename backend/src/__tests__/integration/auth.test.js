// src/__tests__/integration/auth.test.js
const request = require('supertest');
const app = require('../../../src/app');
const UserService = require('../../../src/services/user.service');

// Kita bisa mem-mock UserService agar tidak butuh DB sungguhan
jest.mock('../../../src/services/user.service');

describe('POST /auth/login', () => {
    it('seharusnya mereturn token JWT ketika login berhasil', async () => {
        const mockUser = {
            id: 1, name: 'Budi', email: 'budi@mail.com'
        };

        // Kita mock output dari service
        UserService.login.mockResolvedValue({ user: mockUser });

        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'budi@mail.com',
                password: 'PasswordB3n4r!'
            });

        // Pengecekan HTTP Response
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toHaveProperty('token');
        expect(response.body.payload.user.email).toBe('budi@mail.com');
    });

    it('seharusnya gagal karena rate limiting jika memanggil berkali-kali', async () => {
        // Karena Anda memasang `authLimiter` (Max 5 request di app.js)
        for (let i = 0; i < 5; i++) {
            await request(app).post('/auth/login').send({ email: 'x@x.com', password: '123' });
        }

        // Panggilan ke-6 harusnya terkena Rate Limit 429
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'x@x.com', password: '123' });

        expect(response.status).toBe(429);
        expect(response.body.message).toContain('Too many requests');
    });
});
