import { nip19 } from 'nostr-tools';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { relaySet, defaultRelays } from '$lib/stores/relays';

import { get } from 'svelte/store';
//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック
export const load: PageLoad<{
	pubkey: string;
	relays?: string[];
}> = ({ params }) => {
	console.log(params.nprofile);
	//bookmarkEvents.set([]);

	try {
		const { type, data } = nip19.decode(params.nprofile);
		console.log('[decode]', type, data);
		const nprofile = data as nip19.ProfilePointer;
		if (nprofile.relays && nprofile.relays && nprofile.relays.length > 0) {
			const tmp_relaySet = get(relaySet);
			tmp_relaySet[nprofile.pubkey].bookmarkRelays = nprofile.relays;
			tmp_relaySet[nprofile.pubkey].postRelays = nprofile.relays;
			tmp_relaySet[nprofile.pubkey].searchRelays = defaultRelays;
			relaySet.set(tmp_relaySet);
		}
		//pubkey.set(data as string);
		return { pubkey: nprofile.pubkey, relays: nprofile.relays };
	} catch (e) {
		console.error('[nprofile decode error]', e);
		throw error(404, 'Not Found');
	}
};
