import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CurlParserService, ParsedRequest } from './curl-parser.service';

describe('CurlParserService', () => {
    let service: CurlParserService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CurlParserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('parse', () => {
        it('should parse simple GET request', () => {
            const curl = `curl 'https://api.example.com/users'`;
            const result = service.parse(curl);

            expect(result.method).toBe('GET');
            expect(result.url).toBe('https://api.example.com/users');
            expect(result.headers).toEqual({});
            expect(result.body).toBeNull();
        });

        it('should parse POST request with -X flag', () => {
            const curl = `curl -X POST 'https://api.example.com/users'`;
            const result = service.parse(curl);

            expect(result.method).toBe('POST');
            expect(result.url).toBe('https://api.example.com/users');
        });

        it('should parse request with --request flag', () => {
            const curl = `curl --request PUT 'https://api.example.com/users/123'`;
            const result = service.parse(curl);

            expect(result.method).toBe('PUT');
            expect(result.url).toBe('https://api.example.com/users/123');
        });

        it('should infer POST method when --data is present', () => {
            const curl = `curl 'https://api.example.com/users' --data '{"name":"John"}'`;
            const result = service.parse(curl);

            expect(result.method).toBe('POST');
        });

        it('should parse headers', () => {
            const curl = `curl 'https://api.example.com/users' -H 'Authorization: Bearer token123' -H 'Content-Type: application/json'`;
            const result = service.parse(curl);

            expect(result.headers['Authorization']).toBe('Bearer token123');
            expect(result.headers['Content-Type']).toBe('application/json');
        });

        it('should parse body with --data flag', () => {
            const curl = `curl 'https://api.example.com/users' --data '{"name":"John"}'`;
            const result = service.parse(curl);

            expect(result.body).toBe('{"name":"John"}');
        });

        it('should parse body with --data-raw flag', () => {
            const curl = `curl 'https://api.example.com/users' --data-raw '{"name":"John"}'`;
            const result = service.parse(curl);

            expect(result.body).toBe('{"name":"John"}');
        });

        it('should parse body with -d flag', () => {
            const curl = `curl 'https://api.example.com/users' -d 'name=John&age=30'`;
            const result = service.parse(curl);

            expect(result.body).toBe('name=John&age=30');
        });

        it('should parse multiline curl command', () => {
            const curl = `curl 'https://api.example.com/users' \\
        -H 'Authorization: Bearer token123' \\
        -H 'Content-Type: application/json' \\
        --data '{"name":"John"}'`;
            const result = service.parse(curl);

            expect(result.url).toBe('https://api.example.com/users');
            expect(result.headers['Authorization']).toBe('Bearer token123');
            expect(result.body).toBe('{"name":"John"}');
        });

        it('should parse URL without quotes', () => {
            const curl = `curl https://api.example.com/users`;
            const result = service.parse(curl);

            expect(result.url).toBe('https://api.example.com/users');
        });

        it('should parse URL with double quotes', () => {
            const curl = `curl "https://api.example.com/users"`;
            const result = service.parse(curl);

            expect(result.url).toBe('https://api.example.com/users');
        });

        it('should handle complex URL with query parameters', () => {
            const curl = `curl 'https://api.example.com/search?q=test&page=1&limit=10'`;
            const result = service.parse(curl);

            expect(result.url).toBe('https://api.example.com/search?q=test&page=1&limit=10');
        });

        it('should handle URL with encoded characters', () => {
            const curl = `curl 'https://api.example.com/search?q=hello%20world'`;
            const result = service.parse(curl);

            expect(result.url).toBe('https://api.example.com/search?q=hello%20world');
        });

        it('should parse headers with colons in value', () => {
            const curl = `curl 'https://api.example.com/users' -H 'Authorization: Bearer: token:123'`;
            const result = service.parse(curl);

            expect(result.headers['Authorization']).toBe('Bearer: token:123');
        });
    });

    describe('parseMultiple', () => {
        it('should parse multiple curl commands', () => {
            const input = `curl 'https://api.example.com/users'
curl 'https://api.example.com/posts'
curl 'https://api.example.com/comments'`;

            const results = service.parseMultiple(input);

            expect(results.length).toBe(3);
            expect(results[0].url).toBe('https://api.example.com/users');
            expect(results[1].url).toBe('https://api.example.com/posts');
            expect(results[2].url).toBe('https://api.example.com/comments');
        });

        it('should parse multiple curl commands with different methods', () => {
            const input = `curl 'https://api.example.com/users'
curl -X POST 'https://api.example.com/users' --data '{"name":"John"}'
curl -X DELETE 'https://api.example.com/users/123'`;

            const results = service.parseMultiple(input);

            expect(results.length).toBe(3);
            expect(results[0].method).toBe('GET');
            expect(results[1].method).toBe('POST');
            expect(results[2].method).toBe('DELETE');
        });

        it('should ignore non-curl lines', () => {
            const input = `Some random text
curl 'https://api.example.com/users'
More random text
curl 'https://api.example.com/posts'`;

            const results = service.parseMultiple(input);

            expect(results.length).toBe(2);
            expect(results[0].url).toBe('https://api.example.com/users');
            expect(results[1].url).toBe('https://api.example.com/posts');
        });

        it('should handle empty input', () => {
            const input = '';
            const results = service.parseMultiple(input);

            expect(results.length).toBe(0);
        });

        it('should handle multiline curl commands in multiple commands', () => {
            const input = `curl 'https://api.example.com/users' \\
  -H 'Authorization: Bearer token1'

curl 'https://api.example.com/posts' \\
  -H 'Authorization: Bearer token2'`;

            const results = service.parseMultiple(input);

            expect(results.length).toBe(2);
            expect(results[0].headers['Authorization']).toBe('Bearer token1');
            expect(results[1].headers['Authorization']).toBe('Bearer token2');
        });
    });
});
