import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PrismaAnswerMapper } from '../mappers/prisma-answer-mapper';
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository';

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly _answerAttachmentRepository: AnswerAttachmentsRepository
  ) { }

  async findById(id: string): Promise<Answer | null> {
    const answer = await this._prisma.answer.findUnique({
      where: {
        id
      }
    });

    if (!answer) {
      return null;
    }

    return PrismaAnswerMapper.toDomain(answer);
  }

  async findManyByQuestionId(questionId: string, { page }: PaginationParams): Promise<Answer[]> {
    const answers = await this._prisma.answer.findMany({
      where: {
        questionId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      skip: (page - 1) * 20
    });

    return answers.map(PrismaAnswerMapper.toDomain);
  }

  async create(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    await this._prisma.answer.create({ data });

    await this._answerAttachmentRepository.createMany(
      answer.attachments.getItems()
    );
  }

  async save(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    await Promise.all([
      this._prisma.answer.update({
        where: {
          id: data.id
        },
        data
      }),
      await this._answerAttachmentRepository.createMany(
        answer.attachments.getNewItems()
      ),
      await this._answerAttachmentRepository.deleteMany(
        answer.attachments.getRemovedItems()
      )
    ]);
  }
  async delete(answer: Answer): Promise<void> {
    await this._prisma.answer.delete({
      where: {
        id: answer.id.toString()
      }
    });
  }
}