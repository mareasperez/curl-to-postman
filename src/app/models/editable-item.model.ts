export interface EditableItem {
    badge?: {
        text: string;
        class: string;
    };
    name: string;
    preview?: string;
    meta?: string;
    isDuplicate?: boolean;
}
