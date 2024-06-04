import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions';
import { QuestionPresenter } from '../presenters/question-presenter';

const pageQueryParamsSchema = z.string().optional().default('1').transform(Number).pipe(
  z.number().min(1)
);
const QueryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParamSchema = z.infer<typeof pageQueryParamsSchema>

@Controller('/questions')
export class FetchRecentQuestionsController {
  constructor(private _fetchRecentQuestionsUseCase: FetchRecentQuestionsUseCase) { }

  @Get()
  async handle(
    @Query('page', QueryValidationPipe) page: PageQueryParamSchema
  ) {
    const result = await this._fetchRecentQuestionsUseCase.execute({ page });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
    const questions = result.value.questions;

    return { questions: questions.map(QuestionPresenter.toHttp) };
  }
}