import { Injectable, signal, computed } from '@angular/core';
import type { ConversionState, UIState, EditableState, ParsedRequest } from '../models';

/**
 * Centralized state management service using Angular signals
 * Follows the guidelines in CODING_GUIDELINES.md
 */
@Injectable({
    providedIn: 'root'
})
export class AppStateService {
    // ==================== INPUT STATE ====================

    private _curlInput = signal('');
    readonly curlInput = this._curlInput.asReadonly();

    // ==================== CONVERSION STATE ====================

    private _conversionState = signal<ConversionState>({
        output: null,
        additionalFiles: [],
        variables: null,
        requests: [],
        generatedNames: new Map(),
        duplicateNames: new Map(),
        originalRequests: []
    });
    readonly conversionState = this._conversionState.asReadonly();

    // ==================== UI STATE ====================

    private _uiState = signal<UIState>({
        currentTab: 'summary',
        showOutput: false,
        selectedFormatId: 'postman',
        showFeaturesModal: false
    });
    readonly uiState = this._uiState.asReadonly();

    // ==================== EDITABLE STATE ====================

    private _editableState = signal<EditableState>({
        requestNames: new Map(),
        envNames: new Map()
    });
    readonly editableState = this._editableState.asReadonly();

    // ==================== COMPUTED STATE ====================

    /** Whether there are duplicate request names */
    readonly hasDuplicates = computed(() =>
        this.conversionState().duplicateNames.size > 0
    );

    /** Number of duplicate request names */
    readonly duplicateCount = computed(() =>
        this.conversionState().duplicateNames.size
    );

    /** Whether conversion output exists */
    readonly hasOutput = computed(() =>
        this.conversionState().output !== null
    );

    /** Number of parsed requests */
    readonly requestCount = computed(() =>
        this.conversionState().requests.length
    );

    /** Whether there are modified requests compared to original */
    /** Whether there are modified requests compared to original */
    readonly hasModifiedRequests = computed(() => {
        const state = this.conversionState();
        if (!state.originalRequests || state.originalRequests.length === 0) return false;

        // Compare lengths first
        if (state.requests.length !== state.originalRequests.length) return true;

        // detailed comparison
        for (let i = 0; i < state.requests.length; i++) {
            const req1 = state.requests[i];
            const req2 = state.originalRequests[i];

            if (req1.method !== req2.method) return true;
            if (req1.url !== req2.url) return true;
            if ((req1.body || '') !== (req2.body || '')) return true;

            // Header comparison
            const h1 = req1.headers || {};
            const h2 = req2.headers || {};

            const k1 = Object.keys(h1).filter(k => !!k.trim() && !!h1[k]);
            const k2 = Object.keys(h2).filter(k => !!k.trim() && !!h2[k]);

            if (k1.length !== k2.length) return true;

            for (const k of k1) {
                if (h1[k] !== h2[k]) return true;
            }
        }

        return false;
    });

    // ==================== ACTIONS - INPUT ====================

    setCurlInput(input: string): void {
        this._curlInput.set(input);
    }

    clearInput(): void {
        this._curlInput.set('');
        this.clearConversion();
    }

    // ==================== ACTIONS - CONVERSION ====================

    setConversionResult(result: Partial<ConversionState>, isNewConversion: boolean = false): void {
        this._conversionState.update(state => {
            const newState = {
                ...state,
                ...result
            };

            // Only set original requests if this is a new conversion
            if (isNewConversion && result.requests) {
                newState.originalRequests = JSON.parse(JSON.stringify(result.requests));
            }

            return newState;
        });
    }

    clearConversion(): void {
        this._conversionState.set({
            output: null,
            additionalFiles: [],
            variables: null,
            requests: [],
            generatedNames: new Map(),
            duplicateNames: new Map(),
            originalRequests: []
        });
        this._uiState.update(state => ({ ...state, showOutput: false }));
    }

    updateRequest(index: number, request: ParsedRequest): void {
        this._conversionState.update(state => {
            const requests = [...state.requests];
            requests[index] = request;
            return { ...state, requests };
        });
    }

    resetRequest(index: number): void {
        this._conversionState.update(state => {
            if (!state.originalRequests || !state.originalRequests[index]) return state;

            const requests = [...state.requests];
            requests[index] = JSON.parse(JSON.stringify(state.originalRequests[index]));
            return { ...state, requests };
        });
    }

    resetAllRequests(): void {
        console.log('[AppState] resetAllRequests called');
        console.log('[AppState] Current requests:', this._conversionState().requests);
        console.log('[AppState] Original requests:', this._conversionState().originalRequests);

        this._conversionState.update(state => {
            if (!state.originalRequests) {
                console.log('[AppState] No original requests found, returning unchanged state');
                return state;
            }
            const resetRequests = JSON.parse(JSON.stringify(state.originalRequests));
            console.log('[AppState] Resetting to:', resetRequests);
            return {
                ...state,
                requests: resetRequests
            };
        });
        this.clearEditableState();
        console.log('[AppState] After reset:', this._conversionState().requests);
    }

    // ==================== ACTIONS - UI ====================

    setCurrentTab(tab: UIState['currentTab']): void {
        this._uiState.update(state => ({ ...state, currentTab: tab }));
    }

    setShowOutput(show: boolean): void {
        this._uiState.update(state => ({ ...state, showOutput: show }));
    }

    setSelectedFormat(formatId: string): void {
        this._uiState.update(state => ({ ...state, selectedFormatId: formatId }));
    }

    toggleFeaturesModal(): void {
        this._uiState.update(state => ({
            ...state,
            showFeaturesModal: !state.showFeaturesModal
        }));
    }

    // ==================== ACTIONS - EDITABLE ====================

    setRequestName(index: number, name: string): void {
        this._editableState.update(state => {
            const newNames = new Map(state.requestNames);
            if (name.trim()) {
                newNames.set(index, name);
            } else {
                newNames.delete(index);
            }
            return { ...state, requestNames: newNames };
        });
    }

    setEnvName(oldName: string, newName: string): void {
        this._editableState.update(state => {
            const newNames = new Map(state.envNames);
            newNames.set(oldName, newName);
            return { ...state, envNames: newNames };
        });
    }

    initializeRequestNames(names: Map<number, string>): void {
        this._editableState.update(state => ({
            ...state,
            requestNames: new Map(names)
        }));
    }

    clearEditableState(): void {
        this._editableState.set({
            requestNames: new Map(),
            envNames: new Map()
        });
    }
}
