module.exports = {
  apiKey: process.env.LINGODOTDEV_API_KEY,
  sourceLanguage: 'en',
  targetLanguages: ['fr', 'de', 'ru', 'zh', 'mn'],
  translationFiles: {
    input: './src/translations/en.json',
    output: './src/translations/{{language}}.json'
  },
  extractionPatterns: [
    {
      pattern: /t\(['"`]([^'"`]+)['"`]\)/g,
      files: ['src/**/*.{ts,tsx,js,jsx}']
    },
    {
      pattern: /useT\(\)\(['"`]([^'"`]+)['"`]\)/g,
      files: ['src/**/*.{ts,tsx,js,jsx}']
    }
  ]
};
