import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PostmanGeneratorService } from './postman-generator.service';
import { VariableAnalysis, ParsedRequest } from '../models';

describe('PostmanGeneratorService', () => {
    let service: PostmanGeneratorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PostmanGeneratorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('parsePath', () => {
        it('should extract path from regular URL', () => {
            const url = 'https://api.example.com/users/123/profile';
            const result = (service as any).parsePath(url);
            expect(result).toEqual(['users', '123', 'profile']);
        });

        it('should extract path from URL with variable placeholder', () => {
            const url = '{{api_host}}/users/123/profile';
            const result = (service as any).parsePath(url);
            expect(result).toEqual(['users', '123', 'profile']);
        });

        it('should extract complex path from URL with variable', () => {
            const url = '{{auth_example_com_host}}/example.onmicrosoft.com/B2C_1A_SignUp_SignIn/api/CombinedSigninAndSignup/confirmed';
            const result = (service as any).parsePath(url);
            expect(result).toEqual([
                'example.onmicrosoft.com',
                'B2C_1A_SignUp_SignIn',
                'api',
                'CombinedSigninAndSignup',
                'confirmed'
            ]);
        });

        it('should handle URL with query parameters', () => {
            const url = '{{api_host}}/users/123?page=1&limit=10';
            const result = (service as any).parsePath(url);
            expect(result).toEqual(['users', '123']);
        });

        it('should handle URL with hash', () => {
            const url = '{{api_host}}/users/123#section';
            const result = (service as any).parsePath(url);
            expect(result).toEqual(['users', '123']);
        });

        it('should return empty array for root path', () => {
            const url = 'https://api.example.com/';
            const result = (service as any).parsePath(url);
            expect(result).toEqual([]);
        });

        it('should handle URL with single path segment', () => {
            const url = '{{api_host}}/en/';
            const result = (service as any).parsePath(url);
            expect(result).toEqual(['en']);
        });
    });

    describe('parseHost', () => {
        it('should extract host from regular URL', () => {
            const url = 'https://api.example.com/users';
            const result = (service as any).parseHost(url);
            expect(result).toEqual(['api', 'example', 'com']);
        });

        it('should return variable placeholder for URL with variable', () => {
            const url = '{{api_host}}/users';
            const result = (service as any).parseHost(url);
            expect(result).toEqual(['{{api_host}}']);
        });

        it('should handle complex variable names', () => {
            const url = '{{qa-app_example_com_host}}/en/';
            const result = (service as any).parseHost(url);
            expect(result).toEqual(['{{qa-app_example_com_host}}']);
        });
    });

    describe('generateRequestName', () => {
        it('should generate name from last path segment', () => {
            const request: ParsedRequest = {
                method: 'GET',
                url: 'https://api.example.com/users/profile',
                headers: {},
                body: null
            };
            const result = (service as any).generateRequestName(request, 0);
            expect(result).toBe('get_profile');
        });

        it('should generate name from URL with variable', () => {
            const request: ParsedRequest = {
                method: 'POST',
                url: '{{api_host}}/users/create',
                headers: {},
                body: null
            };
            const result = (service as any).generateRequestName(request, 0);
            expect(result).toBe('post_create');
        });

        it('should use parent segment when last segment is UUID', () => {
            const request: ParsedRequest = {
                method: 'GET',
                url: 'https://api.example.com/users/123e4567-e89b-12d3-a456-426614174000',
                headers: {},
                body: null
            };
            const result = (service as any).generateRequestName(request, 0);
            expect(result).toBe('get_users');
        });

        it('should use parent segment when last segment is numeric ID', () => {
            const request: ParsedRequest = {
                method: 'GET',
                url: '{{api_host}}/products/12345',
                headers: {},
                body: null
            };
            const result = (service as any).generateRequestName(request, 1);
            expect(result).toBe('get_products');
        });

        it('should clean up special characters in endpoint name', () => {
            const request: ParsedRequest = {
                method: 'GET',
                url: 'https://api.example.com/user-profile.json',
                headers: {},
                body: null
            };
            const result = (service as any).generateRequestName(request, 0);
            expect(result).toBe('get_user-profile');
        });

        it('should handle root path', () => {
            const request: ParsedRequest = {
                method: 'GET',
                url: 'https://api.example.com/',
                headers: {},
                body: null
            };
            const result = (service as any).generateRequestName(request, 0);
            expect(result).toBe('get_root');
        });

        it('should fallback to generic name on error', () => {
            const request: ParsedRequest = {
                method: 'POST',
                url: 'invalid-url',
                headers: {},
                body: null
            };
            const result = (service as any).generateRequestName(request, 5);
            expect(result).toBe('post_request_6');
        });
    });

    describe('generate', () => {
        it('should generate Postman collection with correct structure', () => {
            const requests: ParsedRequest[] = [
                {
                    method: 'GET',
                    url: 'https://api.example.com/users',
                    headers: { 'Authorization': 'Bearer token123' },
                    body: null
                }
            ];

            const variables: VariableAnalysis = {
                hosts: new Map([['https://api.example.com', [0]]]),
                tokens: new Map([
                    ['authorization_token', {
                        header: 'Authorization',
                        value: 'Bearer token123',
                        requests: [0]
                    }]
                ]),
                environments: new Map([
                    ['api_example_com', {
                        name: 'api_example_com',
                        isLocal: false,
                        protocol: 'https',
                        host: 'api.example.com',
                        variables: {}
                    }]
                ])
            };

            const getHostVariable = (host: string) => 'api_example_com_host';

            const result = service.generate(requests, variables, getHostVariable);

            expect(result.info.name).toBe('Converted from cURL');
            expect(result.info.schema).toBe('https://schema.getpostman.com/json/collection/v2.1.0/collection.json');
            expect(result.item.length).toBe(1);
            expect(result.item[0].name).toBe('get_users');
            expect(result.item[0].request.method).toBe('GET');
            expect(result.item[0].request.url.protocol).toBe('https');
            expect(result.item[0].request.url.path).toEqual(['users']);
        });

        it('should replace host with variable when used multiple times', () => {
            const requests: ParsedRequest[] = [
                {
                    method: 'GET',
                    url: 'https://api.example.com/users',
                    headers: {},
                    body: null
                },
                {
                    method: 'GET',
                    url: 'https://api.example.com/posts',
                    headers: {},
                    body: null
                }
            ];

            const variables: VariableAnalysis = {
                hosts: new Map([['https://api.example.com', [0, 1]]]),
                tokens: new Map(),
                environments: new Map()
            };

            const getHostVariable = (host: string) => 'api_host';

            const result = service.generate(requests, variables, getHostVariable);

            expect(result.item[0].request.url.raw).toBe('{{api_host}}/users');
            expect(result.item[1].request.url.raw).toBe('{{api_host}}/posts');
            expect(result.variable.length).toBe(1);
            expect(result.variable[0].key).toBe('api_host');
            expect(result.variable[0].value).toBe('https://api.example.com');
        });

        it('should preserve query parameters and hash in URL', () => {
            const requests: ParsedRequest[] = [
                {
                    method: 'GET',
                    url: 'https://api.example.com/search?q=test&page=1#results',
                    headers: {},
                    body: null
                }
            ];

            const variables: VariableAnalysis = {
                hosts: new Map([['https://api.example.com', [0]]]),
                tokens: new Map(),
                environments: new Map()
            };

            const getHostVariable = (host: string) => 'api_host';

            const result = service.generate(requests, variables, getHostVariable);

            expect(result.item[0].request.url.raw).toContain('?q=test&page=1');
            expect(result.item[0].request.url.raw).toContain('#results');
        });
    });
});
