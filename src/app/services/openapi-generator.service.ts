import { Injectable } from '@angular/core';
import { ParsedRequest, VariableAnalysis, TokenData, EnvironmentData } from '../models';

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: OpenAPIServer[];
  paths: Record<string, OpenAPIPath>;
  components?: {
    securitySchemes?: Record<string, OpenAPISecurityScheme>;
    schemas?: Record<string, any>;
  };
  security?: OpenAPISecurity[];
}

export interface OpenAPIServer {
  url: string;
  description: string;
  variables?: Record<string, {
    default: string;
    description?: string;
  }>;
}

export interface OpenAPIPath {
  [method: string]: OpenAPIOperation;
}

export interface OpenAPIOperation {
  summary: string;
  operationId: string;
  parameters?: OpenAPIParameter[];
  requestBody?: {
    content: {
      [mediaType: string]: {
        schema: any;
      };
    };
  };
  responses: {
    [statusCode: string]: {
      description: string;
      content?: any;
    };
  };
  security?: OpenAPISecurity[];
}

export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required?: boolean;
  schema: {
    type: string;
  };
  description?: string;
}

export interface OpenAPISecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  scheme?: string;
  bearerFormat?: string;
  in?: 'query' | 'header' | 'cookie';
  name?: string;
}

export interface OpenAPISecurity {
  [name: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OpenApiGeneratorService {

  generate(
    requests: ParsedRequest[],
    variables: VariableAnalysis,
    customNames?: Map<number, string>
  ): OpenAPISpec {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'API Specification',
        description: 'Auto-generated from cURL commands',
        version: '1.0.0'
      },
      servers: this.generateServers(variables),
      paths: {},
      components: {
        securitySchemes: this.generateSecuritySchemes(variables)
      }
    };

    // Add security if tokens exist
    if (variables.tokens.size > 0) {
      spec.security = this.generateGlobalSecurity(variables);
    }

    // Generate paths from requests
    requests.forEach((request, index) => {
      this.addRequestToSpec(spec, request, index, variables, customNames);
    });

    return spec;
  }

  private generateServers(variables: VariableAnalysis): OpenAPIServer[] {
    const servers: OpenAPIServer[] = [];

    variables.environments.forEach((env: EnvironmentData) => {
      const server: OpenAPIServer = {
        url: `{protocol}://{host}`,
        description: env.isLocal ? 'Local environment' : 'Remote environment',
        variables: {
          protocol: {
            default: env.protocol,
            description: 'Protocol (http or https)'
          },
          host: {
            default: env.host,
            description: 'Server host and port'
          }
        }
      };
      servers.push(server);
    });

    return servers;
  }

  private generateSecuritySchemes(variables: VariableAnalysis): Record<string, OpenAPISecurityScheme> | undefined {
    if (variables.tokens.size === 0) return undefined;

    const schemes: Record<string, OpenAPISecurityScheme> = {};

    variables.tokens.forEach((tokenData: TokenData, tokenKey: string) => {
      const headerName = tokenData.header.toLowerCase();

      if (headerName.includes('authorization') && tokenData.value.startsWith('Bearer ')) {
        schemes[tokenKey] = {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        };
      } else if (headerName.includes('api-key') || headerName.includes('apikey')) {
        schemes[tokenKey] = {
          type: 'apiKey',
          in: 'header',
          name: tokenData.header
        };
      } else {
        schemes[tokenKey] = {
          type: 'apiKey',
          in: 'header',
          name: tokenData.header
        };
      }
    });

    return Object.keys(schemes).length > 0 ? schemes : undefined;
  }

  private generateGlobalSecurity(variables: VariableAnalysis): OpenAPISecurity[] {
    const security: OpenAPISecurity[] = [];

    variables.tokens.forEach((_: TokenData, tokenKey: string) => {
      security.push({ [tokenKey]: [] });
    });

    return security;
  }

  private addRequestToSpec(
    spec: OpenAPISpec,
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
      const operation: OpenAPIOperation = {
        summary: `${request.method} ${path}`,
        operationId: operationId,
        responses: {
          '200': {
            description: 'Successful response'
          }
        }
      };

      // Add query parameters
      const queryParams = this.extractQueryParameters(url);
      if (queryParams.length > 0) {
        operation.parameters = queryParams;
      }

      // Add headers as parameters (excluding auth headers)
      const headerParams = this.extractHeaderParameters(request, variables);
      if (headerParams.length > 0) {
        operation.parameters = [...(operation.parameters || []), ...headerParams];
      }

      // Add request body if present
      if (request.body) {
        operation.requestBody = {
          content: {
            'application/json': {
              schema: this.inferSchemaFromBody(request.body)
            }
          }
        };
      }

      spec.paths[path][method] = operation;
    } catch (e) {
      console.error('Error adding request to OpenAPI spec:', e);
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

  private extractQueryParameters(url: URL): OpenAPIParameter[] {
    const params: OpenAPIParameter[] = [];

    url.searchParams.forEach((value, key) => {
      params.push({
        name: key,
        in: 'query',
        required: false,
        schema: {
          type: this.inferType(value)
        }
      });
    });

    return params;
  }

  private extractHeaderParameters(request: ParsedRequest, variables: VariableAnalysis): OpenAPIParameter[] {
    const params: OpenAPIParameter[] = [];
    const authHeaders = new Set(['authorization', 'x-auth-token', 'x-api-key', 'api-key']);

    Object.entries(request.headers).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();

      // Skip auth headers as they're handled by security schemes
      const isAuthHeader = authHeaders.has(lowerKey) ||
        variables.tokens.has(`${lowerKey.replace(/[^a-z0-9]/g, '_')}_token`);

      if (!isAuthHeader && !['content-type', 'accept', 'user-agent'].includes(lowerKey)) {
        params.push({
          name: key,
          in: 'header',
          required: false,
          schema: {
            type: 'string'
          }
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
        type: 'string',
        example: body
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
      type: this.inferType(obj),
      example: obj
    };
  }

  private inferType(value: any): string {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value === null) return 'string';
    return 'string';
  }
}
