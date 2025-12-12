/**
 * Union type for all possible export outputs
 */
export type ExportOutput = PostmanCollection | OpenAPISpec | Record<string, unknown>;

/**
 * Postman Collection structure
 */
export interface PostmanCollection {
    info: {
        name: string;
        description: string;
        schema: string;
    };
    item: PostmanItem[];
    variable: PostmanVariable[];
}

export interface PostmanItem {
    name: string;
    request: {
        method: string;
        header: PostmanHeader[];
        url: {
            raw: string;
            protocol: string;
            host: string[];
            path: string[];
        };
        body?: {
            mode: string;
            raw: string;
            options?: {
                raw: {
                    language: string;
                };
            };
        };
    };
}

export interface PostmanHeader {
    key: string;
    value: string;
    type: string;
}

export interface PostmanVariable {
    key: string;
    value: string;
    type: string;
}

export interface PostmanEnvironment {
    name: string;
    values: Array<{
        key: string;
        value: string;
        type: string;
        enabled: boolean;
    }>;
}

/**
 * OpenAPI Specification structure
 */
export interface OpenAPISpec {
    openapi: string;
    info: {
        title: string;
        description: string;
        version: string;
    };
    servers: Array<{
        url: string;
        description?: string;
    }>;
    paths: Record<string, Record<string, OpenAPIOperation>>;
    components?: {
        securitySchemes?: Record<string, unknown>;
        schemas?: Record<string, unknown>;
    };
}

export interface OpenAPIOperation {
    operationId: string;
    summary?: string;
    parameters?: Array<{
        name: string;
        in: string;
        required?: boolean;
        schema?: Record<string, unknown>;
    }>;
    requestBody?: {
        content: Record<string, {
            schema: Record<string, unknown>;
        }>;
    };
    responses?: Record<string, unknown>;
    security?: Array<Record<string, string[]>>;
}
