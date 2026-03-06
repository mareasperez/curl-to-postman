import { Injectable } from '@angular/core';
import { ParsedRequest, VariableAnalysis, TokenData, EnvironmentData } from '@app/models';


@Injectable({
  providedIn: 'root'
})
export class VariableDetectorService {
  private buildHostVariableNames(hosts: Map<string, number[]>): Map<string, string> {
    const byHost = new Map<string, string>();

    Array.from(hosts.keys()).forEach(hostOrigin => {
      let base = 'host_default';
      try {
        const u = new URL(hostOrigin);
        base = `host_${u.host.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')}`;
      } catch {
        base = `host_${hostOrigin.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')}`;
      }
      byHost.set(hostOrigin, base);
    });

    return byHost;
  }

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
            protocol: url.protocol.replace(':', ''),
            host: url.host,
            variables: {},
            requestIndices: []
          });
        }
        environments.get(envName)!.requestIndices.push(index);

        // Detect tokens
        Object.entries(request.headers).forEach(([key, value]) => {
          if (this.isAuthHeader(key, value)) {
            const tokenKey = `${envName}_${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}_token`;
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

    const hostVariableNames = this.buildHostVariableNames(hosts);
    return { hosts, hostVariableNames, tokens, environments };
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
      const normalized = url.host.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      return `host_${normalized}`;
    } catch {
      return 'host_default';
    }
  }
}
