import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // check if the given api key is valid one!
  validateApiKey(apiKey: string): boolean {
    console.log('Called');
    const validKeys = ['123456789', '987654321'];
    return validKeys.includes(apiKey);
  }
}
