import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PrismaQuestionMapper } from '../mappers/prisma-question-mapper';
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository';
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details';
import { PrismaQuestionDetailsMapper } from '../mappers/prisma-question-details-mapper';
import { DomainEvents } from '@/core/events/domain-events';
import { CacheRepository } from '@/infra/cache/cache-repository';

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly _cache: CacheRepository,
    private readonly _questionAttachmentsRepository: QuestionAttachmentsRepository
  ) { }

  async findById(id: string): Promise<Question | null> {
    const question = await this._prisma.question.findUnique({ where: { id } });
    if (!question) {
      return null;
    }
    return PrismaQuestionMapper.toDomain(question);
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = await this._prisma.question.findUnique({ where: { slug } });
    if (!question) {
      return null;
    }
    return PrismaQuestionMapper.toDomain(question);
  }

  async findBySlugDetails(slug: string): Promise<QuestionDetails | null> {
    const cacheHit = await this._cache.get(`questions:${slug}:details`);

    if (cacheHit) {
      const cacheData = JSON.parse(cacheHit);

      return PrismaQuestionDetailsMapper.toDomain(cacheData);
    }

    const question = await this._prisma.question.findUnique({
      where: {
        slug
      },
      include: {
        author: true,
        attachments: true
      }
    });
    if (!question) {
      return null;
    }

    await this._cache.set(`questions:${slug}:details`, JSON.stringify(question));
    const questionDetails = PrismaQuestionDetailsMapper.toDomain(question);
    return questionDetails;
  }

  async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
    const questions = await this._prisma.question.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      skip: (page - 1) * 20
    });

    return questions.map(question => {
      return PrismaQuestionMapper.toDomain(question);
    });
  }

  async create(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);
    await this._prisma.question.create({ data });
    await this._questionAttachmentsRepository.createMany(question.attachments.getItems());
    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async save(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);
    await Promise.all(
      [
        this._prisma.question.update({ where: { id: data.id }, data }),
        this._questionAttachmentsRepository.createMany(question.attachments.getNewItems()),
        this._questionAttachmentsRepository.deleteMany(question.attachments.getRemovedItems()),
        this._cache.delete(`questions:${data.slug}:details`)
      ]);

    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async delete(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);
    await this._prisma.question.delete({ where: { id: data.id } });
  }

}