import { nip19 } from 'nostr-tools';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { JsonEventData } from '$lib/stores/bookmarkEvents';

import { get } from 'svelte/store';
//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック
export const load: PageLoad<void> = ({ params }) => {
	if (get(JsonEventData) === undefined) {
		//Jsonないのにここきたらえらーで
		throw error(404, 'Not Found');
	}
};
