import { Answer } from '@/domain/forum/enterprise/entities/answer';

export class AnswerPresenter {
  static toHttp(question: Answer) {
    return {
      id: question.id.toString(),
      content: question.content,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    };
  }
}