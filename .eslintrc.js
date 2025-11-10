require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: ['next/core-web-vitals'],
  overrides: [
    {
      files: [
        'app/auth/sukses/page.tsx',
        'app/faq/page.tsx',
        'app/koalicioni/page.tsx',
        'app/kontakti/page.tsx',
        'app/kushtet-e-perdorimit/page.tsx',
        'app/ndihme/page.tsx',
      ],
      rules: {
        'react/no-unescaped-entities': 'off',
      },
    },
  ],
}
