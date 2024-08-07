require('ts-node').register({
  $schema: 'https://json.schemastore.org/tsconfig',
  display: 'Default',
  compilerOptions: {
    lib: ['esnext', 'dom'],
    module: 'commonjs',
    composite: false,
    declaration: true,
    declarationMap: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    inlineSources: false,
    isolatedModules: true,
    moduleResolution: 'node',
    noUnusedLocals: false,
    noUnusedParameters: false,
    preserveWatchOutput: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    strict: true,
    strictNullChecks: true,
    outDir: 'dist/',
    paths: {
      '@/*': ['./*'],
    },
  },
  exclude: ['node_modules'],
});

import { program } from 'commander';
import { existsSync, watchFile } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, normalize } from 'path';

import { getNodeListOutput } from './utils/getNodeListOutput';
import { loadGenerator } from './utils/loadGenerator';
import { loadSpec } from './utils/loadSpec';
import { pathListToNodeList } from './utils/pathListToNodeList';

import pkg from './package.json';
import { getHash } from './utils/getHash';

program.name(pkg.name).description(pkg.description).version(pkg.version);

async function generate({ force }: { force?: boolean }) {
  try {
    const { spec } = await loadSpec();

    const generator = await loadGenerator(spec['$generator']);
    const files = await generator(spec);

    const hash: Record<
      string,
      {
        integrity: string;
      }
    > = {};
    const output: Record<string, Buffer | string> = {};

    // generate code
    await Promise.all(
      Object.entries(files).map(async ([fileName, generator]) => {
        const fileContents = await generator;
        const filePath = normalize(fileName);

        if (typeof fileContents !== 'string' && !Buffer.isBuffer(fileContents)) {
          console.log(`Skipped: ${filePath}`);
          return;
        }

        hash[filePath] = {
          integrity: `sha512-${getHash(fileContents.toString())}`,
        };
        output[filePath] = fileContents;
      }),
    );

    const currentLock = existsSync('.specui/lock.json')
      ? (JSON.parse(await readFile('.specui/lock.json', 'utf8')) as Record<
          string,
          { integrity: string }
        >)
      : {};

    // check hash
    const mismatchHashes: [string] = (
      await Promise.all(
        Object.entries(hash).map(async ([filePath]) => {
          const content = existsSync(filePath) ? await readFile(filePath, 'utf8') : '';
          const existingHash = `sha512-${getHash(content)}`;
          if (currentLock[filePath] && existingHash !== currentLock[filePath]?.integrity) {
            return filePath;
          }
        }),
      )
    ).filter((filePath) => Boolean(filePath)) as [string];

    if (mismatchHashes.length) {
      if (force) {
        mismatchHashes.forEach((mismatchHash) => {
          delete hash[mismatchHash];
        });
      } else {
        console.log(
          `Aborting due to manual edits:\n${mismatchHashes.map((hash) => `- ${hash}`).join('\n')}`,
        );
        return;
      }
    }

    if (!existsSync('.specui')) {
      await mkdir('.specui');
    }
    await writeFile('.specui/lock.json', JSON.stringify(hash, null, 2));

    // write code to disk
    await Promise.all(
      Object.entries(output).map(async ([filePath, fileContents]) => {
        const dir = dirname(filePath);

        if (
          currentLock[filePath]?.integrity &&
          hash[filePath]?.integrity === currentLock[filePath]?.integrity
        ) {
          return;
        }

        if (!existsSync(dir)) {
          await mkdir(dir, { recursive: true });
        }
        console.log(`Write to: ${filePath}`);
        await writeFile(filePath, fileContents);
      }),
    );

    // print generated files
    const paths = Object.keys(output);
    const nodes = pathListToNodeList(paths);
    console.log('Generated Files:');
    console.log(getNodeListOutput(nodes));
  } catch (error) {
    console.log(error);
  }
}

program
  .command('generate')
  .option('-f, --force', 'force generation')
  .option('-w, --watch', 'watch for spec changes')
  .action(async (options) => {
    const { file: specFile } = await loadSpec();

    if (options.watch) {
      watchFile(specFile, { interval: 1000 }, async () => {
        generate({ force: options.force });
      });
    } else {
      generate({ force: options.force });
    }
  });

program.parse();
