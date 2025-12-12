import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParsedRequest } from '../../../models';


@Component({
    selector: 'app-request-details-modal',
    imports: [CommonModule],
    templateUrl: './request-details-modal.component.html',
    styleUrl: './request-details-modal.component.css'
})
export class RequestDetailsModalComponent {
    // Inputs
    request = input<ParsedRequest | null>(null);
    rawOutput = input<unknown>(null);
    isOpen = input<boolean>(false);

    // Outputs
    close = output<void>();

    // State
    activeTab = signal<'parsed' | 'raw'>('parsed');

    // Computed
    hasBody = computed(() => !!this.request()?.body);

    headersList = computed(() => {
        const req = this.request();
        if (!req) return [];
        return Object.entries(req.headers).map(([key, value]) => ({ key, value }));
    });

    rawOutputJson = computed(() => {
        return JSON.stringify(this.rawOutput(), null, 2);
    });

    parsedBodyJson = computed(() => {
        const body = this.request()?.body;
        if (!body) return '';
        try {
            // Try to format if it's JSON
            if (typeof body === 'string' && (body.startsWith('{') || body.startsWith('['))) {
                return JSON.stringify(JSON.parse(body), null, 2);
            }
            return body;
        } catch {
            return body;
        }
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
}
