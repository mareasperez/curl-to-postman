/**
 * Token data for variable detection
 */
export interface TokenData {
    header: string;
    value: string;
    requests: number[];
}

/**
 * Environment data
 */
export interface EnvironmentData {
    name: string;
    isLocal: boolean;
    protocol: string;
    host: string;
    variables: Record<string, string>;
    requestIndices: number[];
}

/**
 * Variable analysis result
 */
export interface VariableAnalysis {
    hosts: Map<string, number[]>;
    hostVariableNames: Map<string, string>;
    tokens: Map<string, TokenData>;
    environments: Map<string, EnvironmentData>;
}
