import { Injectable } from '@angular/core';

export interface ParsedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CurlParserService {
  
  parse(curlCommand: string): ParsedRequest {
    const lines = curlCommand.trim().split('\n').map(line => line.trim());
    const fullCommand = lines.join(' ').replace(/\\\s+/g, ' ');
    
    const request: ParsedRequest = {
      method: 'GET',
      url: '',
      headers: {},
      body: null
    };

    // Extract URL
    const urlMatch = fullCommand.match(/curl\s+['"]?([^'"\s]+)['"]?/);
    if (urlMatch) {
      request.url = urlMatch[1];
    }

    // Extract method
    const methodMatch = fullCommand.match(/-X\s+(\w+)/);
    if (methodMatch) {
      request.method = methodMatch[1];
    }

    // Extract headers
    const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(fullCommand)) !== null) {
      const headerLine = headerMatch[1];
      const colonIndex = headerLine.indexOf(':');
      if (colonIndex > 0) {
        const key = headerLine.substring(0, colonIndex).trim();
        const value = headerLine.substring(colonIndex + 1).trim();
        request.headers[key] = value;
      }
    }

    // Extract body data
    const dataMatch = fullCommand.match(/--data(?:-raw)?\s+['"](.+?)['"]/);
    if (dataMatch) {
      request.body = dataMatch[1];
    }

    return request;
  }

  parseMultiple(input: string): ParsedRequest[] {
    const curlCommands = input.split(/(?=curl\s+)/g).filter(cmd => cmd.trim().startsWith('curl'));
    return curlCommands.map(cmd => this.parse(cmd));
  }
}
