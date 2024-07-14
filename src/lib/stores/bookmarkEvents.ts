import { writable } from 'svelte/store';
import type { Event } from 'nostr-tools';

import type Nostr from 'nostr-typedef';
import type { TextPart } from '$lib/content';
import type { ConnectionState, RxNostr } from 'rx-nostr';
import type { QueryClient } from '@tanstack/svelte-query';
interface IdentifierList {
	[pubkey: string]: {
		[kind: number]: Identifiers[];
	};
}
export interface MapIdentifierList {
	[pubkey: string]: {
		[kind: number]: Map<string, Identifiers>;
	};
}
export interface Identifiers {
	identifier: string | undefined;
	title: string | undefined;
	image: string | undefined;
	description: string | undefined;
}
interface EventLists {
	[pubkey: string]: {
		[kind: number]: Nostr.Event[];
	};
}
export interface MapEventLists {
	[pubkey: string]: {
		[kind: number]: Map<string, Nostr.Event>; // Nostr.Event[];
	};
}

export const identifierListsMap = writable<MapIdentifierList>({});
export const identifierKeysArray = writable<string[]>([]);
export const eventListsMap = writable<MapEventLists>({});
export const keysArray = writable<string[]>([]);

export const rx = writable<RxNostr>();
export const queryClient = writable<QueryClient>();
//とりあえず監視してる分全部のrelayStateを保管しておいて表示させるやつ（$relaySet(pubkey).bookmarkRelays）とかのリレーごとにstateがどうか探しに来る感じで
export const relayState = writable(new Map<string, ConnectionState>());

//export const bookmarkEvents = writable<EventLists>({});
//export const identifierList = writable<IdentifierList>({});

//identifierListはぶくまの変更があったとこだけでやるからここでのこれはなし～～
//dタグがあったらそれを、なかったら（なかったらそもそもリストになってないけど）nonameでだす
// bookmarkEvents.subscribe(($bookmarkEvents) => {
// 	const newIdentifierList =
// 		$bookmarkEvents?.map((item) => {
// 			const tag = item.tags.find((tag) => tag[0] === 'd');
// 			const title = item.tags.find((tag) => tag[0] === 'title');
// 			const image = item.tags.find((tag) => tag[0] === 'image');
// 			const description = item.tags.find((tag) => tag[0] === 'description');
// 			return {
// 				identifier: tag ? tag[1] : undefined,
// 				title: title ? title[1] : undefined,
// 				image: image ? image[1] : undefined,
// 				description: description ? description[1] : undefined
// 			};
// 		}) ?? [];
// 	identifierList.set(newIdentifierList);
// });

export const listNum = writable<number>(0);
export const checkedIndexList = writable<
	{ index: number; event: Event | {}; tagArray: string[] }[]
>([]);

export interface OgpList {
	[url: string]: Ogp;
}
export interface Ogp {
	title: string;
	image: string;
	description: string;
	favicon: string;
}
export interface NaddrStore {
	[naddr: string]: Nostr.Event<number>;
}
interface ContentStore {
	[id: string]: TextPart[];
}
export const ogpStore = writable<OgpList>({});
export const naddrStore = writable<NaddrStore>({});
export const contentStore = writable(new Map<string, TextPart[]>());

export const JsonEventData = writable<Nostr.Event>();

export interface ClientInfo {}
export const clientMap = writable(new Map<string[], ClientInfo>());

export const nostrEvents = writable(new Map<string, Nostr.Event>());
