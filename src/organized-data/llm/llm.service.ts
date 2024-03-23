import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/dist/schema';
import { LLMChain, loadQARefineChain } from 'langchain/chains';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import {
  LLMNotAvailableError,
  PromptTemplateFormatError,
  RefinePromptInputVariablesError,
  RefineReservedChainValuesError,
} from './exceptions/exceptions';
import { Document } from 'langchain/document';

@Injectable()
export class LLMService {
  constructor(private configService: ConfigService) {}

  private gpt3_5 = new ChatOpenAI({
    cache: true,
    maxConcurrency: 10,
    maxRetries: 3,
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: this.configService.get<string>('openApiKey'),
    temperature: 0,
  });

  private gpt4 = new ChatOpenAI({
    maxConcurrency: 10,
    maxRetries: 3,
    modelName: 'gpt-4',
    openAIApiKey: this.configService.get<string>('openApiKey'),
    temperature: 0,
  });

  private availablemodels = new Map<string, BaseLanguageModel>([
    ['gpt-3.5-turbo', this.gpt3_5],
    ['gpt-4', this.gpt4],
  ]);

  async generateOutput(
    model: string,
    promptTemplate: PromptTemplate,
    chainValues: ChainValues,
  ) {
    // if user requested model not present
    if (!this.availablemodels.has(model)) {
      throw new Error(`Model ${model} is not available`);
    }

    try {
      await promptTemplate.format(chainValues);
    } catch (e) {
      throw new PromptTemplateFormatError();
    }

    const llmchain = new LLMChain({
      llm: this.availablemodels.get(model),
      prompt: promptTemplate,
    });

    const output = await llmchain.call(chainValues);
    return output;
  }

  //
  async splitDocument(document: string, chunkSize = 2000, chunkOverlap = 200) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });

    const output = await splitter.createDocuments([document]);
    return output;
  }

  async generateRefineOutput(
    model: string,
    initialPromptTemplate: PromptTemplate,
    refinePromptTemplate: PromptTemplate,
    chainValues: ChainValues & { input_documents: Document[] },
  ) {
    if (!this.availablemodels.has(model)) {
      throw new LLMNotAvailableError(model);
    }

    if (chainValues['context'] || chainValues['existing_answer']) {
      throw new RefineReservedChainValuesError('context or existing_answer');
    }

    this.throwErrorIfInputVariableMissing(
      'initialPromptTemplate',
      'context',
      initialPromptTemplate.inputVariables,
    );

    this.throwErrorIfInputVariableMissing(
      'refinePromptTemplate',
      'context',
      refinePromptTemplate.inputVariables,
    );

    this.throwErrorIfInputVariableMissing(
      'refinePromptTemplate',
      'existing_answer',
      refinePromptTemplate.inputVariables,
    );

    const refineChain = loadQARefineChain(this.availablemodels.get(model), {
      questionPrompt: initialPromptTemplate,
      refinePrompt: refinePromptTemplate,
    });

    const output = await refineChain.call(chainValues);
    return output;
  }

  private throwErrorIfInputVariableMissing(
    templateName: string,
    variableName: string,
    inputVariables: string[],
  ) {
    if (!inputVariables.includes(variableName)) {
      throw new RefinePromptInputVariablesError(templateName, variableName);
    }
    // if (!this.availablemodels.has(model)) {
    //   throw new LLMNotAvailableError(model);
    // }
    // // for checking of the input variables
    // try {
    //   for (const promptTemplate of promptTemplates) {
    //     await promptTemplate.format(chainValues);
    //   }
    // } catch (e) {
    //   throw new PromptTemplateFormatError();
    // }
  }
}
