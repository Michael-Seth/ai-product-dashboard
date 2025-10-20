import cypress from 'eslint-plugin-cypress/flat';
import baseConfig from '../eslint.base.config.mjs';

export default [
  cypress.configs['recommended'],
  ...baseConfig,
  {
    // Override or add rules here
    rules: {},
  },
];
