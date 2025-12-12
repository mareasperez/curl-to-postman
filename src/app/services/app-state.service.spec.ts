import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AppStateService } from './app-state.service';

describe('AppStateService', () => {
    let service: AppStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AppStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Input State', () => {
        it('should initialize with empty curl input', () => {
            expect(service.curlInput()).toBe('');
        });

        it('should update curl input', () => {
            service.setCurlInput('curl https://api.example.com');
            expect(service.curlInput()).toBe('curl https://api.example.com');
        });

        it('should clear input and conversion', () => {
            service.setCurlInput('curl https://api.example.com');
            service.setConversionResult({ output: { test: 'data' } });

            service.clearInput();

            expect(service.curlInput()).toBe('');
            expect(service.conversionState().output).toBeNull();
        });
    });

    describe('Conversion State', () => {
        it('should initialize with empty conversion state', () => {
            const state = service.conversionState();
            expect(state.output).toBeNull();
            expect(state.additionalFiles).toEqual([]);
            expect(state.variables).toBeNull();
            expect(state.requests).toEqual([]);
            expect(state.generatedNames.size).toBe(0);
            expect(state.duplicateNames.size).toBe(0);
        });

        it('should update conversion result', () => {
            const output = { collection: 'test' };
            service.setConversionResult({ output });

            expect(service.conversionState().output).toEqual(output);
        });

        it('should clear conversion state', () => {
            service.setConversionResult({ output: { test: 'data' } });
            service.clearConversion();

            expect(service.conversionState().output).toBeNull();
            expect(service.uiState().showOutput).toBe(false);
        });
    });

    describe('UI State', () => {
        it('should initialize with default UI state', () => {
            const state = service.uiState();
            expect(state.currentTab).toBe('summary');
            expect(state.showOutput).toBe(false);
            expect(state.selectedFormatId).toBe('postman');
            expect(state.showFeaturesModal).toBe(false);
        });

        it('should update current tab', () => {
            service.setCurrentTab('collection');
            expect(service.uiState().currentTab).toBe('collection');
        });

        it('should update show output', () => {
            service.setShowOutput(true);
            expect(service.uiState().showOutput).toBe(true);
        });

        it('should update selected format', () => {
            service.setSelectedFormat('openapi');
            expect(service.uiState().selectedFormatId).toBe('openapi');
        });

        it('should toggle features modal', () => {
            expect(service.uiState().showFeaturesModal).toBe(false);
            service.toggleFeaturesModal();
            expect(service.uiState().showFeaturesModal).toBe(true);
            service.toggleFeaturesModal();
            expect(service.uiState().showFeaturesModal).toBe(false);
        });
    });

    describe('Editable State', () => {
        it('should initialize with empty editable state', () => {
            const state = service.editableState();
            expect(state.requestNames.size).toBe(0);
            expect(state.envNames.size).toBe(0);
        });

        it('should set request name', () => {
            service.setRequestName(0, 'custom_name');
            expect(service.editableState().requestNames.get(0)).toBe('custom_name');
        });

        it('should remove request name when empty', () => {
            service.setRequestName(0, 'custom_name');
            service.setRequestName(0, '');
            expect(service.editableState().requestNames.has(0)).toBe(false);
        });

        it('should set environment name', () => {
            service.setEnvName('prod', 'Production');
            expect(service.editableState().envNames.get('prod')).toBe('Production');
        });

        it('should initialize request names', () => {
            const names = new Map([[0, 'name1'], [1, 'name2']]);
            service.initializeRequestNames(names);

            expect(service.editableState().requestNames.size).toBe(2);
            expect(service.editableState().requestNames.get(0)).toBe('name1');
            expect(service.editableState().requestNames.get(1)).toBe('name2');
        });

        it('should clear editable state', () => {
            service.setRequestName(0, 'test');
            service.setEnvName('prod', 'Production');

            service.clearEditableState();

            expect(service.editableState().requestNames.size).toBe(0);
            expect(service.editableState().envNames.size).toBe(0);
        });
    });

    describe('Computed State', () => {
        it('should compute hasDuplicates', () => {
            expect(service.hasDuplicates()).toBe(false);

            const duplicates = new Map([['get_users', [0, 1]]]);
            service.setConversionResult({ duplicateNames: duplicates });

            expect(service.hasDuplicates()).toBe(true);
        });

        it('should compute duplicateCount', () => {
            expect(service.duplicateCount()).toBe(0);

            const duplicates = new Map([
                ['get_users', [0, 1]],
                ['post_users', [2, 3]]
            ]);
            service.setConversionResult({ duplicateNames: duplicates });

            expect(service.duplicateCount()).toBe(2);
        });

        it('should compute hasOutput', () => {
            expect(service.hasOutput()).toBe(false);

            service.setConversionResult({ output: { test: 'data' } });

            expect(service.hasOutput()).toBe(true);
        });

        it('should compute requestCount', () => {
            expect(service.requestCount()).toBe(0);

            const requests = [
                { method: 'GET', url: 'test', headers: {}, body: null },
                { method: 'POST', url: 'test2', headers: {}, body: null }
            ];
            service.setConversionResult({ requests });

            expect(service.requestCount()).toBe(2);
        });
    });
});
