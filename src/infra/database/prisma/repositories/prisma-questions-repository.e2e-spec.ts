import { AppModule } from '@/infra/app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StudentFactory } from 'test/factories/make-student';
import { DatabaseModule } from '@/infra/database/database.module';
import { QuestionFactory } from 'test/factories/make-question';
import { AttachmentFactory } from 'test/factories/make-attachments';
import { QuestionAttachmentsFactory } from 'test/factories/make-question-attachments';
import { CacheRepository } from '@/infra/cache/cache-repository';
import { CacheModule } from '@/infra/cache/cache.module';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';

describe('Prisma question repository (E2E)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let attachmentFactory: AttachmentFactory;
  let questionAttachmentFactory: QuestionAttachmentsFactory;
  let cacheRepository: CacheRepository;
  let questionsRepository: QuestionsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CacheModule],
      providers: [StudentFactory, QuestionFactory, AttachmentFactory, QuestionAttachmentsFactory]
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentsFactory);
    cacheRepository = moduleRef.get(CacheRepository);
    questionsRepository = moduleRef.get(QuestionsRepository);

    await app.init();
  });


  it('should cache questions details', async () => {
    const user = await studentFactory.makePrismaStudent({ name: 'John Doe' });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id
    });

    const attachment = await attachmentFactory.makePrismaAttachment();

    await questionAttachmentFactory.makePrismaQuestionAttachments({
      attachmentId: attachment.id,
      questionId: question.id
    });
    const slug = question.slug.value;

    const questionDetails = await questionsRepository.findBySlugDetails(slug);

    const cached = await cacheRepository.get(`questions:${slug}:details`);

    if (!cached) {
      throw new Error('cached not set!');
    }

    expect(JSON.parse(cached)).toEqual(expect.objectContaining({
      id: questionDetails?.questionId.toString()
    }));
  });

  it('should return cached questions details on subsequent calls', async () => {
    const user = await studentFactory.makePrismaStudent();

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id
    });

    const attachment = await attachmentFactory.makePrismaAttachment();

    await questionAttachmentFactory.makePrismaQuestionAttachments({
      attachmentId: attachment.id,
      questionId: question.id
    });
    const slug = question.slug.value;

    //await cacheRepository.set(`questions:${slug}:details`, JSON.stringify({ empty: true }));

    let cached = await cacheRepository.get(`questions:${slug}:details`);
    expect(cached).toBeNull();

    await questionsRepository.findBySlugDetails(slug);

    cached = await cacheRepository.get(`questions:${slug}:details`);
    console.log(cached);
    expect(cached).not.toBeNull();

    const questionDetails = await questionsRepository.findBySlugDetails(slug);

    if (!cached) {
      throw new Error('Cache not set!');
    }

    expect(JSON.parse(cached)).toEqual(expect.objectContaining({
      id: questionDetails?.questionId.toString()
    }));
  });

  it('should reset question details cache when saving the question', async () => {
    const user = await studentFactory.makePrismaStudent();

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id
    });

    const attachment = await attachmentFactory.makePrismaAttachment();

    await questionAttachmentFactory.makePrismaQuestionAttachments({
      attachmentId: attachment.id,
      questionId: question.id
    });
    const slug = question.slug.value;

    await cacheRepository.set(`questions:${slug}:details`, JSON.stringify({ empty: true }));
    await questionsRepository.save(question);

    const cached = await cacheRepository.get(`questions:${slug}:details`);
    expect(cached).toBeNull();
  });
});