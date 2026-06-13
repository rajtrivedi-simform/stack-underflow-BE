import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  business: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const baseDto = {
  businessName: 'Acme', ownerName: 'Owner', constitution: 'Sole', sector: 'Retail',
  state: 'Gujarat', district: 'Ahmedabad', yearEstablished: 2020,
  annualTurnoverRange: '< 40 Lakh', investmentPlantMachinery: '< 1 Cr',
  totalEmployees: 5, maleEmployees: 3, femaleEmployees: 2,
  gstStatus: 'Filed', ownerGender: 'Male', ownerAgeGroup: '25-35',
  socialCategory: 'General', education: 'Graduate', womenLed: 'No',
};

describe('BusinessesService', () => {
  let service: BusinessesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<BusinessesService>(BusinessesService);
  });

  it('should create a business with MICRO msmeCategory', async () => {
    mockPrisma.business.findUnique.mockResolvedValue(null);
    mockPrisma.business.create.mockResolvedValue({ id: 'b1', ...baseDto, msmeCategory: 'MICRO' });
    const result = await service.create('u1', baseDto);
    expect(mockPrisma.business.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ msmeCategory: 'MICRO' }) }),
    );
    expect(result.msmeCategory).toBe('MICRO');
  });

  it('should throw ConflictException if business already exists', async () => {
    mockPrisma.business.findUnique.mockResolvedValue({ id: 'b1' });
    await expect(service.create('u1', baseDto)).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException if business not found on findByUser', async () => {
    mockPrisma.business.findUnique.mockResolvedValue(null);
    await expect(service.findByUser('u1')).rejects.toThrow(NotFoundException);
  });
});
