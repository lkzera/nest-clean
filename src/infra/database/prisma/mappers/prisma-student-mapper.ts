import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Student } from '@/domain/forum/enterprise/entities/student';
import { User as PrismaStudent, Prisma } from '@prisma/client';

export class PrismaStudentMapper {
  static toDomain(raw: PrismaStudent): Student {
    return Student.create({
      name: raw.name,
      email: raw.email,
      password: raw.password
    }, new UniqueEntityID(raw.id));
  }

  static toPrisma(student: Student): Prisma.UserUncheckedCreateInput {
    return {
      name: student.id.toString(),
      email: student.email,
      password: student.password
    };
  }
}