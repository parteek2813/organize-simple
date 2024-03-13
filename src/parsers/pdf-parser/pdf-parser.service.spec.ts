import { Test, TestingModule } from '@nestjs/testing';
import { PdfParserService } from './pdf-parser.service';

describe('PdfParserService', () => {
  let service: PdfParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfParserService],
    }).compile();

    service = module.get<PdfParserService>(PdfParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('postProcessText', () => {
    it('should trim the lines and remove excess inner whitespace to keep maximum of 3', () => {
      const input = '       a           b             c d        ';
      const expectedValue = 'a   b   c d';
      const actualValue = service['postProcessText'](input);
      expect(actualValue).toEqual(expectedValue);
    });

    it('should keep only one empty line if multiple lines are empty', () => {
      const input = 'a\n\n\nb\n\n\n\nc\nd';
      const expectedValue = 'a\n\nb\n\nc\nd';
      const actualValue = service['postProcessText'](input);
      expect(actualValue).toEqual(expectedValue);
    });
  });
});
