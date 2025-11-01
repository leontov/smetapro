import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const [tsRecommendedBase, tsRecommendedRules, tsRecommendedTypeOnlyRules] =
  tseslint.configs.recommendedTypeChecked;
const [tsStylisticBase, tsStylisticRules, tsStylisticTypeOnlyRules] =
  tseslint.configs.stylisticTypeChecked;

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'node_modules', 'eslint.config.js']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ...tsRecommendedBase.languageOptions,
      parserOptions: {
        ...tsRecommendedBase.languageOptions?.parserOptions,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    plugins: {
      ...tsRecommendedBase.plugins,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-refresh': reactRefreshPlugin
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsRecommendedRules.rules,
      ...tsRecommendedTypeOnlyRules.rules,
      ...tsStylisticRules.rules,
      ...tsStylisticTypeOnlyRules.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  }
);
