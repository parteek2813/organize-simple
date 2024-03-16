import { Test, TestingModule } from '@nestjs/testing';
import { PdfParserService } from './pdf-parser.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import {
  PdfExtensionError,
  PdfMagicNumberError,
} from './exceptions/exceptions';

describe('PdfParserService', () => {
  let service: PdfParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfParserService],
      imports: [ConfigModule.forRoot(), HttpModule],
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

  describe('loadPdfFromUrl()', () => {
    it('should load the pdf from url and parse it', async () => {
      const url =
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const buffer = await service.loadPdfFromUrl(url);
      const expected = 'Dummy PDF file';
      const actual = await service.parsePdf(buffer);
      expect(actual).toEqual(expected);
    });

    it('should throw an error if the file extension is not pdf', async () => {
      const url =
        'https://images.ctfassets.net/ub3bwfd53mwy/5WFv6lEUb1e6kWeP06CLXr/acd328417f24786af98b1750d90813de/4_Image.jpg';

      await expect(service.loadPdfFromUrl(url)).rejects.toThrowError(
        PdfExtensionError,
      );
    });

    it('should throw an error if the file does not have a pdf magic number', async () => {
      const url =
        'https://images.ctfassets.net/ub3bwfd53mwy/5WFv6lEUb1e6kWeP06CLXr/acd328417f24786af98b1750d90813de/4_Image.jpg.pdf';

      await expect(service.loadPdfFromUrl(url)).rejects.toThrowError(
        PdfMagicNumberError,
      );
    });
  });
});
