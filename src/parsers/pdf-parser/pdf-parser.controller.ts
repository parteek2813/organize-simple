import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  ParseFilePipeBuilder,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfParserService } from './pdf-parser.service';
import {
  PdfParserUploadResultDto,
  PdfParserUrlResultDto,
} from './dto/pdf-parser-result.dto';
import { PdfParserRequestDto } from './dto/pdf-parser-request.dto';
import { PdfNotParsedError } from './exceptions/exceptions';

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

@ApiUnauthorizedResponse({
  description: "The API key in request's header is missing or invalid",
})
@ApiBadRequestResponse({
  description: 'The request body or the uplaoded file is invalid or missing',
})
@ApiUnprocessableEntityResponse({
  description:
    'The PDF does not contain plain text or information in text format.',
})
@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path: 'parsers/pdf', version: '1' }) // here we are giving path to display
export class PdfParserController {
  // inject service in this controller
  constructor(private readonly pdfParserService: PdfParserService) {}

  @ApiOperation({
    summary: 'Return text from uploaded PDF file',
    description: `This endpoint retrieves the content of an uploaded PDF file and returns it as a text.\n
    The file must be a PDF parsable text context, with a maximum size of 5MB.
   `,
  })
  @ApiOkResponse({
    type: PdfParserUploadResultDto,
    description:
      'The PDF was parsed and post-processed successfully. Its content is returned as text.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema, description: 'PDF file to be parsed' })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  @HttpCode(200)
  async parsePdfFromUpload(
    @UploadedFile(pdfPipe) file: Express.Multer.File,
  ): Promise<PdfParserUploadResultDto> {
    try {
      const text = await this.pdfParserService.parsePdf(file.buffer);

      return {
        originalFileName: file.originalname,
        content: text,
      };
    } catch (e) {
      throw new UnprocessableEntityException(e.message);
    }
  }

  // Parse Pdf from uploaded url line
  @ApiOperation({
    summary: 'Return text from PDF file provided by URL',
    description: `This endpoint retrieves the content of an PDF file available through an URL and returns it as a text.\n
    The file must be a PDF parsable text context, with a maximum size of 5MB`,
  })
  @ApiOkResponse({
    type: PdfParserUploadResultDto,
    description:
      'The PDF was parsed and post-processed successfully. Its content is returned as text.',
  })
  @Post('url')
  @HttpCode(200)
  async parserPdfFromUrl(
    @Body() requestDto: PdfParserRequestDto,
  ): Promise<PdfParserUrlResultDto> {
    try {
      // load pdf from url first
      const file = await this.pdfParserService.loadPdfFromUrl(requestDto.url);
      const text = await this.pdfParserService.parsePdf(file);

      return {
        originalUrl: requestDto.url,
        content: text,
      };
    } catch (e) {
      if (e instanceof PdfNotParsedError) {
        throw new UnprocessableEntityException(e.message);
      }

      throw new BadRequestException(e.message);
    }
  }
}
