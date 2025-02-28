import antfu from '@antfu/eslint-config'

export default antfu({
    unocss: true,
    formatters: true,
    // TypeScript and Vue are auto-detected, you can also explicitly enable them:
    typescript: true,
    vue: {
        overrides: {
            'vue/html-closing-bracket-newline': 'off',
            'vue/block-order': 'off',
            'vue/no-unused-refs': 'off'
        }
    },

    // Or customize the stylistic rules
    stylistic: {
        indent: 4, // 4, or 'tab'
        quotes: 'single', // or 'double'
        overrides: {
            'style/comma-dangle': ['error', 'never'],
            'style/brace-style': ['error', '1tbs', { allowSingleLine: true }]
        }
    },

    rules: {
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',

        'no-prototype-builtins': 'off'
    }
})
