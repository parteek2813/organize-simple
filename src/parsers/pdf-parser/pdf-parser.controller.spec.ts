import { Test, TestingModule } from '@nestjs/testing';
import { PdfParserController } from './pdf-parser.controller';
import { PdfParserService } from './pdf-parser.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('PdfParserController', () => {
  let controller: PdfParserController;
  let service: PdfParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfParserController],
      providers: [PdfParserService],
      imports: [ConfigModule.forRoot(), HttpModule],
    }).compile();

    controller = module.get<PdfParserController>(PdfParserController);
    service = module.get<PdfParserService>(PdfParserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('shold return a PdfParserUploadResultDto', async () => {
    const text = 'text';
    const mockFile: Express.Multer.File = {
      buffer: Buffer.from(text),
      originalname: 'test.pdf',
      encoding: 'utf-8',
      mimetype: 'application/pdf',
      size: 5 * 1024 * 1024,
      fieldname: 'file',
      destination: '',
      filename: '',
      path: '',
      stream: null,
    };

    // parse
    const parseResult = Promise.resolve(text);
    const responseResult = {
      originalFileName: mockFile.originalname,
      content: text,
    };

    jest.spyOn(service, 'parsePdf').mockImplementation(async () => parseResult);
    expect(await controller.parsePdfFromUpload(mockFile)).toEqual(
      responseResult,
    );
  });

  it('should throw a UnprocessableEntityException from an invalid uploader PDF file', async () => {
    const text = 'text';
    const mockFile: Express.Multer.File = {
      buffer: Buffer.from(text),
      originalname: 'test.pdf',
      encoding: 'utf-8',
      mimetype: 'application/pdf',
      size: 5 * 1024 * 1024,
      fieldname: 'file',
      destination: '',
      filename: '',
      path: '',
      stream: null,
    };

    await expect(controller.parsePdfFromUpload(mockFile)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should return a PdfParserUrlResultDto from a PDF file given from a URL', async () => {
    // This case arises if the PDf is parsed successfully
    const url =
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const responseResult = {
      originalUrl: url,
      content: 'Dummy PDF file',
    };

    expect(await controller.parserPdfFromUrl({ url: url })).toEqual(
      responseResult,
    );
  });

  // it('should throw an UnprocessableEntityException from a unsearchable PDF file given from a URL', async () => {
  //   // This case arises if there is no text in the PDF file
  //   const url =
  //     'https://pub-e0c49d057f644ddd8865f82361396859.r2.dev/test_scanned.pdf';

  //   expect(await controller.parserPdfFromUrl({ url: url })).rejects.toThrow(
  //     UnprocessableEntityException,
  //   );
  // });

  // it('should throw a BadRequestException from an invalid file extension', async () => {
  //   // This case arises if extension is different than expected (.pdf)
  //   const url =
  //     'https://images.ctfassets.net/ub3bwfd53mwy/5WFv6lEUb1e6kWeP06CLXr/acd328417f24786af98b1750d90813de/4_Image.jpg';

  //   expect(await controller.parserPdfFromUrl({ url: url })).rejects.toThrow(
  //     BadRequestException,
  //   );
  // });

  // it('should throw a BadRequestException from a file with .pdf but not having its magic number', async () => {
  //   // This case arises if there is no magic number but file is an .pdf file
  //   const url =
  //     'https://images.ctfassets.net/ub3bwfd53mwy/5WFv6lEUb1e6kWeP06CLXr/acd328417f24786af98b1750d90813de/4_Image.jpg.pdf';

  //   expect(await controller.parserPdfFromUrl({ url: url })).rejects.toThrow(
  //     BadRequestException,
  //   );
  // });
});
