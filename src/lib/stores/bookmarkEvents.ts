import { writable } from 'svelte/store';
import type { Event } from 'nostr-tools';
import type { Nostr } from 'nosvelte';
import type { TextPart } from '$lib/content';
import type { ConnectionState } from 'rx-nostr';
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
//export const relayState = writable(new Map<string, ConnectionState>());

export const connectingRelays = writable<{
	[url: string]: {
		read: boolean;
		write: boolean;
	};
}>();
export const relayState = writable<{ [relayURL: string]: ConnectionState }>();
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

interface OgpList {
	[url: string]: {
		title: string;
		image: string;
		description: string;
		favicon: string;
	};
}

export interface NaddrStore {
	[naddr: string]: Nostr.Event<number>;
}
interface ContentStore {
	[id: string]: TextPart[];
}
export const ogpStore = writable<OgpList>({});
export const naddrStore = writable<NaddrStore>({});
export const contentStore = writable<ContentStore>({});

export const JsonEventData = writable<Nostr.Event>();

export interface ClientInfo {}
export const clientMap = writable(new Map<string[], ClientInfo>());
