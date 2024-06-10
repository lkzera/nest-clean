import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments';
import { CommentWithAuthorPresenter } from '../presenters/comment-with-author-presenter';

const pageQueryParamsSchema = z.string().optional().default('1').transform(Number).pipe(
  z.number().min(1)
);
const QueryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParamSchema = z.infer<typeof pageQueryParamsSchema>

@Controller('/answers/:answerId/comments')
export class FetchAnswerCommentsController {
  constructor(private _fetchAnswerCommentsUseCase: FetchAnswerCommentsUseCase) { }

  @Get()
  async handle(
    @Query('page', QueryValidationPipe) page: PageQueryParamSchema,
    @Param('answerId') answerId: string
  ) {
    const result = await this._fetchAnswerCommentsUseCase.execute({
      page,
      answerId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
    const comments = result.value.comments;

    return { comments: comments.map(CommentWithAuthorPresenter.toHttp) };
  }
}