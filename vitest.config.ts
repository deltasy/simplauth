import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        fileParallelism: false,
        
        // Roda UMA VEZ no processo pai
        globalSetup: ['./src/shared/__tests__/global.setup.ts'],
        
        // Injetado em CADA arquivo de teste
        setupFiles: ['./src/shared/__tests__/worker.setup.ts'],

        reporters: ['verbose']
    },
});