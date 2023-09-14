import { configure } from '@vendia/serverless-express';
import {
  TYPES as CORE_TYPES,
  CodeLoader,
  getLogger,
  BuiltInArtifactKeys,
  APISchema,
  ArtifactBuilder,
  DataSource,
} from '@vulcan-sql/core';
import {
  APIProviderType,
  Container,
  TYPES,
  VulcanApplication,
  ServeConfig,
} from '@vulcan-sql/serve';

const logger = getLogger({ scopeName: 'SERVE' });

export class VulcanServerlessHandler {
  private config: ServeConfig;
  private container: Container;
  private instance: any;

  constructor(config: ServeConfig) {
    this.config = config;
    this.container = new Container();
  }

  public async init() {
    logger.info(`Initializing VulcanSQL modules...`);
    // Load container
    await this.container.load(this.config);

    const artifactBuilder = this.container.get<ArtifactBuilder>(
      CORE_TYPES.ArtifactBuilder
    );

    // Obtain schema and template
    await artifactBuilder.load();
    const templates = artifactBuilder.getArtifact(
      BuiltInArtifactKeys.Templates
    );
    const schemas = artifactBuilder.getArtifact<APISchema[]>(
      BuiltInArtifactKeys.Schemas
    );

    // Initialized template engine
    const codeLoader = this.container.get<CodeLoader>(
      CORE_TYPES.CompilerLoader
    );
    for (const templateName in templates) {
      codeLoader.setSource(templateName, templates[templateName]);
    }

    // Activate data sources
    const dataSources =
      this.container.getAll<DataSource>(CORE_TYPES.Extension_DataSource) || [];
    for (const dataSource of dataSources) {
      logger.debug(`Initializing data source: ${dataSource.getExtensionId()}`);
      await dataSource.activate();
      logger.debug(`Data source ${dataSource.getExtensionId()} initialized`);
    }

    const app = this.container.get<VulcanApplication>(TYPES.VulcanApplication);
    await app.useMiddleware();
    await app.buildRoutes(schemas, [APIProviderType.RESTFUL]);

    this.instance = configure({ app: app.getHandler() });
    logger.info(`VulcanSQL modules are ready`);
  }

  public handler(event: any, context: any) {
    return this.instance(event, context);
  }
}
