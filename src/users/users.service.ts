import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const SAFE_SELECT = {
  id: true,
  email: true,
  phone: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.email || dto.phone) {
      const conflict = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { OR: [dto.email ? { email: dto.email } : {}, dto.phone ? { phone: dto.phone } : {}] },
          ],
        },
      });
      if (conflict) throw new ConflictException('Email or phone already in use');
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email) data.email = dto.email;
    if (dto.phone) data.phone = dto.phone;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
  }

  async softDelete(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
