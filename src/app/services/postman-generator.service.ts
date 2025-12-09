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
  
  generate(requests: ParsedRequest[], variables: VariableAnalysis, getHostVariable: (host: string) => string): PostmanCollection {
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
      const item = this.createPostmanItem(request, index, variables, getHostVariable);
      collection.item.push(item);
    });

    return collection;
  }

  private createPostmanItem(
    request: ParsedRequest, 
    index: number, 
    variables: VariableAnalysis,
    getHostVariable: (host: string) => string
  ): PostmanItem {
    let url = request.url;
    
    // Replace host with variable if applicable
    try {
      const urlObj = new URL(request.url);
      const host = urlObj.origin;
      
      variables.hosts.forEach((requestIndices, hostValue) => {
        if (hostValue === host && requestIndices.length > 1) {
          const varName = getHostVariable(host);
          url = request.url.replace(host, `{{${varName}}}`);
        }
      });
    } catch (e) {
      console.error('Error processing URL:', e);
    }

    const item: PostmanItem = {
      name: `Request ${index + 1}`,
      request: {
        method: request.method,
        header: [],
        url: {
          raw: url,
          protocol: url.startsWith('https') ? 'https' : 'http',
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
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').filter(p => p);
    } catch (e) {
      return [];
    }
  }

  generateEnvironments(variables: VariableAnalysis, getHostVariable: (host: string) => string): PostmanEnvironment[] {
    const environments: PostmanEnvironment[] = [];

    variables.environments.forEach((env, envName) => {
      const environment: PostmanEnvironment = {
        name: envName,
        values: []
      };

      // Add host variable
      const hostVarName = getHostVariable(env.host);
      environment.values.push({
        key: hostVarName,
        value: env.host,
        type: "default",
        enabled: true
      });

      // Add token variables
      variables.tokens.forEach((tokenData, tokenKey) => {
        if (tokenData.requests.length > 1) {
          environment.values.push({
            key: tokenKey,
            value: tokenData.value,
            type: "secret",
            enabled: true
          });
        }
      });

      environments.push(environment);
    });

    return environments;
  }
}
