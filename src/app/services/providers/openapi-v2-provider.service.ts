import { Injectable } from '@angular/core';
import {
    ExportProvider,
    ExportFormat,
    ExportResult,
    ExportInput
} from './export-provider.interface';
import { ParsedRequest } from '../curl-parser.service';
import { VariableAnalysis } from '../variable-detector.service';

/**
 * Swagger 2.0 specification interface
 */
interface SwaggerSpec {
    swagger: string;
    info: {
        title: string;
        description: string;
        version: string;
    };
    host?: string;
    basePath?: string;
    schemes: string[];
    paths: Record<string, any>;
    securityDefinitions?: Record<string, any>;
    security?: any[];
}

/**
 * Export provider for Swagger/OpenAPI 2.0 specification
 */
@Injectable({
    providedIn: 'root'
})
export class OpenApiV2ProviderService implements ExportProvider {

    getMetadata(): ExportFormat {
        return {
            id: 'swagger-2.0',
            name: 'Swagger 2.0',
            version: '2.0',
            extension: 'json',
            mimeType: 'application/json',
            description: 'Swagger/OpenAPI 2.0 specification'
        };
    }

    generate(input: ExportInput): ExportResult {
        const { requests, variables, customRequestNames } = input;

        const spec: SwaggerSpec = {
            swagger: '2.0',
            info: {
                title: 'API Specification',
                description: 'Auto-generated from cURL commands',
                version: '1.0.0'
            },
            schemes: this.extractSchemes(variables),
            paths: {}
        };

        // Set host and basePath from first environment
        if (variables.environments.size > 0) {
            const firstEnv = Array.from(variables.environments.values())[0];
            spec.host = firstEnv.host;
            spec.basePath = '/';
        }

        // Add security definitions
        if (variables.tokens.size > 0) {
            spec.securityDefinitions = this.generateSecurityDefinitions(variables);
            spec.security = this.generateGlobalSecurity(variables);
        }

        // Generate paths from requests
        requests.forEach((request, index) => {
            this.addRequestToSpec(spec, request, index, variables, customRequestNames);
        });

        return {
            data: spec,
            metadata: this.getMetadata()
        };
    }

    private extractSchemes(variables: VariableAnalysis): string[] {
        const schemes = new Set<string>();
        variables.environments.forEach(env => {
            schemes.add(env.protocol);
        });
        return Array.from(schemes);
    }

    private generateSecurityDefinitions(variables: VariableAnalysis): Record<string, any> {
        const definitions: Record<string, any> = {};

        variables.tokens.forEach((tokenData, tokenKey) => {
            const headerName = tokenData.header.toLowerCase();

            if (headerName.includes('authorization') && tokenData.value.startsWith('Bearer ')) {
                // OAuth2 or API Key in Authorization header
                definitions[tokenKey] = {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description: 'Bearer token authentication'
                };
            } else if (headerName.includes('api-key') || headerName.includes('apikey')) {
                definitions[tokenKey] = {
                    type: 'apiKey',
                    name: tokenData.header,
                    in: 'header'
                };
            } else {
                definitions[tokenKey] = {
                    type: 'apiKey',
                    name: tokenData.header,
                    in: 'header'
                };
            }
        });

        return definitions;
    }

    private generateGlobalSecurity(variables: VariableAnalysis): any[] {
        const security: any[] = [];
        variables.tokens.forEach((_, tokenKey) => {
            security.push({ [tokenKey]: [] });
        });
        return security;
    }

    private addRequestToSpec(
        spec: SwaggerSpec,
        request: ParsedRequest,
        index: number,
        variables: VariableAnalysis,
        customNames?: Map<number, string>
    ): void {
        try {
            const url = new URL(request.url);
            const path = url.pathname || '/';
            const method = request.method.toLowerCase();

            // Initialize path if it doesn't exist
            if (!spec.paths[path]) {
                spec.paths[path] = {};
            }

            // Generate operation ID
            const operationId = customNames?.get(index) || this.generateOperationId(request, index);

            // Create operation
            const operation: any = {
                summary: `${request.method} ${path}`,
                operationId: operationId,
                produces: ['application/json'],
                responses: {
                    '200': {
                        description: 'Successful response'
                    }
                }
            };

            // Add query parameters
            const queryParams = this.extractQueryParameters(url);
            const headerParams = this.extractHeaderParameters(request, variables);

            if (queryParams.length > 0 || headerParams.length > 0) {
                operation.parameters = [...queryParams, ...headerParams];
            }

            // Add request body if present
            if (request.body) {
                operation.consumes = ['application/json'];
                operation.parameters = operation.parameters || [];
                operation.parameters.push({
                    name: 'body',
                    in: 'body',
                    required: true,
                    schema: this.inferSchemaFromBody(request.body)
                });
            }

            spec.paths[path][method] = operation;
        } catch (e) {
            console.error('Error adding request to Swagger spec:', e);
        }
    }

    private generateOperationId(request: ParsedRequest, index: number): string {
        try {
            const urlObj = new URL(request.url);
            const pathSegments = urlObj.pathname.split('/').filter(p => p);

            let endpoint = pathSegments.length > 0
                ? pathSegments[pathSegments.length - 1]
                : 'root';

            endpoint = endpoint
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');

            if (/^[0-9a-f-]+$/i.test(endpoint) && pathSegments.length > 1) {
                const parentSegment = pathSegments[pathSegments.length - 2];
                endpoint = parentSegment.replace(/[^a-zA-Z0-9_-]/g, '_');
            }

            const method = request.method.toLowerCase();
            return endpoint ? `${method}_${endpoint}` : `${method}_request_${index + 1}`;
        } catch (e) {
            return `${request.method.toLowerCase()}_request_${index + 1}`;
        }
    }

    private extractQueryParameters(url: URL): any[] {
        const params: any[] = [];

        url.searchParams.forEach((value, key) => {
            params.push({
                name: key,
                in: 'query',
                required: false,
                type: this.inferType(value)
            });
        });

        return params;
    }

    private extractHeaderParameters(request: ParsedRequest, variables: VariableAnalysis): any[] {
        const params: any[] = [];
        const authHeaders = new Set(['authorization', 'x-auth-token', 'x-api-key', 'api-key']);

        Object.entries(request.headers).forEach(([key, value]) => {
            const lowerKey = key.toLowerCase();

            const isAuthHeader = authHeaders.has(lowerKey) ||
                variables.tokens.has(`${lowerKey.replace(/[^a-z0-9]/g, '_')}_token`);

            if (!isAuthHeader && !['content-type', 'accept', 'user-agent'].includes(lowerKey)) {
                params.push({
                    name: key,
                    in: 'header',
                    required: false,
                    type: 'string'
                });
            }
        });

        return params;
    }

    private inferSchemaFromBody(body: string): any {
        try {
            const parsed = JSON.parse(body);
            return this.generateSchemaFromObject(parsed);
        } catch {
            return {
                type: 'string'
            };
        }
    }

    private generateSchemaFromObject(obj: any): any {
        if (Array.isArray(obj)) {
            return {
                type: 'array',
                items: obj.length > 0 ? this.generateSchemaFromObject(obj[0]) : { type: 'string' }
            };
        }

        if (typeof obj === 'object' && obj !== null) {
            const properties: Record<string, any> = {};
            Object.entries(obj).forEach(([key, value]) => {
                properties[key] = this.generateSchemaFromObject(value);
            });
            return {
                type: 'object',
                properties
            };
        }

        return {
            type: this.inferType(obj)
        };
    }

    private inferType(value: any): string {
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        if (value === null) return 'string';
        return 'string';
    }
}
