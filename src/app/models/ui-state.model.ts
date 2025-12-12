/**
 * UI-related state (tabs, modals, visibility)
 */
export interface UIState {
    /** Currently active tab in output section */
    currentTab: 'collection' | 'environment' | 'variables' | 'summary' | 'requests';

    /** Whether output section is visible */
    showOutput: boolean;

    /** Selected export format ID */
    selectedFormatId: string;

    /** Whether features modal is open */
    showFeaturesModal: boolean;
}
