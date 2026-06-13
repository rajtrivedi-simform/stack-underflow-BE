import { Test, TestingModule } from '@nestjs/testing';
import { IdeasController } from './ideas.controller';
import { IdeasService } from './ideas.service';

const mockIdeasService = { generate: jest.fn() };

const sampleResponse = {
  ideas: [
    {
      name: 'Tiffin Service',
      description: 'Home-based tiffin delivery.',
      estimatedInvestment: '₹1,50,000 – ₹2,50,000',
      potentialMonthlyRevenue: '₹40,000 – ₹80,000',
      paybackPeriodMonths: 4,
      requiredSkills: ['Cooking'],
      marketDemand: 'HIGH',
      targetCustomers: 'Office workers',
      pros: ['Low cost'],
      cons: ['Perishable'],
      schemeAlignment: null,
      firstSteps: ['Register FSSAI'],
      applicableSchemes: [],
    },
  ],
  schemeUsed: null,
};

describe('IdeasController', () => {
  let controller: IdeasController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdeasController],
      providers: [{ provide: IdeasService, useValue: mockIdeasService }],
    }).compile();

    controller = module.get<IdeasController>(IdeasController);
  });

  it('should call IdeasService.generate with the DTO and return its result', async () => {
    mockIdeasService.generate.mockResolvedValue(sampleResponse);

    const dto = { locality: 'Ahmedabad, Gujarat', budget: 500000 };
    const result = await controller.generate(dto);

    expect(mockIdeasService.generate).toHaveBeenCalledWith(dto);
    expect(result).toEqual(sampleResponse);
  });

  it('should pass schemeId to the service when provided', async () => {
    mockIdeasService.generate.mockResolvedValue({ ...sampleResponse, schemeUsed: 'PMEGP' });

    const dto = { locality: 'Pune', budget: 1000000, schemeId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' };
    const result = await controller.generate(dto);

    expect(mockIdeasService.generate).toHaveBeenCalledWith(dto);
    expect(result.schemeUsed).toBe('PMEGP');
  });

  it('should propagate errors thrown by the service', async () => {
    mockIdeasService.generate.mockRejectedValue(new Error('AI failed'));

    await expect(controller.generate({ locality: 'Delhi', budget: 100000 })).rejects.toThrow('AI failed');
  });
});
