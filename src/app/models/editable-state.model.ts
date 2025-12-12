/**
 * User-editable state (custom names)
 */
export interface EditableState {
    /** Custom request names (index -> name) */
    requestNames: Map<number, string>;

    /** Custom environment names (original -> custom) */
    envNames: Map<string, string>;
}
