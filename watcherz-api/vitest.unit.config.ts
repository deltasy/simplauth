import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        reporters: ['verbose'],
        env: {
            JWT_SECRET: "dummy"
        }
    },
});