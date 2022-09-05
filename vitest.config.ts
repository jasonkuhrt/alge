import { defineConfig } from 'vitest/config'
import { vitestTypescriptAssertPlugin } from 'vite-plugin-vitest-typescript-assert'

export default defineConfig({
  plugins: [
    vitestTypescriptAssertPlugin({
      report: ['type-assertion'],
      include: ['**/*.spec.*'],
    }),
  ],
})
