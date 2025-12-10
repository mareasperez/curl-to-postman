export interface Variable {
    name: string;
    value: string;
    count: number;
}

export interface SummaryData {
    totalRequests: number;
    totalHosts: number;
    totalTokens: number;
    totalEnvironments: number;
    requests: any[];
    environments: any[];
}

export interface Stat {
    icon: string;
    value: number;
    label: string;
}

export interface EditableItem {
    badge?: {
        text: string;
        class: string;
    };
    name: string;
    preview?: string;
}

export interface AdditionalFile {
    name: string;
    data: any;
    mimeType: string;
}
