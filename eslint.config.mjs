import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'e2e/**',
      'next-env.d.ts',
      'scripts/**',
      'regenerate-types.js',
      'src/shared/lib/supabase/database.types.ts',
      'supabase/functions/**',
    ],
  },
]

export default eslintConfig
