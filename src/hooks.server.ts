// hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';
/** @type {import('@sveltejs/kit').Handle} */
export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get('accept-language')?.split(',')[0];
	if (lang) {
		locale.set(lang);
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', lang)
		});
	} else {
		return resolve(event);
	}
};
