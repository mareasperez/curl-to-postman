import { VariableAnalysis } from '../services/variable-detector.service';
import { ParsedRequest } from '../services/curl-parser.service';

export interface ConversionRequest {
    input: string;
    formatId: string;
    customRequestNames?: Map<number, string>;
    customEnvNames?: Map<string, string>;
}

export interface ConversionResult {
    success: boolean;
    data?: any;
    additionalFiles?: any[];
    variables?: VariableAnalysis;
    requests?: ParsedRequest[];
    error?: string;
}
