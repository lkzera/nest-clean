import { Either, right, left } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { StudentsRepository } from '../repositories/students-repository';
import { HashComparer } from '../cryptography/hash-comparer';
import { Encrypter } from '../cryptography/encrypter';
import { WrongCredentialsError } from './errors/wrong-credentials-error';

interface AuthenticateStudentUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateStudentUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
  }
>

@Injectable()
export class AuthenticateStudentUseCase {
  constructor(
    private readonly _studentRepository: StudentsRepository,
    private readonly _hashComparer: HashComparer,
    private readonly _encrypter: Encrypter
  ) { }

  async execute({
    email,
    password
  }: AuthenticateStudentUseCaseRequest): Promise<AuthenticateStudentUseCaseResponse> {
    const student = await this._studentRepository.findByEmail(email);
    if (!student) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this._hashComparer.compare(password, student.password);

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }


    const accessToken = await this._encrypter.encrypt({ sub: student.id.toString() });


    return right({
      accessToken
    });
  }
}
