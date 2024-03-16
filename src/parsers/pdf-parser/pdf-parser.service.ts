import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import Poppler from 'node-poppler';
import {
  PdfExtensionError,
  PdfMagicNumberError,
  PdfNotParsedError,
  PdfSizeError,
} from './exceptions/exceptions';

@Injectable()
export class PdfParserService {
  // inject
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async parsePdf(file: Buffer) {
    const poppler = new Poppler();

    const output = (await poppler.pdfToText(file, null, {
      maintainLayout: true,
      quiet: true,
    })) as any;

    if (output instanceof Error || output.length === 0) {
      throw new PdfNotParsedError();
    }

    return this.postProcessText(output);
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
    // get the extension
    const extension = url.split('.').pop();

    // check if the extension is not a pdf
    if (extension !== 'pdf') {
      throw new PdfExtensionError();
    }

    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    this.checkResponse(response);

    return Buffer.from(response.data, 'binary');
  }

  private checkResponse(response: AxiosResponse) {
    // If file is larger
    // TODO - Check for response.header format type
    if (
      parseInt(response.headers['Content-Length'] as string, 10) >
      5 * 1024 * 1024
    ) {
      throw new PdfSizeError();
    }

    const pdfMagicNumber = Buffer.from([0x25, 0x50, 0x44, 0x46]);
    const bufferStart = response.data.subarray(0, 4);
    if (!bufferStart.equals(pdfMagicNumber)) {
      throw new PdfMagicNumberError();
    }
  }
}
