import { nip19 } from 'nostr-tools';

//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import { relaySet, defaultRelays, initRelaySet } from '$lib/stores/relays';

import { get } from 'svelte/store';
import type { PageLoad } from './$types';

//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック

export const load: PageLoad<{
	pubkey: string;
	kind: number | undefined;
	identifier: string;
	id: string;
	relays: string[];
}> = ({ params }) => {
	console.log(params.nevent);
	//bookmarkEvents.set([]);

	try {
		const { type, data } = nip19.decode(params.nevent);

		console.log('[decode]', type, data);
		if (type === 'nevent') {
			//AddressPointer
			const nevent = data as nip19.EventPointer;

			//pubkey.set(address.pubkey);
			if (!nevent.relays) {
				console.error('[nevent relay not found error]', data);
				throw error(404, 'Not Found');
			}
			if (nevent.author && nevent.relays && nevent.relays.length > 0) {
				const tmp_relaySet = get(relaySet);
				tmp_relaySet[nevent.author] = initRelaySet;
				tmp_relaySet[nevent.author].readRelays = nevent.relays;
				tmp_relaySet[nevent.author].writeRelays = nevent.relays;
				tmp_relaySet[nevent.author].mergeRelays = Array.from(
					new Set([...defaultRelays, ...nevent.relays])
				);
				relaySet.set(tmp_relaySet);

				console.log('get(relaySet):', get(relaySet));
				return {
					pubkey: nevent.author,
					kind: nevent.kind,
					identifier: '',
					id: nevent.id,
					relays: nevent.relays
				};
			}
		} else {
			console.error('[type error]', type);
			throw error(404, 'Not Found');
		}
	} catch (e) {
		console.error('[naddr decode error]', e);
		throw error(404, 'Not Found');
	}
	// load関数がundefinedを返す場合、デフォルトの値を返すようにする
	return {
		pubkey: '',
		kind: undefined,
		identifier: '',
		id: '',
		relays: []
	};
};
