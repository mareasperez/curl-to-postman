import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParsedRequest, HeaderItem, QueryParam } from '../../../models';

@Component({
    selector: 'app-request-details-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './request-details-modal.component.html',
    styleUrl: './request-details-modal.component.css'
})
export class RequestDetailsModalComponent {
    // Inputs
    request = input<ParsedRequest | null>(null);
    requestName = input<string>('');
    rawOutput = input<unknown>(null);
    isOpen = input<boolean>(false);

    // Outputs
    close = output<void>();
    requestUpdated = output<ParsedRequest>();
    resetRequested = output<void>();

    // State
    activeTab = signal<'parsed' | 'raw'>('parsed');
    internalTab = signal<'general' | 'headers' | 'body'>('general');

    // Editable State
    editMethod = signal('');
    editUrl = signal('');
    editBody = signal('');
    editHeaders = signal<HeaderItem[]>([]);
    editQueryParams = signal<QueryParam[]>([]);

    constructor() {
        effect(() => {
            const req = this.request();
            if (req && this.isOpen()) {
                this.editMethod.set(req.method);
                this.updateUrl(req.url, true);
                this.editBody.set(req.body || '');
                this.editHeaders.set(
                    Object.entries(req.headers || {}).map(([key, value]) => ({ key, value }))
                );
                // Reset internal tab on open
                this.internalTab.set('general');
            }
        });
    }

    // Computed
    rawOutputJson = computed(() => {
        return JSON.stringify(this.rawOutput(), null, 2);
    });

    hasChanges = computed(() => {
        const original = this.request();
        if (!original) return false;

        // Check primitives
        if (this.editMethod() !== original.method) return true;
        if (this.editUrl() !== original.url) return true;
        if ((this.editBody() || '') !== (original.body || '')) return true;

        // Check headers
        const originalHeaders = original.headers || {};
        const currentHeaders = this.editHeaders();

        // Convert array back to object for comparison (ignoring empty keys)
        const currentHeadersObj: Record<string, string> = {};
        currentHeaders.forEach(h => {
            if (h.key.trim()) currentHeadersObj[h.key] = h.value;
        });

        const origKeys = Object.keys(originalHeaders);
        const currKeys = Object.keys(currentHeadersObj);

        if (origKeys.length !== currKeys.length) return true;

        for (const key of origKeys) {
            if (originalHeaders[key] !== currentHeadersObj[key]) return true;
        }

        return false;
    });

    onClose() {
        this.close.emit();
    }

    setTab(tab: 'parsed' | 'raw') {
        this.activeTab.set(tab);
    }

    setInternalTab(tab: 'general' | 'headers' | 'body') {
        this.internalTab.set(tab);
    }

    onBackdropClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.onClose();
        }
    }

    // Editing Actions
    addHeader() {
        this.editHeaders.update(headers => [...headers, { key: '', value: '' }]);
    }

    removeHeader(index: number) {
        this.editHeaders.update(headers => headers.filter((_, i) => i !== index));
    }

    // Query Params Logic
    updateUrl(url: string, syncParams = true) {
        this.editUrl.set(url);
        if (syncParams) {
            this.parseParamsFromUrl(url);
        }
    }

    parseParamsFromUrl(url: string) {
        try {
            // Handle URL parsing safely even if it's just a path or partial URL
            const dummyBase = 'http://example.com';
            let urlObj: URL;

            if (url.startsWith('http')) {
                urlObj = new URL(url);
            } else if (url.startsWith('/')) {
                urlObj = new URL(url, dummyBase);
            } else {
                // Determine if it looks like there's a domain or just path
                urlObj = new URL(url.includes('://') ? url : `${dummyBase}/${url}`);
            }

            const params: QueryParam[] = [];

            // If the original URL had query params, parse them
            if (url.includes('?')) {
                const searchPart = url.split('?')[1];
                const searchParams = new URLSearchParams(searchPart);
                searchParams.forEach((value, key) => {
                    params.push({ key, value });
                });
            } else {
                // Try standard URL parsing if no manual split worked
                urlObj.searchParams.forEach((value, key) => {
                    params.push({ key, value });
                });
            }

            // Deduplicate if needed? No, standard behavior allows duplicates. 
            // BUT Map/forEach might deduplicate keys. URLSearchParams supports multiple values for same key.
            // My implementation above using forEach on searchParams handles multiples correctly.

            // Reset only if we found something or if URL has no query.
            // Actually, if we type, we should replace entirely.
            this.editQueryParams.set(params);

        } catch (e) {
            // Fallback for simple string parsing
            if (url.includes('?')) {
                try {
                    const search = url.split('?')[1];
                    const searchParams = new URLSearchParams(search);
                    const params: QueryParam[] = [];
                    searchParams.forEach((value, key) => {
                        params.push({ key, value });
                    });
                    this.editQueryParams.set(params);
                } catch {
                    this.editQueryParams.set([]);
                }
            } else {
                this.editQueryParams.set([]);
            }
        }
    }

    updateUrlFromParams() {
        const currentUrl = this.editUrl();
        const baseUrl = currentUrl ? currentUrl.split('?')[0] : '';
        const params = this.editQueryParams();

        if (params.length === 0) {
            // If no params, just usage base
            if (currentUrl.includes('?')) {
                this.editUrl.set(baseUrl);
            }
            return;
        }

        const searchParams = new URLSearchParams();
        params.forEach(p => {
            if (p.key) searchParams.append(p.key, p.value);
        });

        const queryString = searchParams.toString();
        // If query string is empty (e.g. keys empty), handle it
        if (!queryString) {
            this.editUrl.set(baseUrl);
            return;
        }

        this.editUrl.set(`${baseUrl}?${queryString}`);
    }

    addQueryParam() {
        this.editQueryParams.update(params => [...params, { key: '', value: '' }]);
        // Do NOT update URL yet, usually wait for input? Or update immediately with empty?
        // Updating immediately might result in `?=` or `?&`.
        // Better to update.
        // this.updateUrlFromParams(); 
    }

    removeQueryParam(index: number) {
        this.editQueryParams.update(params => params.filter((_, i) => i !== index));
        this.updateUrlFromParams();
    }

    updateQueryParam() {
        this.updateUrlFromParams();
    }

    save() {
        const original = this.request();
        if (!original) return;

        // Reconstruct headers object
        const headersObj: Record<string, string> = {};
        this.editHeaders().forEach(h => {
            if (h.key.trim()) {
                headersObj[h.key] = h.value;
            }
        });

        const updatedRequest: ParsedRequest = {
            ...original,
            method: this.editMethod(),
            url: this.editUrl(),
            body: this.editBody(),
            headers: headersObj
        };

        this.requestUpdated.emit(updatedRequest);
        this.onClose();
    }

    reset() {
        this.resetRequested.emit();
    }
}
