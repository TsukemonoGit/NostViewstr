import { nip19 } from 'nostr-tools';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import {
	bookmarkRelays,
	defaultRelays,
	postRelays,
	searchRelays
} from '$lib/stores/relays';
import { bookmarkEvents } from '$lib/stores/bookmarkEvents';
//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック
export const load: PageLoad<{
	pubkey: string;
	relays?: string[];
}> = ({ params }) => {
	console.log(params.nprofile);
	bookmarkEvents.set([]);
	bookmarkRelays.set([]);
	postRelays.set([]);
	searchRelays.set([]);
	try {
		const { type, data } = nip19.decode(params.nprofile);
		console.log('[decode]', type, data);
		const nprofile = data as nip19.ProfilePointer;
		if (nprofile.relays && nprofile.relays) {
			bookmarkRelays.set(nprofile.relays);
			postRelays.set(nprofile.relays);
			searchRelays.set(defaultRelays);
		}
		//pubkey.set(data as string);
		return { pubkey: nprofile.pubkey, relays: nprofile.relays };
	} catch (e) {
		console.error('[nprofile decode error]', e);
		throw error(404, 'Not Found');
	}
};
