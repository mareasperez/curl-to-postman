import { Injectable } from '@angular/core';
import {
  ExportProvider,
  ExportFormat,
  ExportResult,
  ExportInput,
} from '@services/providers/export-provider.interface';
import { PostmanGeneratorService } from '@services/postman-generator.service';
import { PostmanEnvironment } from '@app/models';

/**
 * Export provider for Postman Collection v2.1.0 format
 */
@Injectable({
  providedIn: 'root',
})
export class PostmanProviderService implements ExportProvider {
  constructor(private postmanGenerator: PostmanGeneratorService) {}

  getMetadata(): ExportFormat {
    return {
      id: 'postman',
      name: 'Postman Collection',
      version: '2.1.0',
      extension: 'json',
      mimeType: 'application/json',
      description: 'Postman Collection v2.1.0 with environments',
    };
  }

  generate(input: ExportInput): ExportResult {
    const {
      requests,
      variables,
      getHostVariable,
      customRequestNames,
      customEnvNames,
      customHostVariables,
      customTokenVariables,
      removedTokenKeys,
    } = input;

    // Generate collection
    const collection = this.postmanGenerator.generate(
      requests,
      variables,
      getHostVariable,
      customRequestNames,
      customHostVariables,
      customTokenVariables,
      removedTokenKeys,
    );

    // Generate environments
    const environments = this.postmanGenerator.generateEnvironments(
      variables,
      getHostVariable,
      customEnvNames,
      customHostVariables,
      customTokenVariables,
      removedTokenKeys,
    );

    // Return collection with environments as additional files
    return {
      data: collection,
      metadata: this.getMetadata(),
      additionalFiles: environments.map((env: PostmanEnvironment, index: number) => ({
        name: `${env.name}.postman_environment.json`,
        data: env,
        mimeType: 'application/json',
      })),
    };
  }
}
