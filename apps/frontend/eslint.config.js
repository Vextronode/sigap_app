import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Tanggal dan jam wajib menyebut zona waktu agar tampil dalam WIB di perangkat
      // mana pun (TK-05). Format angka seperti kapasitas tidak terkena.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name=/^toLocale(Date|Time)String$/]:not(:has(Property[key.name='timeZone']))",
          message: 'Sertakan timeZone (Asia/Jakarta) atau gunakan helper di utils/date.ts.',
        },
        {
          selector:
            "CallExpression[callee.property.name='toLocaleString'][arguments.length>=2]:not(:has(Property[key.name='timeZone']))",
          message: 'Sertakan timeZone (Asia/Jakarta) atau gunakan helper di utils/date.ts.',
        },
        {
          selector:
            "NewExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat']:not(:has(Property[key.name='timeZone']))",
          message: 'Sertakan timeZone (Asia/Jakarta) atau gunakan helper di utils/date.ts.',
        },
      ],
    },
  },
])
