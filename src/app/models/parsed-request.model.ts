/**
 * Parsed cURL request
 */
export interface ParsedRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string | null;
}
