import { get } from 'svelte/store';
import type { Metadata } from 'unfurl.js/dist/types';
import { clientMap, ogpStore } from './stores/bookmarkEvents';
import { type Event as NostrEvent, nip19 } from 'nostr-tools';

import { fetchFilteredEvents, parseNaddr } from './nostrFunctions';
import type { Nostr } from 'nosvelte';
import { naddrEncode, noteEncode, type AddressPointer } from './nip19';
import { relaySet } from './stores/relays';
export enum MenuMode {
	Multi, //複数選択モード
	Owner, //追加削除ボタン込み
	Viewer, //追加削除ボタンなし
	other, //追加削除ボタンだけ（ノート読み込めてないときとか、ノートじゃないときとか）
	none, //ぼたんなし
	Sort
}
export interface SelectIndex {
	detail: {
		number: number;
		event: Nostr.Event<number> | undefined;
		tagArray: string[];
		editable?: boolean;
	};
}

interface Ogp {
	title: string;
	image: string;
	description: string;
	favicon: string;
	memo?: string;
}

export async function getOgp(url: string): Promise<Ogp> {
	try {
		const response = await fetch(
			`/api/ogp?url=${encodeURIComponent(url)}`
		).catch((err) => console.log(err));
		const result = (await response
			?.json()
			.catch((err) => console.log(err))) as Metadata;

		// APIエンドポイントから取得したOGP情報を返す
		return {
			title: result.title || '',
			image:
				result.open_graph && result.open_graph.images
					? result.open_graph.images[0].url
					: '',
			description: (result.open_graph && result.open_graph.description) || '',
			favicon: result.favicon || ''
		};
	} catch (error) {
		console.log(error);

		return {
			title: '',
			image: '',
			description: '',
			favicon: ''
		};
	}
}
// URLが存在する場合はストアの値を使用し、ない場合はOGP情報を取得してストアを更新する
export async function loadOgp(url: string) {
	const ogp = get(ogpStore);

	//取得処理が終わる前に同じURLでリクエストが来ないようにとりあえず空のogpをセット（errorだったときは再リクエストしない）

	if (!ogp[url]) {
		ogpStore.set({
			...ogp,
			[url]: {
				title: '',
				image: '',
				description: '',
				favicon: ''
			}
		});
		try {
			const newOgp = await getOgp(url); // OGP情報を取得
			const tmp = get(ogpStore);
			tmp[url] = newOgp;
			ogpStore.set(tmp);
		} catch (error) {
			console.log(error);
			ogp[url].title = '';
			ogp[url].image = '';
			ogp[url].description = '';
			ogp[url].favicon = '';
		}
	}
}
export const uniqueTags = async (tags: any[]): Promise<string[][]> => {
	if (tags.length > 0) {
		return await tags.reduce((acc: any[][], curr: [any, any]) => {
			const [tag1, tag2, ...tag3] = curr;
			const isDuplicate = acc.some(
				([existingTag1, existingTag2]) =>
					existingTag1 === tag1 && existingTag2 === tag2
			);
			//const isValidTag =
			//	tag1 !== 'emoji' && tag1 !== 'r' && tag1 !== 't' && tag1 !== 'q';

			// 追加: 最後の要素が"mention"でない場合にのみ追加する
			//(mentionは引用でこんてんとのなかにnostr:~~ではいってるはずということから)
			//mentionのeタグだけ除外
			//const isMention = tag3[tag3.length - 1] === 'mention';
			//	const isMention = tag3[tag3.length - 1] === 'mention' && tag1 === 'e';
			if (!isDuplicate) {
				//&& isValidTag && !isMention) {
				acc.push([tag1, tag2, ...tag3]);
			}
			return acc;
		}, []);
	} else {
		return [];
	}
};

export const encodedURL = (str: string): string => {
	//https://github.com/akiomik/noseyハッシュタグ以外も出てくるので変更しました
	//https://github.com/SnowCait/nostter
	const encodedstr = encodeURIComponent(str);
	const url = `https://nostter.app/search?q=${encodedstr}`; //`https://nosey.vercel.app/?q=${encodedstr}`;
	return url;
};

//long form contentsのOGP
export function setLFCOgps(
	ev: NostrEvent<number>,
	address: nip19.AddressPointer
): {
	ogp: Ogp;
	site: string;
} {
	const titletag = ev.tags.find((item) => item[0] === 'title');
	const imagetag = ev.tags.find((item) => item[0] === 'image');
	const summarytag = ev.tags.find((item) => item[0] === 'summary');
	const noslitag = ev.tags.find(
		(item) => item[0] === 't' && item[1] === 'nosli'
	);
	// const clientTag = ev.tags.find((item) => item[0] === 'client');
	// if (clientTag) {
	// 	const test = parseNaddr(clientTag);
	// 	if(!get(clientMap).has(clientTag)){
	// 		const filter={kinds:[test.kind],"#d":test.identifier,pubkey:test.pubkey};
	// 		const res = fetchFilteredEvents//rx-nostrのバージョン挙げないと色々面倒くさいかも
	// 	}

	// 		console.log(test);
	//}
	return {
		ogp: {
			title: titletag ? titletag[1] : 'LongFormContent',
			image: imagetag ? imagetag[1] : '',
			description: summarytag
				? summarytag[1]
				: 'open in habla\n' + ogpDescription(address),
			favicon: noslitag
				? 'https://nosli.vercel.app/favicon.svg'
				: 'https://habla.news/favicon.png',
			memo: 'kind:' + ev.kind + ' LongFormContent'
		},
		site: noslitag ? 'https://nosli.vercel.app/li/' : 'https://habla.news/a/'
	};
}

