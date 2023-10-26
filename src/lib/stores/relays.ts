import { writable } from 'svelte/store';
//search relay 各ノートの内容を取得するためのリレー
//bookmark relay ブックマークの取得、書き込みに使うリレー
//post relay 共有、引用ポスト用のリレー

export const defaultRelays = [
	'wss://tes'
	//'wss://relay.nostr.band'
	//	'wss://nos.lol',
	//'wss://relay.nostr.wirednet.jp'
	//	'wss://relayable.org'
];
export const searchRelays = writable<string[]>(defaultRelays);
export const bookmarkRelays = writable<string[]>(defaultRelays);
export const postRelays = writable<string[]>(defaultRelays);

// export const Relays = (): Relays => {
// 	let relay: Relays = {
// 		searchRelays: [],
// 		bookmarkRelays: [],
// 		postRelays: []
// 	};

// 	const unsubscribe = relays.subscribe(($relays: Relays) => {
// 		relay = $relays;
// 		//console.log(relay);
// 	});
// 	if (!relay || relay.searchRelays.length === 0) {
// 		let tmp: Relays = {
// 			searchRelays: [],
// 			bookmarkRelays: [],
// 			postRelays: []
// 		};
// 		const config = localStorage.getItem('config');
// 		if (config && JSON.parse(config).bookmarkRelays) {
// 			tmp.bookmarkRelays = JSON.parse(config).bookmarkRelays;
// 		} else {
// 			tmp.bookmarkRelays = defaultRelays;
// 		}
// 		if (config && JSON.parse(config).searchRelays) {
// 			tmp.searchRelays = JSON.parse(config).searchRelays;
// 		} else {
// 			tmp.searchRelays = defaultRelays;
// 		}
// 		if (config && JSON.parse(config).postRelays) {
// 			tmp.postRelays = JSON.parse(config).postRelays;
// 		} else {
// 			tmp.postRelays = defaultRelays;
// 		}
// 		relays.set(tmp);
// 	}

// 	unsubscribe();
// 	return relay;
// };
