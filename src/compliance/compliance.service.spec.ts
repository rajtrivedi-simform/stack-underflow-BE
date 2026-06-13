import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EntityType } from '../match/dto/match-request.dto';

const mockPrisma = {
  business: { findUnique: jest.fn() },
  startup: { findUnique: jest.fn() },
  complianceRequirement: { findMany: jest.fn().mockResolvedValue([]) },
  complianceCheckBatch: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
};
const mockAi = { chat: jest.fn() };

describe('ComplianceService', () => {
  let service: ComplianceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAi },
      ],
    }).compile();
    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should throw NotFoundException if no business profile', async () => {
    mockPrisma.business.findUnique.mockResolvedValue(null);
    await expect(service.check('u1', { entityType: EntityType.BUSINESS })).rejects.toThrow(NotFoundException);
  });

  it('should create a compliance batch with AI results', async () => {
    mockPrisma.business.findUnique.mockResolvedValue({ id: 'b1' });
    mockAi.chat.mockResolvedValue({ overallScore: 75, results: [] });
    mockPrisma.complianceCheckBatch.create.mockResolvedValue({ id: 'batch1', overallScore: 75, results: [] });

    const result = await service.check('u1', { entityType: EntityType.BUSINESS });
    expect(result).toHaveProperty('overallScore', 75);
  });
});
