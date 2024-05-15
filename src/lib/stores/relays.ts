import type { Event as NostrEvent } from 'nostr-tools';
import { writable } from 'svelte/store';
//デフォルトリレーはブックマーク取得用のリレー（読みと書きのマージにする？）

//書き込みは一時リレーを使う rxNostr.send(event,{ relays: relays });

//search relay 各ノートの内容を取得するためのリレー
//bookmark relay ブックマークの取得、書き込みに使うリレー
//post relay 共有、引用ポスト用のリレー
export interface RelayConfig {
	readRelays: string[];
	writeRelays: string[];
	mergeRelays: string[];
	relayEvent: NostrEvent | undefined;
}

//しょきか
export const initRelaySet: RelayConfig = {
	readRelays: [],
	writeRelays: [],
	mergeRelays: [],
	relayEvent: undefined
};

export const relaySet = writable<{ [pubkey: string]: RelayConfig }>({});

export const relaySearchRelays = [
	//'wss://tes'
	//'wss://relay.nostr.band'
	//	'wss://nos.lol',
	//'wss://relay.nostr.wirednet.jp'

	//参考 https://nostter.app/nevent1qqsy739r2nqh59p8w4ufwf7ujtp4qxdwjae3uexk5fhn3pf4ntreq8q77psv7
	//kind 0 (ユーザのプロフィール) と kind 10002 (利用中のリレーリスト) 特化
	'wss://directory.yabu.me',
	'wss://purplepag.es', //https://purplepag.es/what
	'wss://relay.nostr.band',
	'wss://nos.lol',
	//kind:3
	'wss://relayable.org'
];

export const defaultRelays = [
	//'wss://tes'
	//'wss://relay.nostr.wirednet.jp'
	'wss://relay.nostr.band',
	'wss://nos.lol',
	'wss://relayable.org',
	'wss://nostr.bitcoiner.social'
];

//feedback送信用のリレー
export const feedbackRelay = [
	'wss://nos.lol',
	'wss://relay.nostr.wirednet.jp',
	'wss://relayable.org',
	'wss://relay.nostr.band/'
];
