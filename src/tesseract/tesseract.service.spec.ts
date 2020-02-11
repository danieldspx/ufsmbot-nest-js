import { Test, TestingModule } from '@nestjs/testing';
import { TesseractService } from './tesseract.service';

describe('TesseractService', () => {
  let service: TesseractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TesseractService],
    }).compile();

    service = module.get<TesseractService>(TesseractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
