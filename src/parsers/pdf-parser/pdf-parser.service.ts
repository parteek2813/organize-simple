import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Poppler from 'node-poppler';

@Injectable()
export class PdfParserService {
  // inject
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async parsePdf(file: Buffer) {
    const poppler = new Poppler();

    let text = await poppler.pdfToText(file, null, {
      maintainLayout: true,
      quiet: true,
    });

    if (typeof text === 'string') {
      text = this.postProcessText(text);
    }

    return text;
  }

  // private functions
  private postProcessText(text: string) {
    // trim each line
    const lines = text.split('\n').map((line) => line.trim());

    // keep only one line if multiple lines are empty
    const lines2 = lines.filter((line, index) => {
      if (line === '') {
        return lines[index - 1] !== '';
      }
      return true;
    });

    // remove whitespaces in lines if there are more than 3 spaces
    const lines3 = lines2.map((line) => {
      return line.replace(/\s{3,}/g, '   ');
    });

    // const processedText = text
    //   .split('\n')
    //   .map((line) => line.trim())
    //   // keep only one line if multiple lines are empty
    //   .filter((line, index, arr) => {
    //     line !== '' || arr[index - 1] !== '';
    //   })
    //   .map((line) => line.replace(/\s{3,}/g, '   '))
    //   .join('\n');

    // join text after that
    const postProcessedText = lines3.join('\n');
    return postProcessedText;
  }

  async loadPdfFromUrl(url: string) {
    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    // check the headers once
    if (!response.headers['content-type'].includes('application/pdf')) {
      throw new BadRequestException('The provided URL is not a PDF');
    }

    // If file is larger
    // TODO - Check for response.header format type
    if (
      parseInt(response.headers['Content-Length'] as string, 10) >
      5 * 1024 * 1024
    ) {
      throw new BadRequestException('The PDF file is larger than expected.');
    }

    return Buffer.from(response.data, 'binary');
  }
}
