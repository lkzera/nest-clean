import { PaginationParams } from '@/core/repositories/pagination-params';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionDetails } from '../../enterprise/entities/value-objects/question-details';

export abstract class QuestionsRepository {
  abstract findById(id: string): Promise<Question | null>
  abstract findBySlug(slug: string): Promise<Question | null>
  abstract findBySlugDetails(slug: string): Promise<QuestionDetails | null>
  abstract findManyRecent(params: PaginationParams): Promise<Question[]>
  abstract save(question: Question): Promise<void>
  abstract create(question: Question): Promise<void>
  abstract delete(question: Question): Promise<void>
}
