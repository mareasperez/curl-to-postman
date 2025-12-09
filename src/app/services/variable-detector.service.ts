import { Injectable } from '@angular/core';
import { ParsedRequest } from './curl-parser.service';

export interface VariableAnalysis {
  hosts: Map<string, number[]>;
  tokens: Map<string, TokenData>;
  environments: Map<string, EnvironmentData>;
}

export interface TokenData {
  header: string;
  value: string;
  requests: number[];
}

export interface EnvironmentData {
  name: string;
  isLocal: boolean;
  host: string;
  variables: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class VariableDetectorService {
  
  analyze(requests: ParsedRequest[]): VariableAnalysis {
    const hosts = new Map<string, number[]>();
    const tokens = new Map<string, TokenData>();
    const environments = new Map<string, EnvironmentData>();

    requests.forEach((request, index) => {
      try {
        const url = new URL(request.url);
        const host = url.origin;
        
        // Track hosts
        if (!hosts.has(host)) {
          hosts.set(host, []);
        }
        hosts.get(host)!.push(index);

        // Detect environment type
        const isLocal = url.hostname === 'localhost' || 
                       url.hostname === '127.0.0.1' || 
                       url.hostname.endsWith('.local');
        
        const envName = isLocal ? 'local' : url.hostname.replace(/\./g, '_');
        
        if (!environments.has(envName)) {
          environments.set(envName, {
            name: envName,
            isLocal: isLocal,
            host: host,
            variables: {}
          });
        }

        // Detect tokens
        Object.entries(request.headers).forEach(([key, value]) => {
          if (this.isAuthHeader(key, value)) {
            const tokenKey = `${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}_token`;
            if (!tokens.has(tokenKey)) {
              tokens.set(tokenKey, {
                header: key,
                value: value,
                requests: []
              });
            }
            tokens.get(tokenKey)!.requests.push(index);
          }
        });
      } catch (e) {
        console.error('Error parsing URL:', request.url, e);
      }
    });

    return { hosts, tokens, environments };
  }

  private isAuthHeader(key: string, value: string): boolean {
    const authHeaders = ['authorization', 'x-auth-token', 'x-api-key', 'api-key', 'token'];
    const lowerKey = key.toLowerCase();
    const hasAuthHeader = authHeaders.some(header => lowerKey.includes(header));
    const hasAuthValue = Boolean(value && (value.startsWith('Bearer ') || value.startsWith('Token ')));
    return hasAuthHeader || hasAuthValue;
  }

  getHostVariable(host: string): string {
    try {
      const url = new URL(host);
      return url.hostname.replace(/\./g, '_') + '_host';
    } catch {
      return 'host';
    }
  }
}
