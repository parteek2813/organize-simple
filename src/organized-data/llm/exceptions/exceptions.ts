export class LLMNotAvailableError extends Error {
  constructor(model = '') {
    super(`Model ${model} is not available`);
  }
}

export class PromptTemplateFormatError extends Error {
  constructor() {
    super(`Prompt template could not be formatted with provided chain values`);
  }
}

export class RefinePromptInputVariablesError extends Error {
  constructor(promptTemplate: string, missingInputVariables: string) {
    super(
      `${promptTemplate} is missing mandatory input variable: ${missingInputVariables}`,
    );
  }
}

export class RefineReservedChainValuesError extends Error {
  constructor(value: string) {
    super(`Reserved chain value ${value} cannot be used as an input variable.`);
  }
}
