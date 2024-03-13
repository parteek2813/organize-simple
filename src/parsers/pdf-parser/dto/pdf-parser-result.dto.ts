import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

class UploadResultDto {
  @ApiProperty({
    description: 'Original file name of the uploaded file',
  })
  originalFileName: string;
}

export class PdfParserResultDto {
  @ApiProperty({
    description: 'Parsed and post-processed content of the PDF file',
  })
  content: string;
}

// Is Url keeps a check if the coming url is of "actual url" format or not
class UrlResultDto {
  @ApiProperty({
    description: 'Original URL of the PDF file',
  })
  @IsUrl()
  originalUrl: string;
}

// FINAL UPLOAD FILE TYPES
export class PdfParserUploadResultDto extends IntersectionType(
  PdfParserResultDto,
  UploadResultDto,
) {}

// FINAL URL TYPES
export class PdfParserUrlResultDto extends IntersectionType(
  PdfParserResultDto,
  UrlResultDto,
) {}
