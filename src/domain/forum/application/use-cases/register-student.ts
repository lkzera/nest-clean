import { Either, right, left } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { Student } from '../../enterprise/entities/student';
import { StudentsRepository } from '../repositories/students-repository';
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator';
import { StudentAlreadyExistsError } from './errors/student-already-exists-error';

interface RegisterStudentUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

type RegisterStudentUseCaseResponse = Either<
  StudentAlreadyExistsError,
  {
    student: Student
  }
>

@Injectable()
export class RegisterStudentUseCase {
  constructor(
    private readonly _studentRepository: StudentsRepository,
    private readonly _hashGenerator: HashGenerator
  ) { }

  async execute({
    name,
    email,
    password
  }: RegisterStudentUseCaseRequest): Promise<RegisterStudentUseCaseResponse> {
    const studentWithSameEmail = await this._studentRepository.findByEmail(email);

    if (studentWithSameEmail) {
      return left(new StudentAlreadyExistsError(email));
    }

    const hashedPassword = await this._hashGenerator.hash(password);

    const student = Student.create({
      name,
      email,
      password: hashedPassword
    });

    await this._studentRepository.create(student);

    return right({
      student
    });
  }
}
