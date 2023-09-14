import { IBuildOptions, Packager, PackagerTarget } from '@vulcan-sql/build';
import {
  ArtifactBuilderProviderType,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import * as path from 'path';
import { promises as fs } from 'fs';
import { version } from '../../package.json';
import { mapValues } from 'lodash';

@VulcanExtensionId('serverless_vulcan-server')
export class ServerlessPackager extends Packager {
  private logger = this.getLogger();
  private readonly target = PackagerTarget.VulcanServer;

  public async package(option: IBuildOptions): Promise<void> {
    const config = this.getConfig() || {};
    const { folderPath = 'dist' } = config[this.target] || {};
    const distFolder = path.resolve(process.cwd(), folderPath);
    await fs.rm(distFolder, { recursive: true, force: true });
    await fs.mkdir(distFolder, { recursive: true });
    // package.json
    await fs.writeFile(
      path.resolve(distFolder, 'package.json'),
      JSON.stringify(await this.getPackageJson(), null, 4),
      'utf-8'
    );
    // config.json (vulcan config)
    await fs.writeFile(
      path.resolve(distFolder, 'config.json'),
      JSON.stringify(this.removePackagerExtension(option)),
      'utf-8'
    );
    // entrypoint
    await fs.copyFile(
      path.resolve(__dirname, 'runtime.js'),
      path.resolve(distFolder, 'index.js')
    );
    // result.json
    if (
      option.artifact.provider === ArtifactBuilderProviderType.LocalFile &&
      option.artifact.filePath
    ) {
      await fs.copyFile(
        path.resolve(process.cwd(), option.artifact.filePath),
        path.resolve(distFolder, option.artifact.filePath)
      );
    }
    this.logger.info(`Package successfully.`);
  }

  protected override async getPackageJson(): Promise<Record<string, any>> {
    const packageJson = await super.getPackageJson();
    packageJson['dependencies'][
      '@vulcan-sql-serverless/handler'
    ] = `^${version}`;
    return packageJson;
  }

  private removePackagerExtension(options: any) {
    const extensions = mapValues({ ...(options.extensions || {}) }, (value) => {
      return value === '@vulcan-sql-serverless/packager' ? undefined : value;
    });
    return { ...options, extensions };
  }
}
