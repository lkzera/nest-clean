import { RegisterStudentUseCase } from './register-student';
import { FakerHasher } from 'test/cryptography/fake-hasher';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakerHasher;
let sut: RegisterStudentUseCase;

describe('Register Student', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    fakeHasher = new FakerHasher();
    sut = new RegisterStudentUseCase(inMemoryStudentsRepository, fakeHasher);
  });

  it('should be able to register to a new student', async () => {
    const result = await sut.execute({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: '123'
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      student: inMemoryStudentsRepository.items[0]
    });
  });

  it('should hash student password upon registration', async () => {
    const result = await sut.execute({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: '123'
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryStudentsRepository.items[0].password).toEqual('123-hashed');
  });
});
