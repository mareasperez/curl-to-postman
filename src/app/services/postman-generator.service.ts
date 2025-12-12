import { Injectable } from '@angular/core';
import { ParsedRequest } from './curl-parser.service';
import { VariableAnalysis } from './variable-detector.service';

export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
  };
  item: PostmanItem[];
  variable: PostmanVariable[];
}

export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: PostmanHeader[];
    url: {
      raw: string;
      protocol: string;
      host: string[];
      path: string[];
    };
    body?: {
      mode: string;
      raw: string;
      options?: {
        raw: {
          language: string;
        };
      };
    };
  };
}

export interface PostmanHeader {
  key: string;
  value: string;
  type: string;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type: string;
}

export interface PostmanEnvironment {
  name: string;
  values: {
    key: string;
    value: string;
    type: string;
    enabled: boolean;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PostmanGeneratorService {

  generate(
    requests: ParsedRequest[],
    variables: VariableAnalysis,
    getHostVariable: (host: string) => string,
    customNames?: Map<number, string>
  ): PostmanCollection {
    const collection: PostmanCollection = {
      info: {
        name: "Converted from cURL",
        description: "Auto-generated collection from cURL commands",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [],
      variable: []
    };

    // Add collection-level variables for hosts
    variables.hosts.forEach((requestIndices, host) => {
      if (requestIndices.length > 1) {
        const varName = getHostVariable(host);
        collection.variable.push({
          key: varName,
          value: host,
          type: "string"
        });
      }
    });

    // Generate requests
    requests.forEach((request, index) => {
      const item = this.createPostmanItem(request, index, variables, getHostVariable, customNames);
      collection.item.push(item);
    });

    return collection;
  }

  private createPostmanItem(
    request: ParsedRequest,
    index: number,
    variables: VariableAnalysis,
    getHostVariable: (host: string) => string,
    customNames?: Map<number, string>
  ): PostmanItem {
    let url = request.url;
    let protocol = 'https';
    let useVariable = false;

    // Replace host with variable if applicable
    try {
      const urlObj = new URL(request.url);
      protocol = urlObj.protocol.replace(':', '');
      const host = urlObj.origin;

      variables.hosts.forEach((requestIndices, hostValue) => {
        if (hostValue === host && requestIndices.length > 1) {
          const varName = getHostVariable(host);
          useVariable = true;
          // Replace the entire origin (protocol + host) with just the variable
          // This creates: {{varName}}/path instead of https://{{varName}}/path
          url = `{{${varName}}}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        }
      });
    } catch (e) {
      console.error('Error processing URL:', e);
      // Try to extract protocol from URL string if parsing failed
      const protocolMatch = request.url.match(/^(https?):\/\//);
      if (protocolMatch) {
        protocol = protocolMatch[1];
      }
    }

    const requestName = customNames?.get(index) || this.generateRequestName(request, index);

    const item: PostmanItem = {
      name: requestName,
      request: {
        method: request.method,
        header: [],
        url: {
          raw: url,
          protocol: protocol,
          host: this.parseHost(url),
          path: this.parsePath(url)
        }
      }
    };

    // Add headers with variable replacement
    Object.entries(request.headers).forEach(([key, value]) => {
      let headerValue = value;

      // Replace token with variable if applicable
      variables.tokens.forEach((tokenData, tokenKey) => {
        if (tokenData.value === value && tokenData.requests.length > 1) {
          headerValue = `{{${tokenKey}}}`;
        }
      });

      item.request.header.push({
        key: key,
        value: headerValue,
        type: "text"
      });
    });

    // Add body if present
    if (request.body) {
      item.request.body = {
        mode: "raw",
        raw: request.body,
        options: {
          raw: {
            language: "json"
          }
        }
      };
    }

    return item;
  }

  private generateRequestName(request: ParsedRequest, index: number): string {
    try {
      // Extract path from URL, handling both regular URLs and those with variables
      let pathname = '';
      try {
        const urlObj = new URL(request.url);
        pathname = urlObj.pathname;
      } catch {
        // If URL parsing fails (e.g., contains {{variables}}), extract path manually
        // First try to match path after variable placeholder like {{host}}/path
        const varPathMatch = request.url.match(/}}\s*(\/[^?#]*)/);
        if (varPathMatch) {
          pathname = varPathMatch[1];
        } else {
          // Fallback: try to match path after //host/
          const pathMatch = request.url.match(/\/\/[^\/]+(\/[^?#]*)/);
          pathname = pathMatch ? pathMatch[1] : '';
        }
      }

      const pathSegments = pathname.split('/').filter(p => p);

      // If we couldn't extract any path, throw error to use fallback
      if (!pathname && !request.url.startsWith('http')) {
        throw new Error('Invalid URL');
      }

      // Get the last meaningful segment or use a default
      let endpoint = pathSegments.length > 0
        ? pathSegments[pathSegments.length - 1]
        : 'root';

      // Remove common file extensions and query parameters
      endpoint = endpoint.replace(/\.(json|xml|html)$/i, '');

      // Clean up the endpoint name
      endpoint = endpoint
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      // If endpoint is a number or UUID, use the parent segment
      if (/^[0-9a-f-]+$/i.test(endpoint) && pathSegments.length > 1) {
        const parentSegment = pathSegments[pathSegments.length - 2];
        endpoint = parentSegment.replace(/[^a-zA-Z0-9_-]/g, '_');
      }

      // Combine method with endpoint
      const method = request.method.toLowerCase();
      return endpoint ? `${method}_${endpoint}` : `${method}_request_${index + 1}`;
    } catch (e) {
      return `${request.method.toLowerCase()}_request_${index + 1}`;
    }
  }

  private parseHost(url: string): string[] {
    try {
      if (url.includes('{{')) {
        const match = url.match(/\{\{([^}]+)\}\}/);
        if (match) {
          return [match[0]];
        }
      }
      const urlObj = new URL(url);
      return urlObj.hostname.split('.');
    } catch (e) {
      return ['localhost'];
    }
  }

  private parsePath(url: string): string[] {
    try {
      // Try standard URL parsing first
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').filter(p => p);
    } catch (e) {
      // If URL contains variables like {{api}}, extract path manually
      // Match everything after }}/ or after host/
      const pathMatch = url.match(/(?:}}|\/\/[^\/]+)(\/[^?#]*)/);
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1].split('/').filter(p => p);
      }
      return [];
    }
  }

  generateEnvironments(
    variables: VariableAnalysis,
    getHostVariable: (host: string) => string,
    customEnvNames?: Map<string, string>
  ): PostmanEnvironment[] {
    const environments: PostmanEnvironment[] = [];

    variables.environments.forEach((env, envName) => {
      const finalEnvName = customEnvNames?.get(envName) || envName;

      const environment: PostmanEnvironment = {
        name: finalEnvName,
        values: []
      };

      // Add protocol variable
      const protocolVarName = `${envName}_protocol`;
      environment.values.push({
        key: protocolVarName,
        value: env.protocol,
        type: "default",
        enabled: true
      });

      // Add host variable
      const hostVarName = getHostVariable(env.host);
      environment.values.push({
        key: hostVarName,
        value: env.host,
        type: "default",
        enabled: true
      });

      // Add token variables for this environment
      variables.tokens.forEach((tokenData, tokenKey) => {
        environment.values.push({
          key: tokenKey,
          value: tokenData.value,
          type: "secret",
          enabled: true
        });
      });

      environments.push(environment);
    });

    return environments;
  }
}
