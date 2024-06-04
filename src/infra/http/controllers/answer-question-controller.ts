import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question';
import { z } from 'zod';

const answerQuestionBodySchema = z.object({
  content: z.string()
});

type AnswerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>

@Controller('/questions/:questionId/answers')
export class AnswerQuestionController {
  constructor(private answerQuestion: AnswerQuestionUseCase) { }

  @Post()
  async handle(
    @Body(new ZodValidationPipe(answerQuestionBodySchema)) body: AnswerQuestionBodySchema,
    @CurrentUser() user: TokenPayload,
    @Param('questionId') questionId: string
  ) {
    const { content } = body;
    const { sub: userId } = user;
    const result = await this.answerQuestion.execute({
      content,
      questionId: questionId,
      authorId: userId,
      attachmentsIds: []
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}