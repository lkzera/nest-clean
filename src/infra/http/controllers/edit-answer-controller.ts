import { BadRequestException, Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer';
import { z } from 'zod';

const editAnswerBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()).default([])
});

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

@Controller('/answers/:id')
export class EditAnswerController {
  constructor(private editAnswer: EditAnswerUseCase) { }

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(editAnswerBodySchema)) body: EditAnswerBodySchema,
    @CurrentUser() user: TokenPayload,
    @Param('id') answerId: string
  ) {
    const { content, attachments } = body;
    const { sub: userId } = user;

    const result = await this.editAnswer.execute({
      content,
      answerId,
      authorId: userId,
      attachmentsIds: attachments
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}