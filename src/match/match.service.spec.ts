import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MatchService } from './match.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AiService } from '../ai/ai.service';
import { SchemesService } from '../schemes/schemes.service';
import { BusinessesService } from '../businesses/businesses.service';
import { StartupsService } from '../startups/startups.service';
import { EntityType } from './dto/match-request.dto';

const mockPrisma = {
  business: { findUnique: jest.fn() },
  startup: { findUnique: jest.fn() },
  schemeMatch: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }), createMany: jest.fn().mockResolvedValue({ count: 1 }) },
  $transaction: jest.fn().mockImplementation((cb: (tx: typeof mockPrisma) => Promise<unknown>) => cb(mockPrisma)),
};
const mockRedis = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
const mockAi = { chat: jest.fn() };
const mockSchemes = { findManyForMatch: jest.fn().mockResolvedValue([]), findManyForAi: jest.fn().mockResolvedValue([]) };
const mockBusinesses = {};
const mockStartups = {};

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: AiService, useValue: mockAi },
        { provide: SchemesService, useValue: mockSchemes },
        { provide: BusinessesService, useValue: mockBusinesses },
        { provide: StartupsService, useValue: mockStartups },
      ],
    }).compile();
    service = module.get<MatchService>(MatchService);
  });

  it('should return cached result if Redis cache hit', async () => {
    const cached = { entityType: 'BUSINESS', total: 1, eligible: 1, matches: [] };
    mockRedis.get.mockResolvedValueOnce(cached);
    const result = await service.match('u1', { entityType: EntityType.BUSINESS });
    expect(result).toEqual(cached);
    expect(mockAi.chat).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if business profile missing', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue(null);
    await expect(service.match('u1', { entityType: EntityType.BUSINESS })).rejects.toThrow(NotFoundException);
  });

  it('should call AI and persist matches on cache miss', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockPrisma.business.findUnique.mockResolvedValue({ id: 'b1', state: 'Gujarat' });
    mockAi.chat.mockResolvedValue({ matches: [{ schemeId: 's1', status: 'ELIGIBLE', matchScore: 90, confidenceScore: 85, metCriteria: [], unmetCriteria: [], gapBridgeSteps: [] }] });

    const result = await service.match('u1', { entityType: EntityType.BUSINESS });
    expect(mockAi.chat).toHaveBeenCalled();
    expect(mockRedis.set).toHaveBeenCalled();
    expect(result.total).toBe(1);
  });
});
