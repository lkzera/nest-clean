import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';
import { PrismaService } from '@/prisma/prisma.service';
import { z } from 'zod';

const pageQueryParamsSchema = z.string().optional().default('1').transform(Number).pipe(
  z.number().min(1)
);
const QueryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParamSchema = z.infer<typeof pageQueryParamsSchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private prisma: PrismaService) { }

  @Get()
  async handle(
    @Query('page', QueryValidationPipe) page: PageQueryParamSchema
  ) {
    const questions = await this.prisma.question.findMany({
      take: 20,
      skip: (page - 1) * 20,
      orderBy: {
        createdAt: 'desc'
      }
    });
    return { questions };
  }
}