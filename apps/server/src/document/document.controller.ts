import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DocumentType } from "@prisma/client";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { DocumentService } from "./document.service";

@ApiTags("Document")
@Controller("document")
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseGuards(TwoFactorGuard)
  async create(
    @User("id") userId: string,
    @Body()
    createDocumentDto: {
      title: string;
      filename: string;
      type: DocumentType;
      fileUrl: string;
      fileSize?: number;
      mimeType?: string;
    },
  ) {
    return this.documentService.create({
      ...createDocumentDto,
      user: { connect: { id: userId } },
    });
  }

  @Get()
  @UseGuards(TwoFactorGuard)
  async findAll(@User("id") userId: string, @Query("type") type?: DocumentType) {
    return this.documentService.findAll(userId, type);
  }

  @Get("stats")
  @UseGuards(TwoFactorGuard)
  async getStats(@User("id") userId: string) {
    return this.documentService.getDocumentStats(userId);
  }

  @Get(":id")
  @UseGuards(TwoFactorGuard)
  async findOne(@Param("id") id: string, @User("id") userId: string) {
    return this.documentService.findOne(id, userId);
  }

  @Patch(":id")
  @UseGuards(TwoFactorGuard)
  async update(
    @Param("id") id: string,
    @User("id") userId: string,
    @Body()
    updateDocumentDto: {
      title?: string;
      type?: DocumentType;
    },
  ) {
    return this.documentService.update(id, userId, updateDocumentDto);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard)
  async delete(@Param("id") id: string, @User("id") userId: string) {
    await this.documentService.delete(id, userId);
    return { message: "Document deleted successfully" };
  }
}
