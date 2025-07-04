import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Prisma, User, Role } from "@prisma/client";
import { UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { PrismaService } from "nestjs-prisma";

import { StorageService } from "../storage/storage.service";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: string): Promise<UserWithSecrets> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { secrets: true },
    });

    if (!user.secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return user;
  }

  async findOneByIdentifier(identifier: string): Promise<UserWithSecrets | null> {
    const user = await (async (identifier: string) => {
      // First, find the user by email
      const user = await this.prisma.user.findUnique({
        where: { email: identifier },
        include: { secrets: true },
      });

      // If the user exists, return it
      if (user) return user;

      // Otherwise, find the user by username
      // If the user doesn't exist, throw an error
      return this.prisma.user.findUnique({
        where: { username: identifier },
        include: { secrets: true },
      });
    })(identifier);

    return user;
  }

  async findOneByIdentifierOrThrow(identifier: string): Promise<UserWithSecrets> {
    const user = await (async (identifier: string) => {
      // First, find the user by email
      const user = await this.prisma.user.findUnique({
        where: { email: identifier },
        include: { secrets: true },
      });

      // If the user exists, return it
      if (user) return user;

      // Otherwise, find the user by username
      // If the user doesn't exist, throw an error
      return this.prisma.user.findUniqueOrThrow({
        where: { username: identifier },
        include: { secrets: true },
      });
    })(identifier);

    return user;
  }

  create(data: Prisma.UserCreateInput): Promise<UserWithSecrets> {
    return this.prisma.user.create({ data, include: { secrets: true } });
  }

  updateByEmail(email: string, data: Prisma.UserUpdateArgs["data"]): Promise<User> {
    return this.prisma.user.update({ where: { email }, data });
  }

  async updateByResetToken(
    resetToken: string,
    data: Prisma.SecretsUpdateArgs["data"],
  ): Promise<void> {
    await this.prisma.secrets.update({ where: { resetToken }, data });
  }

  async deleteOneById(id: string): Promise<void> {
    await Promise.all([
      this.storageService.deleteFolder(id),
      this.prisma.user.delete({ where: { id } }),
    ]);
  }

  async findAllUsers(page = 1, limit = 10): Promise<{ users: UserWithSecrets[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: { secrets: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total };
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { role: role as Role },
    });
  }

  async createUserAsAdmin(data: {
    name: string;
    email: string;
    username: string;
    password: string;
    role?: string;
    locale?: string;
  }): Promise<UserWithSecrets> {
    const hashedPassword = await this.hashPassword(data.password);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        locale: data.locale ?? "en-US",
        provider: "email",
        role: (data.role ?? "USER") as Role,
        emailVerified: true,
        secrets: {
          create: {
            password: hashedPassword,
            lastSignedIn: new Date(),
          },
        },
      },
      include: { secrets: true },
    });
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalSuperAdmins: number;
    recentUsers: number;
    totalResumes: number;
  }> {
    const [totalUsers, totalAdmins, totalSuperAdmins, recentUsers, totalResumes] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: "ADMIN" } }),
        this.prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
        this.prisma.resume.count(),
      ]);

    return {
      totalUsers,
      totalAdmins,
      totalSuperAdmins,
      recentUsers,
      totalResumes,
    };
  }

  async updateUserById(id: string, data: Prisma.UserUpdateArgs["data"]): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.hash(password, 10);
  }
}
