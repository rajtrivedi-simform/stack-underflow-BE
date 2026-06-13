import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { AiService } from '../ai/ai.service';
import { SchemesService } from '../schemes/schemes.service';

const mockAi = { chat: jest.fn() };
const mockSchemes = {
  findOne: jest.fn(),
  findManyForAi: jest.fn(),
};

const sampleScheme = {
  id: 'sch-uuid-1',
  schemeName: 'PMEGP',
  eligibility: 'Micro enterprises in manufacturing',
  benefits: '15-35% capital subsidy',
  targetCategory: null,
};

const sampleAiIdea = {
  name: 'Tiffin Service',
  description: 'Home-based tiffin delivery.',
  estimatedInvestment: '₹1,50,000 – ₹2,50,000',
  potentialMonthlyRevenue: '₹40,000 – ₹80,000',
  paybackPeriodMonths: 4,
  requiredSkills: ['Cooking', 'Logistics'],
  marketDemand: 'HIGH',
  targetCustomers: 'Office workers',
  pros: ['Low cost'],
  cons: ['Perishable'],
  schemeAlignment: null,
  firstSteps: ['Register FSSAI'],
  applicableSchemes: [
    { schemeId: 'sch-uuid-1', schemeName: 'PMEGP', reason: 'Micro food enterprise', benefit: '15% subsidy' },
  ],
};

describe('IdeasService', () => {
  let service: IdeasService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSchemes.findManyForAi.mockResolvedValue([sampleScheme]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdeasService,
        { provide: AiService, useValue: mockAi },
        { provide: SchemesService, useValue: mockSchemes },
      ],
    }).compile();

    service = module.get<IdeasService>(IdeasService);
  });

  describe('generate — without schemeId', () => {
    it('should call AI and return ideas with schemeUsed null', async () => {
      mockAi.chat.mockResolvedValue({ ideas: [sampleAiIdea] });

      const result = await service.generate({ locality: 'Ahmedabad, Gujarat', budget: 500000 });

      expect(mockSchemes.findOne).not.toHaveBeenCalled();
      expect(mockSchemes.findManyForAi).toHaveBeenCalledTimes(1);
      expect(mockAi.chat).toHaveBeenCalledTimes(1);
      expect(result.schemeUsed).toBeNull();
      expect(result.ideas).toHaveLength(1);
      expect(result.ideas[0].name).toBe('Tiffin Service');
      expect(result.ideas[0].applicableSchemes).toHaveLength(1);
    });

    it('should return empty ideas array when AI returns no ideas', async () => {
      mockAi.chat.mockResolvedValue({ ideas: [] });

      const result = await service.generate({ locality: 'Mumbai', budget: 200000 });

      expect(result.ideas).toEqual([]);
      expect(result.schemeUsed).toBeNull();
    });

    it('should return empty ideas array when AI omits the ideas key', async () => {
      mockAi.chat.mockResolvedValue({});

      const result = await service.generate({ locality: 'Mumbai', budget: 200000 });

      expect(result.ideas).toEqual([]);
    });
  });

  describe('generate — with schemeId', () => {
    it('should resolve scheme and include schemeUsed in response', async () => {
      mockSchemes.findOne.mockResolvedValue(sampleScheme);
      mockAi.chat.mockResolvedValue({ ideas: [{ ...sampleAiIdea, schemeAlignment: 'Eligible for PMEGP' }] });

      const result = await service.generate({
        locality: 'Surat, Gujarat',
        budget: 300000,
        schemeId: 'sch-uuid-1',
      });

      expect(mockSchemes.findOne).toHaveBeenCalledWith('sch-uuid-1');
      expect(result.schemeUsed).toBe('PMEGP');
      expect(result.ideas[0].schemeAlignment).toBe('Eligible for PMEGP');
    });

    it('should throw NotFoundException when scheme does not exist', async () => {
      mockSchemes.findOne.mockRejectedValue(new Error('Not found'));

      await expect(
        service.generate({ locality: 'Delhi', budget: 100000, schemeId: 'bad-uuid' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should still call findManyForAi even when a specific schemeId is provided', async () => {
      mockSchemes.findOne.mockResolvedValue(sampleScheme);
      mockAi.chat.mockResolvedValue({ ideas: [sampleAiIdea] });

      await service.generate({ locality: 'Pune', budget: 500000, schemeId: 'sch-uuid-1' });

      expect(mockSchemes.findManyForAi).toHaveBeenCalledTimes(1);
    });
  });

  describe('generate — prompt construction', () => {
    it('should pass locality, budget, and scheme list to AI', async () => {
      mockAi.chat.mockResolvedValue({ ideas: [sampleAiIdea] });

      await service.generate({ locality: 'Chennai, Tamil Nadu', budget: 750000 });

      const prompt: string = mockAi.chat.mock.calls[0][0];
      expect(prompt).toContain('Chennai, Tamil Nadu');
      expect(prompt).toContain('7,50,000');
      expect(prompt).toContain('PMEGP');
    });

    it('should include focus scheme section in prompt when schemeId is provided', async () => {
      mockSchemes.findOne.mockResolvedValue(sampleScheme);
      mockAi.chat.mockResolvedValue({ ideas: [sampleAiIdea] });

      await service.generate({ locality: 'Jaipur', budget: 400000, schemeId: 'sch-uuid-1' });

      const prompt: string = mockAi.chat.mock.calls[0][0];
      expect(prompt).toContain('Focus Scheme');
      expect(prompt).toContain('PMEGP');
    });
  });
});
