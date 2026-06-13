import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwt = { signAsync: jest.fn().mockResolvedValue('mocked-token') };
const mockConfig = { get: jest.fn((key: string) => ({ 'jwt.accessSecret': 'secret', 'jwt.refreshSecret': 'rsecret', 'jwt.accessExpiresIn': '15m', 'jwt.refreshExpiresIn': '7d' }[key])) };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', name: 'John Doe', email: 'e@e.com', phone: '+91123', role: 'USER' });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.register({ name: 'John Doe', email: 'e@e.com', phone: '+91123', password: 'password123' });
      expect(result).toHaveProperty('accessToken');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email/phone exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(service.register({ name: 'John Doe', email: 'e@e.com', phone: '+91123', password: 'password123' })).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1', email: 'e@e.com', phone: '+91123', role: 'USER', passwordHash: hash });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.login({ identifier: 'e@e.com', password: 'password123' });
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login({ identifier: 'no@no.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1', passwordHash: hash, email: 'e@e.com', phone: '+91', role: 'USER' });
      await expect(service.login({ identifier: 'e@e.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
