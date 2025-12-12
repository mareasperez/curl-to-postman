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
    readonly hasModifiedRequests = computed(() => {
        const state = this.conversionState();
        if (!state.originalRequests || state.originalRequests.length === 0) return false;

        // Simple JSON comparison might be expensive but effective for deep objects
        return JSON.stringify(state.requests) !== JSON.stringify(state.originalRequests);
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
        this._conversionState.update(state => {
            if (!state.originalRequests) return state;
            return {
                ...state,
                requests: JSON.parse(JSON.stringify(state.originalRequests))
            };
        });
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
