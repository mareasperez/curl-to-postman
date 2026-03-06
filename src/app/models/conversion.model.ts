import type { VariableAnalysis, ParsedRequest, ExportOutput, AdditionalFile } from './index';

export interface ConversionRequest {
    input: string;
    formatId: string;
    customRequestNames?: Map<number, string>;
    customEnvNames?: Map<string, string>;
    customHostVariables?: Map<string, string>;
    customTokenVariables?: Map<string, string>;
    removedTokenKeys?: Set<string>;
}

export interface ConversionResult {
    success: boolean;
    data?: ExportOutput;
    additionalFiles?: AdditionalFile[];
    variables?: VariableAnalysis;
    requests?: ParsedRequest[];
    error?: string;
    // Duplicate detection
    generatedNames?: Map<number, string>;
    duplicateNames?: Map<string, number[]>;
}
