import { Injectable } from '@angular/core';
import { ParsedRequest } from '../models';


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

    // Extract URL - look for URL after curl command, skipping flags
    let urlMatch = fullCommand.match(/curl\s+(?:(?:-[A-Z]|--\w+)\s+\S+\s+)*['"]([^'"]+)['"]/);
    if (!urlMatch) {
      urlMatch = fullCommand.match(/curl\s+(?:(?:-[A-Z]|--\w+)\s+\S+\s+)*(https?:\/\/[^\s'"]+)/);
    }
    if (!urlMatch) {
      // Fallback: look for anything that looks like a URL
      urlMatch = fullCommand.match(/(https?:\/\/[^\s'"]+)/);
    }
    if (urlMatch) {
      request.url = urlMatch[1];
    }

    // Extract method - support both -X and --request
    let methodMatch = fullCommand.match(/(?:-X|--request)\s+(\w+)/);
    if (methodMatch) {
      request.method = methodMatch[1].toUpperCase();
    } else {
      // Infer method from --data presence
      if (fullCommand.includes('--data') || fullCommand.includes('-d ')) {
        request.method = 'POST';
      }
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

    // Extract body data - handle both single and double quotes
    // Match content within quotes, allowing escaped quotes inside
    let dataMatch = fullCommand.match(/(?:--data-raw|--data|-d)\s+'([^']*)'/) ||
      fullCommand.match(/(?:--data-raw|--data|-d)\s+"([^"]*)"/);
    if (!dataMatch) {
      // Try without quotes
      dataMatch = fullCommand.match(/(?:--data-raw|--data|-d)\s+(\S+)/);
    }
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
