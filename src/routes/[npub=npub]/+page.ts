import { nip19 } from 'nostr-tools';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
//import { bookmarkEvents } from '$lib/stores/bookmarkEvents';

//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック
// export const load: PageLoad<{
// 	pubkey: string;
// 	relays?: string[];
// }> = ({ params }) => {
// 	//	console.log(params.npub);
// 	//	bookmarkEvents.set([]);
// 	// bookmarkRelays.set([]);
// 	// postRelays.set([]);
// 	// searchRelays.set([]);
// 	try {
// 		const { type, data } = nip19.decode(params.npub);
// 		console.log('[decode]', type, data);
// 		//pubkey.set(data as string);
// 		return { pubkey: data as string };
// 	} catch (e) {
// 		console.error('[npub decode error]', e);
// 		throw error(404, 'Not Found');
// 	}
// };
