import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ConversionService } from './conversion.service';
import { CurlParserService } from './curl-parser.service';
import { VariableDetectorService } from './variable-detector.service';
import { ExportProviderService } from './providers/export-provider.service';

describe('ConversionService', () => {
    let service: ConversionService;
    let curlParserMock: any;
    let variableDetectorMock: any;
    let exportProviderMock: any;

    beforeEach(() => {
        curlParserMock = {
            parseMultiple: vi.fn()
        };

        variableDetectorMock = {
            analyze: vi.fn(),
            getHostVariable: vi.fn()
        };

        exportProviderMock = {
            export: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                ConversionService,
                { provide: CurlParserService, useValue: curlParserMock },
                { provide: VariableDetectorService, useValue: variableDetectorMock },
                { provide: ExportProviderService, useValue: exportProviderMock }
            ]
        });

        service = TestBed.inject(ConversionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('convert', () => {
        it('should return error when input is empty', () => {
            const request = {
                input: '',
                formatId: 'postman'
            };

            const result = service.convert(request);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Please enter at least one cURL command');
        });

        it('should return error when input is only whitespace', () => {
            const request = {
                input: '   \n  \t  ',
                formatId: 'postman'
            };

            const result = service.convert(request);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Please enter at least one cURL command');
        });

        it('should return error when no valid cURL commands detected', () => {
            const request = {
                input: 'some random text',
                formatId: 'postman'
            };

            curlParserMock.parseMultiple.mockReturnValue([]);

            const result = service.convert(request);

            expect(result.success).toBe(false);
            expect(result.error).toBe('No valid cURL commands detected');
        });

        it('should return error when export format not found', () => {
            const request = {
                input: `curl 'https://api.example.com/users'`,
                formatId: 'invalid-format'
            };

            const parsedRequests = [{
                method: 'GET',
                url: 'https://api.example.com/users',
                headers: {},
                body: null
            }];

            curlParserMock.parseMultiple.mockReturnValue(parsedRequests);
            variableDetectorMock.analyze.mockReturnValue({
                hosts: new Map(),
                tokens: new Map(),
                environments: new Map()
            });
            exportProviderMock.export.mockReturnValue(null);

            const result = service.convert(request);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Export failed: format not found');
        });

        it('should successfully convert valid cURL command', () => {
            const request = {
                input: `curl 'https://api.example.com/users'`,
                formatId: 'postman'
            };

            const parsedRequests = [{
                method: 'GET',
                url: 'https://api.example.com/users',
                headers: {},
                body: null
            }];

            const variables = {
                hosts: new Map([['https://api.example.com', [0]]]),
                tokens: new Map(),
                environments: new Map()
            };

            const exportResult = {
                data: { info: { name: 'Test Collection' }, item: [] },
                metadata: { id: 'postman', name: 'Postman', version: '2.1.0', extension: 'json', mimeType: 'application/json', description: '' },
                additionalFiles: []
            };

            curlParserMock.parseMultiple.mockReturnValue(parsedRequests);
            variableDetectorMock.analyze.mockReturnValue(variables);
            variableDetectorMock.getHostVariable.mockReturnValue('api_host');
            exportProviderMock.export.mockReturnValue(exportResult);

            const result = service.convert(request);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(exportResult.data);
            expect(result.variables).toEqual(variables);
            expect(result.requests).toEqual(parsedRequests);
            expect(result.additionalFiles).toEqual([]);
        });

        it('should pass custom request names to export provider', () => {
            const customNames = new Map([[0, 'Custom Request Name']]);
            const request = {
                input: `curl 'https://api.example.com/users'`,
                formatId: 'postman',
                customRequestNames: customNames
            };

            const parsedRequests = [{
                method: 'GET',
                url: 'https://api.example.com/users',
                headers: {},
                body: null
            }];

            curlParserMock.parseMultiple.mockReturnValue(parsedRequests);
            variableDetectorMock.analyze.mockReturnValue({
                hosts: new Map(),
                tokens: new Map(),
                environments: new Map()
            });
            exportProviderMock.export.mockReturnValue({
                data: {},
                metadata: { id: 'postman', name: 'Postman', version: '2.1.0', extension: 'json', mimeType: 'application/json', description: '' }
            });

            service.convert(request);

            expect(exportProviderMock.export).toHaveBeenCalledWith(
                'postman',
                expect.objectContaining({
                    customRequestNames: customNames
                })
            );
        });

        it('should pass custom environment names to export provider', () => {
            const customEnvNames = new Map([['prod', 'Production']]);
            const request = {
                input: `curl 'https://api.example.com/users'`,
                formatId: 'postman',
                customEnvNames: customEnvNames
            };

            const parsedRequests = [{
                method: 'GET',
                url: 'https://api.example.com/users',
                headers: {},
                body: null
            }];

            curlParserMock.parseMultiple.mockReturnValue(parsedRequests);
            variableDetectorMock.analyze.mockReturnValue({
                hosts: new Map(),
                tokens: new Map(),
                environments: new Map()
            });
            exportProviderMock.export.mockReturnValue({
                data: {},
                metadata: { id: 'postman', name: 'Postman', version: '2.1.0', extension: 'json', mimeType: 'application/json', description: '' }
            });

            service.convert(request);

            expect(exportProviderMock.export).toHaveBeenCalledWith(
                'postman',
                expect.objectContaining({
                    customEnvNames: customEnvNames
                })
            );
        });

        it('should handle conversion errors gracefully', () => {
            const request = {
                input: `curl 'https://api.example.com/users'`,
                formatId: 'postman'
            };

            curlParserMock.parseMultiple.mockImplementation(() => {
                throw new Error('Parse error');
            });

            const result = service.convert(request);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Parse error');
        });

        it('should include additional files in result', () => {
            const request = {
                input: `curl 'https://api.example.com/users'`,
                formatId: 'postman'
            };

            const parsedRequests = [{
                method: 'GET',
                url: 'https://api.example.com/users',
                headers: {},
                body: null
            }];

            const additionalFiles = [
                { name: 'environment.json', data: {}, mimeType: 'application/json' }
            ];

            curlParserMock.parseMultiple.mockReturnValue(parsedRequests);
            variableDetectorMock.analyze.mockReturnValue({
                hosts: new Map(),
                tokens: new Map(),
                environments: new Map()
            });
            exportProviderMock.export.mockReturnValue({
                data: {},
                metadata: { id: 'postman', name: 'Postman', version: '2.1.0', extension: 'json', mimeType: 'application/json', description: '' },
                additionalFiles
            });

            const result = service.convert(request);

            expect(result.success).toBe(true);
            expect(result.additionalFiles).toEqual(additionalFiles);
        });
    });
});
