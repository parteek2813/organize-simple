import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfParserService } from './pdf-parser.service';
import { PdfParserResultDto } from './dto/pdf-parser-result.dto';

const uploadSchema = {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
    },
  },
};

// pipes to do series of operation!
const pdfPipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: 'pdf',
  })
  .addMaxSizeValidator({
    maxSize: 1024 * 1024 * 5, // 5 MB
  })
  .build({
    fileIsRequired: true,
  });

@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path: 'parsers/pdf', version: '1' })
export class PdfParserController {
  // inject service in this controller
  constructor(private readonly pdfParserService: PdfParserService) {}
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async parsePdfFromUpload(
    @UploadedFile(pdfPipe) file: Express.Multer.File,
  ): Promise<PdfParserResultDto> {
    const text = await this.pdfParserService.parsePdf(file.buffer);

    if (typeof text !== 'string' || text.length === 0) {
      throw new UnprocessableEntityException('Could not parse given PDF file');
    }

    return {
      originalFileName: file.originalname,
      content: text,
    };
  }
}
