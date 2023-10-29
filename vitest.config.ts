/// <reference types="vitest" />
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	test: {
		globals: true,
		environment: 'jsdom' // ← これによって テストでも（ブラウザじゃなくても） import websocket polyfillいらなくなってるっぽい?
		//https://github.com/vitest-dev/vitest/issues/4043 yokuwakarann
		//
		// reporters: ['json'],
		// outputFile: './test-output.json'
	}
});
