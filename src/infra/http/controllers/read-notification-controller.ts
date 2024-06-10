import { BadRequestException, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayload } from '@/infra/auth/jwt.strategy';

@Controller('/notifications/:notificationId/read')
export class ReadNotificationController {
  constructor(private _readNotificationUseCase: ReadNotificationUseCase) { }

  @Patch()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: TokenPayload,
    @Param('notificationId') notificationId: string
  ) {
    const result = await this._readNotificationUseCase.execute({
      notificationId,
      recipientId: user.sub
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}