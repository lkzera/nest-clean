import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import { QuestionPresenter } from '../presenters/question-presenter';

@Controller('/questions/:slug')
export class GetQuestionBySlugController {
  constructor(private _getQuestionBySlugUseCase: GetQuestionBySlugUseCase) { }

  @Get()
  async handle(
    @Param('slug') slug: string
  ) {
    const result = await this._getQuestionBySlugUseCase.execute({ slug });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return { question: QuestionPresenter.toHttp(result.value.question) };
  }
}