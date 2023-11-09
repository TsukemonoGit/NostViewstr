import { nip19 } from 'nostr-tools';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { bookmarkEvents } from '$lib/stores/bookmarkEvents';
import { bookmarkRelays, postRelays, searchRelays } from '$lib/stores/relays';
import { pubkey_viewer, settings } from '$lib/stores/settings';
//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック
export const load: PageLoad<void> = ({ params }) => {
	bookmarkEvents.set([]);
	bookmarkRelays.set([]);
	postRelays.set([]);
	searchRelays.set([]);
	settings.set(false);
	//pubkey_viewer.set('');
};
