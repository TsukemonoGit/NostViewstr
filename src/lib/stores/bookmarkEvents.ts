import { writable } from 'svelte/store';
import type { Event } from 'nostr-tools';
import type { Nostr } from 'nosvelte';
import type { TextPart } from '$lib/content';

export const bookmarkEvents = writable<Event[]>([]);
export const identifierList = writable<string[]>([]);
//dタグがあったらそれを、なかったら（なかったらそもそもリストになってないけど）nonameでだす
bookmarkEvents.subscribe(($bookmarkEvents) => {
	const newIdentifierList =
		$bookmarkEvents?.map((item) => {
			const tag = item.tags.find((tag) => tag[0] === 'd');
			return tag ? tag[1] : 'nondame';
		}) ?? [];
	identifierList.set(newIdentifierList);
});

export const listNum = writable<number>(0);
export const checkedIndexList = writable<
	{ index: number; event: Event | {} }[]
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
