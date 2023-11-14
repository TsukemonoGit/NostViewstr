import { nip19 } from 'nostr-tools';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import type { PageLoad, RouteParams } from './$types';
import { bookmarkEvents } from '$lib/stores/bookmarkEvents';
import { bookmarkRelays, postRelays, searchRelays } from '$lib/stores/relays';
interface CustomParams {
	npub: string;
	kind?: string;
}
//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック
export const load: PageLoad<{
	pubkey: string;
	relays?: string[];
	kind?: number; // kindの情報を追加
}> = ({ params }: { params: RouteParams }) => {
	const { npub, kind } = params as CustomParams; // キャストして kind を取得

	console.log(npub);
	console.log(kind); // kindの情報をログに出力

	bookmarkEvents.set([]);
	bookmarkRelays.set([]);
	postRelays.set([]);
	searchRelays.set([]);
	try {
		const { type, data } = nip19.decode(npub);
		console.log('[decode]', type, data);
		//pubkey.set(data as string);
		return { pubkey: data as string, kind: Number(kind) };
	} catch (e) {
		console.error('[npub decode error]', e);
		throw error(404, 'Not Found');
	}
};
