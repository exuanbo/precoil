const { mergeObj } = require('standard-engine-ts')

module.exports = mergeObj(require('ts-standardx/.eslintrc.js'), {
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: ['dist']
})
