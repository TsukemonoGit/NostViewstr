import { nip19 } from 'nostr-tools';
//import { pubkey } from '$lib/stores/settings';
import { error } from '@sveltejs/kit';
import type { PageLoad, RouteParams } from './$types';

interface CustomParams {
	npub: string;
	kind: string;
	identifier: string;
}
//https://kit.svelte.jp/docs/load
//ページを読み込む前に有効なparamかチェック
export const load: PageLoad<{
	pubkey: string;
	kind: number; // kindの情報を追加
	identifier: string;
}> = ({ params }: { params: RouteParams }) => {
	const { npub, kind, identifier } = params as CustomParams; // キャストして kind を取得

	console.log(npub);
	console.log(kind); // kindの情報をログに出力
	console.log(identifier);

	//	bookmarkEvents.set([]);
	// bookmarkRelays.set([]);
	// postRelays.set([]);
	// searchRelays.set([]);
	try {
		const { type, data } = nip19.decode(npub);

		console.log('[decode]', type, data);
		//pubkey.set(data as string);
		if (!Number.isInteger(Number(kind)) || Number(kind) < 0) {
			//kind:0でもエラーにならないように
			console.error('[kind error]');
			throw error(404, 'Not Found');
		}
		return {
			pubkey: data as string,
			kind: Number(kind),
			identifier: decodeURIComponent(identifier)
		};
	} catch (e) {
		console.error('[npub decode error]', e);
		throw error(404, 'Not Found');
	}
};
