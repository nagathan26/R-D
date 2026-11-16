// server/tests/auth.controller.test.js
const authController = require('../src/controllers/auth.controller');
const UserIndia = require('../src/models/UserIndia.model');
const Company = require('../src/models/Company.model');

jest.mock('../src/models/UserIndia.model');
jest.mock('../src/models/Company.model');
jest.mock('../src/models/Notification.model');
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('Customer Auth Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('register should return 400 when name, email, or password are missing', async () => {
    req.body = { name: 'Sanket' };
    await authController.register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('register should return 409 when email already exists', async () => {
    req.body = {
      name: 'Sanket Nagathan',
      email: 'founder@bharatai.com',
      password: 'password123',
      companyLegalName: 'Bharat AI Pvt Ltd'
    };
    UserIndia.findOne.mockResolvedValue({ _id: 'user123', email: 'founder@bharatai.com' });

    await authController.register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.stringContaining('already registered')
    }));
  });

  test('register should successfully create user and company and return 201 with JWT', async () => {
    req.body = {
      name: 'Sanket Nagathan',
      email: 'sanket@enterprise.in',
      phone: '9876543210',
      password: 'password123',
      companyLegalName: 'Sanket AI Tech Pvt Ltd',
      companyPan: 'ABCDE1234F',
      designation: 'Director'
    };
    UserIndia.findOne.mockResolvedValue(null);
    Company.findOne.mockResolvedValue(null);
    Company.create.mockResolvedValue({
      _id: 'comp123',
      companyId: 'COMP-101',
      legalName: 'Sanket AI Tech Pvt Ltd',
      pan: 'ABCDE1234F'
    });
    UserIndia.create.mockResolvedValue({
      _id: 'user123',
      name: 'Sanket Nagathan',
      email: 'sanket@enterprise.in',
      phone: '9876543210',
      designation: 'Director',
      role: 'STARTUP_FOUNDER_DIRECTOR',
      save: jest.fn().mockResolvedValue(true)
    });

    await authController.register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      token: expect.any(String),
      user: expect.objectContaining({ email: 'sanket@enterprise.in' }),
      company: expect.objectContaining({ legalName: 'Sanket AI Tech Pvt Ltd' })
    }));
  });

  test('login should authenticate user and return 200 with JWT', async () => {
    req.body = {
      email: 'sanket@enterprise.in',
      password: 'password123'
    };
    const mockUser = {
      _id: 'user123',
      email: 'sanket@enterprise.in',
      name: 'Sanket Nagathan',
      role: 'STARTUP_FOUNDER_DIRECTOR',
      passwordHash: 'hashedPassword',
      accountStatus: 'ACTIVE',
      companyId: 'comp123'
    };
    UserIndia.findOne.mockResolvedValue(mockUser);
    Company.findById.mockResolvedValue({
      _id: 'comp123',
      legalName: 'Sanket AI Tech Pvt Ltd'
    });

    await authController.login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      token: expect.any(String),
      user: expect.objectContaining({ email: 'sanket@enterprise.in' })
    }));
  });
});
