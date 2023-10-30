import { writable } from 'svelte/store';
import type { Event } from 'nostr-tools';
import type { Nostr } from 'nosvelte';
import type { TextPart } from '$lib/content';

export const bookmarkEvents = writable<Event[] | undefined>();

export const checkedIndexList = writable<{ index: number; event: Event }[]>([]);

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
