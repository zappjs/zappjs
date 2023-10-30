import { generate } from '@zappjs/core';
import { GitignoreGenerator } from '@zappjs/git';
import { HandlebarsEngine } from '@zappjs/handlebars';
import { JsonEngine } from '@zappjs/json';
import { LicenseGenerator } from '@zappjs/license';
import { PrettierProcessor } from '@zappjs/prettier';
import { camelCase, pascalCase } from 'change-case';
import { join } from 'path';
import { plural } from 'pluralize';

export interface ISpec {
  name: string;
  version: string;
  license: 'Apache-2.0' | 'GPL-2.0-only' | 'GPL-3.0-only' | 'ISC' | 'MIT';
  description: string;
  auth?: {
    providers?: {
      google?: {};
      github?: {};
    };
  };
  calls: {
    [name: string]: {
      request: {};
      response: {};
    };
  };
  models: {
    [name: string]: {
      attributes: {
        [name: string]: {
          key?: 'primary';
          type: 'number' | 'string';
          unique?: boolean;
        };
      };
    };
  };
}

export default async function zapp(spec: ISpec) {
  const pkg = process?.versions?.node ? require(`${process.cwd()}/package.json`) : {};

  const modelNamesPluralCamelCase = Object.keys(spec.models).map((model) =>
    camelCase(plural(model)),
  );
  const modelNamesPluralPascal = Object.keys(spec.models).map((model) => pascalCase(plural(model)));

  const auth: {
    [file: string]: string;
  } = {};
  if (spec.auth) {
    auth['app/api/auth/[...nextauth]/route.ts'] = await generate({
      processor: PrettierProcessor(),
      engine: async () => {
        return /*ts*/ `
          import { authOptions } from '@/app/auth'
          import NextAuth from 'next-auth'
          
          const handler = NextAuth(authOptions)
          
          export { handler as GET, handler as POST }        
        `;
      },
    });
    auth['app/api/auth.ts'] = await generate({
      processor: PrettierProcessor(),
      engine: async () => {
        return /*ts*/ `
          import { NextAuthOptions } from 'next-auth'
          import GithubProvider, { GithubProfile } from 'next-auth/providers/github'
          
          export const authOptions: NextAuthOptions = {
            providers: [
              ${
                spec.auth?.providers?.github
                  ? /*ts*/ `
                GithubProvider({
                  clientId: process.env.GITHUB_ID || '',
                  clientSecret: process.env.GITHUB_SECRET || '',
                  authorization: {
                    params: {
                      scope: undefined,
                    },
                  },
                  profile(profile: GithubProfile) {
                    return {
                      id: profile.id.toString(),
                      name: profile.name,
                      image: profile.avatar_url,
                      email: profile.login,
                    }
                  },
                }),
              `
                  : ''
              }
            ],
          }        
        `;
      },
    });
  }

  const tables: {
    [file: string]: string;
  } = {};
  await Promise.all(
    Object.entries(spec.models).map(async ([modelName, model]) => {
      const modelNamePlural = plural(modelName);
      const modelNamePluralPascal = pascalCase(modelNamePlural);
      tables[`src/tables/${modelNamePluralPascal}Table.ts`] = await generate({
        processor: PrettierProcessor(),
        engine: async () => {
          return `
          import { ColumnType, Generated, sql } from 'kysely'

          import { db } from '../lib/db'
          
          export interface ${modelNamePluralPascal}Table {
            ${Object.entries(model.attributes)
              .map(
                ([attributeName, attribute]) =>
                  `${camelCase(attributeName)}: ${
                    attribute.key === 'primary' ? `Generated<${attribute.type}>` : attribute.type
                  }`,
              )
              .join('\n')}
            createdAt: ColumnType<Date, string | undefined, never>
          }
          
          export const create${modelNamePluralPascal}Table = async () => {
            await db.schema
              .createTable('${modelNamePlural}')
              .ifNotExists()
              ${Object.entries(model.attributes)
                .map(
                  ([attributeName, attribute]) =>
                    `.addColumn('${camelCase(attributeName)}', '${
                      attribute.key === 'primary'
                        ? 'serial'
                        : attribute.type === 'number'
                        ? 'integer'
                        : 'varchar(255)'
                    }', (cb) => cb.${attribute.key === 'primary' ? 'primaryKey()' : 'notNull()'}${
                      attribute.unique ? '.unique()' : ''
                    })`,
                )
                .join('\n')}
              .execute()
          }
        
        `;
        },
      });
    }),
  );

  let fs;
  if (process?.versions?.node) {
    fs = require('fs');
  }

  return {
    ...auth,
    ...tables,
    'src/lib/db.ts': await generate({
      processor: PrettierProcessor(),
      engine: async () => {
        return /*ts*/ `
          import { createKysely } from '@vercel/postgres-kysely'
    
          ${modelNamesPluralPascal
            .map(
              (modelName) =>
                `import { ${modelName}Table, create${modelName}Table } from '../tables/${modelName}Table'`,
            )
            .join('\n')}
          
          export interface Database {
            ${modelNamesPluralPascal
              .map((modelName) => `${modelName}: ${modelName}Table`)
              .join('\n')}
          }
          
          export const db = createKysely<Database>()
          
          export const deinit = async () => {
            const tables = [
              ${modelNamesPluralCamelCase.map((modelName) => `'${modelName}'`).join(',')}
            ]
          
            for (let i = 0; i < tables.length; i++) {
              await db.schema.dropTable(tables[i]).ifExists().execute()
            }
          }
          
          export const init = async () => {
            ${modelNamesPluralPascal
              .map((modelName) => `await create${modelName}Table()`)
              .join('\n')}
          }
          
          export const seed = async () => {}
        `;
      },
    }),
    '.gitignore': await GitignoreGenerator(['dist/', 'node_modules/', '.DS_Store']),
    LICENSE: await LicenseGenerator(spec),
    'next.config.js': await generate({
      processor: PrettierProcessor(),
      engine: () => /*ts*/ `
        /** @type {import('next').NextConfig} */
        const nextConfig = {}

        module.exports = nextConfig
      `,
    }),
    'package.json': await generate({
      engine: JsonEngine,
      spec: {
        ...pkg,
        name: spec.name,
        version: spec.version,
        description: spec.description,
        license: spec.license,
        dependencies: {
          ...pkg.dependencies,
          '@vercel/postgres-kysely': '^0.5.0',
          kysely: '^0.26.3',
          'next-auth': '^4.23.1',
        },
      },
    }),
    'README.md': await generate({
      processor: PrettierProcessor({
        parser: 'markdown',
      }),
      engine: HandlebarsEngine,
      spec,
      template: fs
        ? fs.readFileSync(join(__dirname, '../../.zapp', './templates/readme.hbs'), 'utf8')
        : '',
    }),
  };
}