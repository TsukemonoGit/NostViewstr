import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
export default defineConfig({
	plugins: [
		sveltekit(),
		purgeCss(),
		SvelteKitPWA({
			strategies: 'generateSW',
			useCredentials: true,
			manifest: {
				name: `NostViewstr`,
				short_name: 'のすとびうあ',
				theme_color: '#533573',
				icons: [
					{
						src: 'assets/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable any'
					},
					{
						src: 'assets/icons/icon-144x144.png',
						sizes: '144x144',
						type: 'image/png',
						purpose: 'maskable any'
					}
				]
			}
		})
	]
});
