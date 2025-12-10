import { Injectable, Inject, Optional } from '@angular/core';
import {
    ExportProvider,
    ExportFormat,
    ExportResult,
    ExportInput,
    EXPORT_PROVIDER
} from './export-provider.interface';

/**
 * Service that manages all registered export providers
 * Providers are automatically injected via Angular DI
 */
@Injectable({
    providedIn: 'root'
})
export class ExportProviderService {
    private providers: Map<string, ExportProvider> = new Map();

    constructor(
        @Optional() @Inject(EXPORT_PROVIDER) providers: ExportProvider[] | null
    ) {
        // Register all injected providers
        if (providers) {
            providers.forEach(provider => {
                const metadata = provider.getMetadata();
                this.providers.set(metadata.id, provider);
                console.log(`Registered export provider: ${metadata.name} (${metadata.id})`);
            });
        }
    }

    /**
     * Get all available export formats
     */
    getAvailableFormats(): ExportFormat[] {
        return Array.from(this.providers.values())
            .map(provider => provider.getMetadata())
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get a specific provider by format ID
     */
    getProvider(formatId: string): ExportProvider | undefined {
        return this.providers.get(formatId);
    }

    /**
     * Check if a format is available
     */
    hasFormat(formatId: string): boolean {
        return this.providers.has(formatId);
    }

    /**
     * Export using a specific format
     */
    export(formatId: string, input: ExportInput): ExportResult | null {
        const provider = this.getProvider(formatId);

        if (!provider) {
            console.error(`Export provider not found: ${formatId}`);
            console.log('Available providers:', Array.from(this.providers.keys()));
            return null;
        }

        try {
            return provider.generate(input);
        } catch (error) {
            console.error(`Error generating export with ${formatId}:`, error);
            throw error;
        }
    }

    /**
     * Get format metadata by ID
     */
    getFormatMetadata(formatId: string): ExportFormat | undefined {
        const provider = this.getProvider(formatId);
        return provider?.getMetadata();
    }
}
