import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { computeMsmeCategory } from '../shared/utils/range-parser';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBusinessDto) {
    const existing = await this.prisma.business.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Business profile already exists for this user');

    const msmeCategory = computeMsmeCategory(dto.annualTurnoverRange, dto.investmentPlantMachinery);

    return this.prisma.business.create({
      data: {
        ...dto,
        userId,
        msmeCategory,
        existingRegistrations: dto.existingRegistrations ?? [],
        documentsOnFile: dto.documentsOnFile ?? [],
      },
    });
  }

  async findByUser(userId: string) {
    const business = await this.prisma.business.findUnique({ where: { userId } });
    if (!business) throw new NotFoundException('Business profile not found');
    return business;
  }

  async update(userId: string, dto: UpdateBusinessDto) {
    const business = await this.findByUser(userId);

    const msmeCategory =
      dto.annualTurnoverRange || dto.investmentPlantMachinery
        ? computeMsmeCategory(
            dto.annualTurnoverRange ?? business.annualTurnoverRange,
            dto.investmentPlantMachinery ?? business.investmentPlantMachinery,
          )
        : undefined;

    return this.prisma.business.update({
      where: { id: business.id },
      data: {
        ...dto,
        ...(msmeCategory !== undefined && { msmeCategory }),
      },
    });
  }

  async softDelete(userId: string) {
    const business = await this.findByUser(userId);
    await this.prisma.business.update({
      where: { id: business.id },
      data: { deletedAt: new Date() },
    });
  }
}
