import { InjectionToken } from '@angular/core';
// import { ParsedRequest } from '../curl-parser.service';
// import { VariableAnalysis } from '../variable-detector.service';
import { ParsedRequest } from '@models/index';
import { VariableAnalysis } from '@models/index';

/**
 * Metadata describing an export format
 */
export interface ExportFormat {
    id: string;
    name: string;
    version: string;
    extension: string;
    mimeType: string;
    description?: string;
}

/**
 * Result of an export operation
 */
export interface ExportResult {
    data: any;
    metadata: ExportFormat;
    additionalFiles?: {
        name: string;
        data: any;
        mimeType: string;
    }[];
}

/**
 * Input parameters for export generation
 */
export interface ExportInput {
    requests: ParsedRequest[];
    variables: VariableAnalysis;
    getHostVariable: (host: string) => string;
    customRequestNames?: Map<number, string>;
    customEnvNames?: Map<string, string>;
}

/**
 * Base interface that all export providers must implement
 */
export interface ExportProvider {
    /**
     * Generate export output from parsed requests
     */
    generate(input: ExportInput): ExportResult;

    /**
     * Get metadata about this export format
     */
    getMetadata(): ExportFormat;
}

/**
 * InjectionToken for multi-provider registration
 * Use this token to register multiple export providers
 */
export const EXPORT_PROVIDER = new InjectionToken<ExportProvider[]>('EXPORT_PROVIDER');
