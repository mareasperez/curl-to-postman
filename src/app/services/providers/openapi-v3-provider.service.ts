import { Injectable } from '@angular/core';
import {
    ExportProvider,
    ExportFormat,
    ExportResult,
    ExportInput
} from './export-provider.interface';
import { OpenApiGeneratorService } from '../openapi-generator.service';

/**
 * Export provider for OpenAPI 3.0.3 specification
 */
@Injectable({
    providedIn: 'root'
})
export class OpenApiV3ProviderService implements ExportProvider {

    constructor(private openApiGenerator: OpenApiGeneratorService) { }

    getMetadata(): ExportFormat {
        return {
            id: 'openapi-3.0',
            name: 'OpenAPI 3.0',
            version: '3.0.3',
            extension: 'json',
            mimeType: 'application/json',
            description: 'OpenAPI 3.0.3 specification'
        };
    }

    generate(input: ExportInput): ExportResult {
        const { requests, variables, customRequestNames } = input;

        // Generate OpenAPI spec
        const spec = this.openApiGenerator.generate(
            requests,
            variables,
            customRequestNames
        );

        return {
            data: spec,
            metadata: this.getMetadata()
        };
    }
}
