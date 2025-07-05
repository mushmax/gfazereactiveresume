import { Injectable, NotFoundException } from "@nestjs/common";
import { Document, DocumentType, Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentCreateInput): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  findAll(userId: string, type?: DocumentType): Promise<Document[]> {
    const where: Prisma.DocumentWhereInput = { userId };

    if (type) {
      where.type = type;
    }

    return this.prisma.document.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
  }

  async findOne(id: string, userId: string): Promise<Document> {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    return document;
  }

  async update(id: string, userId: string, data: Prisma.DocumentUpdateInput): Promise<Document> {
    const document = await this.findOne(id, userId);

    return this.prisma.document.update({
      where: { id: document.id },
      data,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);

    await this.prisma.document.delete({
      where: { id: document.id },
    });
  }

  async getDocumentStats(userId: string): Promise<{
    totalDocuments: number;
    documentsByType: Record<DocumentType, number>;
  }> {
    const [totalDocuments, documentsByType] = await Promise.all([
      this.prisma.document.count({ where: { userId } }),
      this.prisma.document.groupBy({
        by: ["type"],
        where: { userId },
        _count: { type: true },
      }),
    ]);

    const typeStats = {} as Record<DocumentType, number>;
    for (const item of documentsByType) {
      typeStats[item.type] = item._count.type;
    }

    return {
      totalDocuments,
      documentsByType: typeStats,
    };
  }
}
