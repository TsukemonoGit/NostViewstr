import type { Event as NostrEvent } from 'nostr-tools';
import { writable } from 'svelte/store';
//search relay 各ノートの内容を取得するためのリレー
//bookmark relay ブックマークの取得、書き込みに使うリレー
//post relay 共有、引用ポスト用のリレー
interface RelayConfig {
	searchRelays: string[];
	bookmarkRelays: string[];
	postRelays: string[];
	relayEvent: NostrEvent;
}
//参考 https://nostter.app/nevent1qqsy739r2nqh59p8w4ufwf7ujtp4qxdwjae3uexk5fhn3pf4ntreq8q77psv7
export const relaySet = writable<{ [pubkey: string]: RelayConfig }>();
export const relaySearchRelays = [
	//'wss://tes'
	//'wss://relay.nostr.band'
	//	'wss://nos.lol',
	//'wss://relay.nostr.wirednet.jp'

	//kind 0 (ユーザのプロフィール) と kind 10002 (利用中のリレーリスト) 特化
	'wss://directory.yabu.me',
	'wss://purplepag.es', //https://purplepag.es/what
	'wss://relay.nostr.band',
	'wss://nos.lol'
	//kind:3
	//'wss://relayable.org',
];

export const defaultRelays = [
	//'wss://tes'
	//'wss://relay.nostr.wirednet.jp'
	'wss://relay.nostr.band',
	'wss://nos.lol',
	'wss://relayable.org'
];

// export const searchRelays = writable<string[]>([]);
// export const bookmarkRelays = writable<string[]>([]);
// export const postRelays = writable<string[]>([]);

//export const relayEvent = writable<NostrEvent>();
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
