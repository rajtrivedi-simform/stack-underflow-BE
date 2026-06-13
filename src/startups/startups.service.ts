import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { computeMsmeCategory } from '../shared/utils/range-parser';

@Injectable()
export class StartupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateStartupDto) {
    const existing = await this.prisma.startup.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Startup profile already exists for this user');

    const msmeCategory = computeMsmeCategory(dto.annualTurnoverRange, dto.investmentPlantMachinery);

    return this.prisma.startup.create({
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
    const startup = await this.prisma.startup.findUnique({ where: { userId } });
    if (!startup) throw new NotFoundException('Startup profile not found');
    return startup;
  }

  async update(userId: string, dto: UpdateStartupDto) {
    const startup = await this.findByUser(userId);

    const msmeCategory =
      dto.annualTurnoverRange || dto.investmentPlantMachinery
        ? computeMsmeCategory(
            dto.annualTurnoverRange ?? startup.annualTurnoverRange,
            dto.investmentPlantMachinery ?? startup.investmentPlantMachinery,
          )
        : undefined;

    return this.prisma.startup.update({
      where: { id: startup.id },
      data: {
        ...dto,
        ...(msmeCategory !== undefined && { msmeCategory }),
      },
    });
  }

  async softDelete(userId: string) {
    const startup = await this.findByUser(userId);
    await this.prisma.startup.update({
      where: { id: startup.id },
      data: { deletedAt: new Date() },
    });
  }
}
