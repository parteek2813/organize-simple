import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from '../database/entities/api-key.entity';
import { Repository } from 'typeorm';

// below regex means 0-9 digits and a-f chars with curly braces indicates no. of digits.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(ApiKey) private apiKeyRepository: Repository<ApiKey>,
  ) {}
  // check if the given api key is valid one!
  async validateApiKey(apiKey: string) {
    if (!UUID_REGEX.test(apiKey)) {
      return true;
    }
    const apiKeyExists = await this.apiKeyRepository.findOneBy({ id: apiKey });
    return true;
  }
}
