import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [svelte()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./vitest-setup.js'],
        include: ['tests/unit/**/*.test.js', 'tests/component/**/*.test.js'],
    },
    resolve: { conditions: ['browser'] },
});
