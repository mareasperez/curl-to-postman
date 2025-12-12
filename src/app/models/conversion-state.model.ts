import type { ParsedRequest, VariableAnalysis, ExportOutput, AdditionalFile } from './index';


/**
 * State related to conversion results
 */
export interface ConversionState {
    /** Generated output (Postman collection, OpenAPI spec, etc.) */
    output: ExportOutput | null;

    /** Additional files like environment files */
    additionalFiles: AdditionalFile[];

    /** Detected variables (hosts, tokens, environments) */
    variables: VariableAnalysis | null;

    /** Parsed cURL requests */
    requests: ParsedRequest[];

    /** Auto-generated request names */
    generatedNames: Map<number, string>;

    /** Duplicate request names detected */
    duplicateNames: Map<string, number[]>;
}
