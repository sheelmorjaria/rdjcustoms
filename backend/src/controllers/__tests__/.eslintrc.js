export default {
  languageOptions: {
    globals: {
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      beforeAll: 'readonly',
      afterEach: 'readonly',
      afterAll: 'readonly',
      vi: 'readonly'
    }
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
};