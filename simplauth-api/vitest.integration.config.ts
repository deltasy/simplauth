import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        fileParallelism: false,
        isolate: false,
        
        // Runs ONCE in the parent process
        globalSetup: ['./src/shared/__tests__/global.setup.ts'],
        
        // Injected in EVERY test file
        setupFiles: ['./src/shared/__tests__/worker.setup.ts'],

        reporters: ['verbose']
    },
});