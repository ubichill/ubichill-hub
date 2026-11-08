import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // ubichill 本体から同期したページは、本体リポジトリ内の元ファイルのパスを持つ（scripts/sync-docs.mjs が書く）
        source: z.string().optional(),
      }),
    }),
  }),
  // UI 文言の上書き用（英語版を足すときに使う）。空でも定義しておくと Starlight の警告が消える
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
