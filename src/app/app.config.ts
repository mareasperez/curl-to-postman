import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { EXPORT_PROVIDER } from './services/providers/export-provider.interface';
import { PostmanProviderService } from './services/providers/postman-provider.service';
import { OpenApiV3ProviderService } from './services/providers/openapi-v3-provider.service';
import { OpenApiV2ProviderService } from './services/providers/openapi-v2-provider.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Register export providers
    { provide: EXPORT_PROVIDER, useClass: PostmanProviderService, multi: true },
    { provide: EXPORT_PROVIDER, useClass: OpenApiV3ProviderService, multi: true },
    { provide: EXPORT_PROVIDER, useClass: OpenApiV2ProviderService, multi: true }
  ]
};
