import { join } from 'path';
import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/tw-plugin';
import { myCustomTheme } from './myCustomTheme';
export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [
		skeleton({
			themes: {
				// preset: [
				// 	{
				// 		name: 'crimson',
				// 		enhancements: true,
				// 	},
				// ],

				custom: [myCustomTheme]
			}
		})
	]
} satisfies Config;
