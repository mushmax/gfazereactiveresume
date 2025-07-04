import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AdminUpdateUserPasswordDto } from "@reactive-resume/dto";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserService } from "../user/user.service";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtGuard, RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get("users")
  async getAllUsers(@Query("page") page?: string, @Query("limit") limit?: string) {
    const pageNum = Number.parseInt(page ?? "1", 10);
    const limitNum = Number.parseInt(limit ?? "10", 10);
    return this.userService.findAllUsers(pageNum, limitNum);
  }

  @Post("users")
  @Roles("SUPER_ADMIN")
  async createUser(
    @Body()
    userData: {
      name: string;
      email: string;
      username: string;
      password: string;
      role?: string;
      locale?: string;
    },
  ) {
    return this.userService.createUserAsAdmin(userData);
  }

  @Put("users/:id")
  async updateUser(
    @Param("id") id: string,
    @Body()
    updateData: {
      name?: string;
      email?: string;
      username?: string;
      locale?: string;
    },
  ) {
    return this.userService.updateUserById(id, updateData);
  }

  @Patch("users/:id/password")
  async updateUserPassword(
    @Param("id") id: string,
    @Body() { newPassword }: AdminUpdateUserPasswordDto,
  ) {
    await this.userService.updateUserPassword(id, newPassword);
    return { message: "User password has been successfully updated." };
  }

  @Put("users/:id/role")
  @Roles("SUPER_ADMIN")
  async updateUserRole(@Param("id") id: string, @Body() roleData: { role: string }) {
    return this.userService.updateUserRole(id, roleData.role);
  }

  @Delete("users/:id")
  @Roles("SUPER_ADMIN")
  async deleteUser(@Param("id") id: string) {
    return this.userService.deleteOneById(id);
  }

  @Get("stats")
  async getSystemStats() {
    return this.userService.getUserStats();
  }
}
