import { Injectable } from '@angular/core';
import { CurlParserService } from './curl-parser.service';
import { VariableDetectorService } from './variable-detector.service';
import { ExportProviderService } from './providers/export-provider.service';
import { ConversionRequest, ConversionResult } from '../models/conversion.model';
import { PostmanGeneratorService } from './postman-generator.service';
import { ParsedRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ConversionService {
    constructor(
        private curlParser: CurlParserService,
        private variableDetector: VariableDetectorService,
        private exportProvider: ExportProviderService,
        private nameGenerator: PostmanGeneratorService
    ) { }

    convert(request: ConversionRequest): ConversionResult {
        try {
            const input = request.input.trim();

            // Validate input
            if (!input) {
                return {
                    success: false,
                    error: 'Please enter at least one cURL command'
                };
            }

            // Parse cURL commands
            const requests = this.curlParser.parseMultiple(input);

            if (requests.length === 0) {
                return {
                    success: false,
                    error: 'No valid cURL commands detected'
                };
            }

            // Detect variables
            const variables = this.variableDetector.analyze(requests);

            // Generate names and detect duplicates
            const { generatedNames, duplicateNames } = this.generateNamesAndDuplicates(
                requests,
                request.customRequestNames
            );

            // Export using selected format
            const result = this.exportProvider.export(request.formatId, {
                requests,
                variables,
                getHostVariable: (host) => this.variableDetector.getHostVariable(host),
                customRequestNames: request.customRequestNames || new Map(),
                customEnvNames: request.customEnvNames || new Map()
            });

            if (!result) {
                return {
                    success: false,
                    error: 'Export failed: format not found'
                };
            }

            return {
                success: true,
                data: result.data,
                additionalFiles: result.additionalFiles || [],
                variables,
                requests,
                generatedNames,
                duplicateNames
            };
        } catch (error) {
            console.error('Conversion error:', error);
            return {
                success: false,
                error: (error as Error).message
            };
        }
    }

    validateInput(input: string): boolean {
        return input.trim().length > 0 && input.includes('curl');
    }

    countCommands(input: string): number {
        return (input.match(/curl\s+/g) || []).length;
    }

    private generateNamesAndDuplicates(
        requests: ParsedRequest[],
        customNames: Map<number, string> | undefined
    ): {
        generatedNames: Map<number, string>;
        duplicateNames: Map<string, number[]>;
    } {
        const generatedNames = new Map<number, string>();
        const nameToIndices = new Map<string, number[]>();
        const duplicateNames = new Map<string, number[]>();

        requests.forEach((req, index) => {
            // Use custom name if provided, otherwise generate one
            const name = customNames?.get(index) ||
                this.nameGenerator.generateRequestName(req, index);

            generatedNames.set(index, name);

            // Track indices for each name
            const indices = nameToIndices.get(name) || [];
            indices.push(index);
            nameToIndices.set(name, indices);
        });

        // Filter for duplicates (names appearing more than once)
        nameToIndices.forEach((indices, name) => {
            if (indices.length > 1) {
                duplicateNames.set(name, indices);
            }
        });

        return { generatedNames, duplicateNames };
    }
}
