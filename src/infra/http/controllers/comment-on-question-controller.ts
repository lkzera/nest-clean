import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question';
import { z } from 'zod';

const commentOnQuestionBodySchema = z.object({
  content: z.string()
});

type CommentOnQuestionBodySchema = z.infer<typeof commentOnQuestionBodySchema>

@Controller('/questions/:questionId/comments')
export class CommentOnQuestionController {
  constructor(private commentOnQuestion: CommentOnQuestionUseCase) { }

  @Post()
  async handle(
    @Body(new ZodValidationPipe(commentOnQuestionBodySchema)) body: CommentOnQuestionBodySchema,
    @CurrentUser() user: TokenPayload,
    @Param('questionId') questionId: string
  ) {
    const { content } = body;
    const { sub: userId } = user;
    const result = await this.commentOnQuestion.execute({
      content,
      questionId: questionId,
      authorId: userId
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}