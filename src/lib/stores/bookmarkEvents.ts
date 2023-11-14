import { writable } from 'svelte/store';
import type { Event } from 'nostr-tools';
import type { Nostr } from 'nosvelte';
import type { TextPart } from '$lib/content';

interface IdentifierList {
	identifier: string | undefined;
	title: string | undefined;
	image: string | undefined;
	summary: string | undefined;
}
export const bookmarkEvents = writable<Event[]>([]);
export const identifierList = writable<IdentifierList[]>([]);
//dタグがあったらそれを、なかったら（なかったらそもそもリストになってないけど）nonameでだす
bookmarkEvents.subscribe(($bookmarkEvents) => {
	const newIdentifierList =
		$bookmarkEvents?.map((item) => {
			const tag = item.tags.find((tag) => tag[0] === 'd');
			const title = item.tags.find((tag) => tag[0] === 'title');
			const image = item.tags.find((tag) => tag[0] === 'image');
			const summary = item.tags.find((tag) => tag[0] === 'summary');
			return {
				identifier: tag ? tag[1] : undefined,
				title: title ? title[1] : undefined,
				image: image ? image[1] : undefined,
				summary: summary ? summary[1] : undefined
			};
		}) ?? [];
	identifierList.set(newIdentifierList);
});

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
