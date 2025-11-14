require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: ['next/core-web-vitals'],
  overrides: [
    {
      files: [
        'src/app/auth/sukses/page.tsx',
        'src/app/faq/page.tsx',
        'src/app/koalicioni/page.tsx',
        'src/app/kontakti/page.tsx',
        'src/app/kushtet-e-perdorimit/page.tsx',
        'src/app/ndihme/page.tsx',
      ],
      rules: {
        'react/no-unescaped-entities': 'off',
      },
    },
  ],
}
