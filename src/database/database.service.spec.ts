import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let config: ConfigService;
  let matricula;
  let password;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService, ConfigService],
      imports: [ConfigModule.forRoot()],
    }
    ).compile();
    service = module.get<DatabaseService>(DatabaseService);
    config = module.get<ConfigService>(ConfigService);
    matricula = config.get<string>('MATRICULA');
    password = config.get<string>('PASSWORD');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(config).toBeDefined();
  });

  it(`should return a user with matricula: ${201910481}`, () => {
    const testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toMatchObject(expected)
    });

    testScheduler.run(helpers => {
      helpers.expectObservable(
        service.getStudentByMatricula('201910481', '99147465').pipe(mergeMap(docRef => docRef.get()), map(doc => doc.data))
      ).toBe('1ms a|', { a: { matricula: '2019104811' } })
    })
    // expect(await service.getStudentByMatricula(matricula, password).pipe(mergeMap(docRef => docRef.get()), map(doc => doc.data)).subscribe(x => x)).toHaveProperty('matricula', matricula);
  }, 10000)
});
