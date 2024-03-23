import { Test, TestingModule } from '@nestjs/testing';
import { LLMService } from './llm.service';
import { PromptTemplate } from 'langchain/prompts';
import { ConfigModule } from '@nestjs/config';
import {
  LLMNotAvailableError,
  PromptTemplateFormatError,
} from './exceptions/exceptions';

describe('LlmserviceService', () => {
  let service: LLMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [LLMService],
    }).compile();

    service = module.get<LLMService>(LLMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOutput()', () => {
    // 1
    it('should generate an output', async () => {
      const model = 'gpt-3.5-turbo';
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}',
        inputVariables: ['product'],
      });

      const output = await service.generateOutput(model, promptTemplate, {
        product: 'cars',
      });

      expect(output).toBeDefined();
    });

    // 2
    it('should throw if the model given is not available', async () => {
      const model = 'gpt-42';
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}',
        inputVariables: ['product'],
      });

      await expect(
        service.generateOutput(model, promptTemplate, {
          product: 'cars',
        }),
      ).rejects.toThrow(LLMNotAvailableError);
    });

    // 3
    it('should throw if the chain values do not match the input variables of the prompt template', async () => {
      const model = 'gpt-3.5-turbo';
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}',
        inputVariables: ['product'],
      });

      const output = await service.generateOutput(model, promptTemplate, {
        wrongValue: 'cars',
      });

      expect(output).rejects.toThrow(PromptTemplateFormatError);
    });
  });

  // 4
  describe('generateRefineOutput()', () => {
    it('should generate the correct output from a chuncked document', async () => {
      const model = 'gpt-3.5-turbo';
      const text = `
      This is the first sentence of the testing text.\n
      This is the second sentence of the testing text. It contains the tagged values to output: llm-organizer`;

      const documents = await service.splitDocument(text, 100, 0);
      const initialPromptTemplate = new PromptTemplate({
        template: `Given the following text, please write the value to output.
        -----------------
        {context}
        -----------------
        Output:`,
        inputVariables: ['context'],
      });

      const refinePromptTemplate = new PromptTemplate({
        template: `
        Given the following text, please only write the tagged value to output.
        -----------------
        You have provided an existing output:
        {existing_answer}
        
        We have the opportunity to refine the original output to give a better answer.
        If the context isn't useful, return the existing output.`,
        inputVariables: ['existing_answer', 'context'],
      });

      const output = await service.generateRefineOutput(
        model,
        initialPromptTemplate,
        refinePromptTemplate,
        {
          input_documents: documents,
        },
      );

      expect(output).toBeDefined();
      expect(output['output_text']).toContain('llm-organizer');
    });
  });
});
