import { Either, right, left } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error';
import { AttachmentsRepository } from '../repositories/attachments-repository';
import { Attachment } from '../../enterprise/entities/attachment';
import { Uploader } from '../storage/uploader';

interface UploadAndCreateAttachmentUseCaseRequest {
  fileName: string;
  fileType: string;
  body: Buffer;
}

type UploadAndCreateAttachmentUseCaseResponse = Either<
  InvalidAttachmentTypeError,
  {
    attachment: Attachment
  }
>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private readonly _attachmentsRepository: AttachmentsRepository,
    private readonly _uploader: Uploader
  ) { }

  async execute({
    fileName,
    fileType,
    body
  }: UploadAndCreateAttachmentUseCaseRequest): Promise<UploadAndCreateAttachmentUseCaseResponse> {
    if (!/^(image\/(jpeg|png))$|^application\/pdf$/.test(fileType)) {
      return left(new InvalidAttachmentTypeError(fileType));
    }

    const { url } = await this._uploader.upload({
      fileName,
      fileType,
      body
    });

    const attachment = Attachment.create({
      title: fileName,
      url
    });

    await this._attachmentsRepository.create(attachment);

    return right({
      attachment
    });
  }
}
