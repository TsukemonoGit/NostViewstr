import { nip19 } from 'nostr-tools';
import type { AddressPointer } from 'nostr-tools/lib/types/nip19';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { relaySet, defaultRelays, initRelaySet } from '$lib/stores/relays';

import { get } from 'svelte/store';
import { decode } from '$lib/nip19';

//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック

export const load: PageLoad<{
	pubkey: string;
	kind: number;
	identifier: string;
	relays?: string[];
}> = ({ params }) => {
	console.log(params.naddr);
	//bookmarkEvents.set([]);

	try {
		const { type, data } = decode(params.naddr);

		console.log('[decode]', type, data);
		if (type === 'naddr') {
			//AddressPointer
			const address = data as AddressPointer;
			//pubkey.set(address.pubkey);
			if (address.relays && address.relays.length > 0) {
				const tmp_relaySet = get(relaySet);
				tmp_relaySet[address.pubkey] = initRelaySet;
				tmp_relaySet[address.pubkey].bookmarkRelays = address.relays;
				tmp_relaySet[address.pubkey].postRelays = address.relays;
				tmp_relaySet[address.pubkey].searchRelays = defaultRelays;
				relaySet.set(tmp_relaySet);
			}
			console.log(get(relaySet));
			return {
				pubkey: address.pubkey,
				kind: address.kind,
				identifier: address.identifier,
				relays: address.relays ?? []
			};
		} else {
			console.error('[type error]', type);
			throw error(404, 'Not Found');
		}
	} catch (e) {
		console.error('[naddr decode error]', e);
		throw error(404, 'Not Found');
	}
};