//communitiesのOGP
export function setComOgps(
	ev: NostrEvent<number>,
	address: nip19.AddressPointer
): {
	ogp: Ogp;
	site: string;
} {
	const dTag = ev.tags.find((item) => item[0] === 'd');
	const discriptiontTag = ev.tags.find((item) => item[0] === 'description');
	const imagetag = ev.tags.find((item) => item[0] === 'image');

	// const clientTag = ev.tags.find((item) => item[0] === 'client');
	// if (clientTag) {
	// 	const test = parseNaddr(clientTag);
	// 	if(!get(clientMap).has(clientTag)){
	// 		const filter={kinds:[test.kind],"#d":test.identifier,pubkey:test.pubkey};
	// 		const res = fetchFilteredEvents//rx-nostrのバージョン挙げないと色々面倒くさいかも
	// 	}

	// 		console.log(test);
	//}
	return {
		ogp: {
			title: dTag ? dTag[1] : 'Communities',
			image: imagetag ? imagetag[1] : '',
			description: discriptiontTag
				? discriptiontTag[1]
				: 'open in habla\n' + ogpDescription(address),
			favicon: 'https://habla.news/favicon.png',
			memo: 'kind:' + ev.kind + ' Communities'
		},
		site: 'https://habla.news/c/'
	};
}

export function ogpDescription(address: nip19.AddressPointer) {
	return `kind:${address.kind}, pubkey:${nip19.npubEncode(
		address.pubkey
	)}, id:${address.identifier}`;
}

export function formatAbsoluteDate(unixTime: number): string {
	return new Date(unixTime * 1000).toLocaleString([], {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatRelativeDate(unixTime: number) {
	const nowUnixTime = Math.floor(Date.now() / 1000); // 現在のUNIXタイムスタンプ（秒単位）

	const diffSeconds = nowUnixTime - unixTime;

	if (diffSeconds < 60) {
		return `${diffSeconds} seconds ago`;
	} else if (diffSeconds < 3600) {
		const diffMinutes = Math.floor(diffSeconds / 60);
		return `${diffMinutes} minutes ago`;
	} else if (diffSeconds < 86400) {
		const diffHours = Math.floor(diffSeconds / 3600);
		return `${diffHours} hours ago`;
	} else if (diffSeconds < 2592000) {
		const diffDays = Math.floor(diffSeconds / 86400);
		return `${diffDays} days ago`;
	} else if (diffSeconds < 31536000) {
		const diffMonths = Math.floor(diffSeconds / 2592000);
		return `${diffMonths} months ago`;
	} else {
		const diffYears = Math.floor(diffSeconds / 31536000);
		return `${diffYears} years ago`;
	}
}

export async function copyNoteId(selectedIndex: SelectIndex): Promise<boolean> {
	const id = selectedIndex.detail.event
		? selectedIndex.detail.event.id
		: selectedIndex.detail.tagArray[0] === 'e'
		? selectedIndex.detail.tagArray[1]
		: '';
	if (id === '') {
		return Promise.resolve(false);
	}
	const text = noteEncode(id);

	return navigator.clipboard.writeText(text).then(
		() => {
			// コピーに成功したときの処理
			return true;
		},
		() => {
			// コピーに失敗したときの処理
			return false;
		}
	);
}
export async function copyNaddr(selectedIndex: SelectIndex): Promise<boolean> {
	const naddrpointer: AddressPointer | undefined =
		selectedIndex.detail.tagArray[0] === 'a'
			? parseNaddr(selectedIndex.detail.tagArray)
			: selectedIndex.detail.event
			? {
					identifier:
						selectedIndex.detail.event.tags.find(
							(item) => item[0] === 'd'
						)?.[1] ?? '',
					pubkey: selectedIndex.detail.event.pubkey,
					kind: selectedIndex.detail.event.kind
					// relays: get(relaySet)?.[selectedIndex.detail.event.pubkey] ?? []
			  }
			: undefined;
	if (!naddrpointer) {
		return Promise.resolve(false);
	}
	const text = naddrEncode(naddrpointer);
	return navigator.clipboard.writeText(text).then(
		() => {
			// コピーに成功したときの処理
			return true;
		},
		() => {
			// コピーに失敗したときの処理
			return false;
		}
	);
}
