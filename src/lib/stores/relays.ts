import type { Event as NostrEvent } from 'nostr-tools';
import { writable } from 'svelte/store';
//search relay 各ノートの内容を取得するためのリレー
//bookmark relay ブックマークの取得、書き込みに使うリレー
//post relay 共有、引用ポスト用のリレー
export interface RelayConfig {
	searchRelays: string[];
	bookmarkRelays: string[];
	postRelays: string[];
	relayEvent: NostrEvent | undefined;
}

//しょきか
export const initRelaySet: RelayConfig = {
	searchRelays: [],
	bookmarkRelays: [],
	postRelays: [],
	relayEvent: undefined
};
//参考 https://nostter.app/nevent1qqsy739r2nqh59p8w4ufwf7ujtp4qxdwjae3uexk5fhn3pf4ntreq8q77psv7
export const relaySet = writable<{ [pubkey: string]: RelayConfig }>({});
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

export interface RelayInfo {
	name: string;
	description: string;
	pubkey: string;
	contact: string;
	supported_nips: number[];
	software: string;
	version: string;
	relay_countries?: string[];
	icon?: string;
	limitation?: {
		max_message_length?: number;
		max_subscriptions?: number;
		max_filters?: number;
		max_limit?: number;
		max_subid_length?: number;
		min_prefix?: number;
		max_event_tags?: number;
		max_content_length?: number;
		min_pow_difficulty?: number;
		auth_required?: boolean;
		payment_required?: boolean;
	};
	payments_url?: string;
	fees?: object;
}

export const relayStore = writable(new Map<string, RelayInfo>());
