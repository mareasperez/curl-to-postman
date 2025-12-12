import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParsedRequest } from '../../../models';

interface HeaderItem {
    key: string;
    value: string;
}

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

    // Editable State
    editMethod = signal('');
    editUrl = signal('');
    editBody = signal('');
    editHeaders = signal<HeaderItem[]>([]);

    constructor() {
        effect(() => {
            const req = this.request();
            if (req && this.isOpen()) {
                this.editMethod.set(req.method);
                this.editUrl.set(req.url);
                this.editBody.set(req.body || '');
                this.editHeaders.set(
                    Object.entries(req.headers || {}).map(([key, value]) => ({ key, value }))
                );
            }
        });
    }

    // Computed
    rawOutputJson = computed(() => {
        return JSON.stringify(this.rawOutput(), null, 2);
    });

    onClose() {
        this.close.emit();
    }

    setTab(tab: 'parsed' | 'raw') {
        this.activeTab.set(tab);
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
