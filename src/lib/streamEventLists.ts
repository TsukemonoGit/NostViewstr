interface Window {
	// NIP-07
	nostr: any;
	open: any;
}
declare let window: Window;

import { _ } from 'svelte-i18n';
import {
	SimplePool,
	getEventHash,
	getPublicKey,
	getSignature,
	nip04,
	nip19,
	validateEvent,
	verifiedSymbol,
	verifySignature
} from 'nostr-tools';
import type { AddressPointer } from 'nostr-tools/lib/types/nip19';

import type { Event as NostrEvent } from 'nostr-tools';
import { pubkey_viewer, nsec, nowProgress } from './stores/settings';
import type { Observer } from 'rxjs';

import {
	createRxNostr,
	createRxOneshotReq,
	Nostr,
	uniq,
	verify,
	latest,
	completeOnTimeout,
	latestEach,
	createRxForwardReq,
	type EventPacket
} from 'rx-nostr';
import { get } from 'svelte/store';
import {
	naddrStore,
	type Identifiers,
	type NaddrStore,
	eventListsMap,
	type MapEventLists,
	identifierListsMap,
	type MapIdentifierList
} from './stores/bookmarkEvents';
import {
	//bookmarkRelays,
	defaultRelays,
	initRelaySet,
	//	postRelays,
	//relayEvent,
	relaySearchRelays,
	relaySet,
	relayStore
	//searchRelays
} from './stores/relays';
import type { ToastSettings } from '@skeletonlabs/skeleton';
import { toastStore } from './stores/store';

let storedEventsData: MapEventLists;
eventListsMap.subscribe((value) => {
	storedEventsData = value;
});
let storedIdentifiersData: MapIdentifierList;
identifierListsMap.subscribe((value) => {
	storedIdentifiersData = value;
});
//export const eventListsMap = writable(new Map<string, Nostr.Event>());---------------------------------------------------------------
export async function StoreFetchFilteredEvents(
	pubkey: string,
	kind: number,
	data: {
		relays: string[];
		filters: Nostr.Filter[];
	}
) {
	nowProgress.set(true);
	let eventsData = get(eventListsMap);
	try {
		const check = eventsData[pubkey][kind]; // すでにデータがあるか確認
		if (check.size === 0) {
			throw new Error();
		}
		// データがある場合は何もせず終了
		nowProgress.set(false);
		return;
	} catch (error) {
		// データがない場合にデータを取得する
		if (!eventsData[pubkey]) {
			eventsData = { ...eventsData, [pubkey]: {} };
		}
		// データを入れる場所を作る
		if (!eventsData[pubkey][kind]) {
			// 新しい空のオブジェクトを作成し、それを kind プロパティに設定
			eventsData[pubkey][kind] = new Map<string, Nostr.Event>();
		}

		if (!storedEventsData[pubkey]) {
			storedEventsData = { ...storedEventsData, [pubkey]: {} };
		}
		// データを入れる場所を作る
		if (!storedEventsData[pubkey][kind]) {
			// 新しい空のオブジェクトを作成し、それを kind プロパティに設定
			storedEventsData[pubkey][kind] = new Map<string, Nostr.Event>();
		}

		if (!storedIdentifiersData[pubkey]) {
			storedIdentifiersData = { ...storedIdentifiersData, [pubkey]: {} };
		}
		// データを入れる場所を作る
		if (!storedIdentifiersData[pubkey][kind]) {
			// 新しい空のオブジェクトを作成し、それを kind プロパティに設定
			storedIdentifiersData[pubkey][kind] = new Map<string, Identifiers>();
		}

		const rxNostr = createRxNostr();
		//console.log(relays);

		rxNostr.setRelays(data.relays);

		console.log('[rx-nostr getRelays]', rxNostr.getRelays());
		const rxReq = createRxForwardReq();
		rxReq.emit(data.filters);
		//	console.log(filters[0].kinds);
		// データの購読
		const observable = rxNostr.use(rxReq).pipe(uniq(), verify());

		//let eventList: Nostr.Event<number>[] = [];
		// オブザーバーオブジェクトの作成
		const observer: Observer<any> = {
			next: (packet: { event: Nostr.Event<number> }) => {
				console.log('[rx-nostr packet]', packet);

				if (kind >= 30000 && kind < 40000) {
					//30000代の場合のキー値はdタグのあたい
					const key = packet.event.tags.find((item) => item[0] === 'd');
					if (key) {
						const check = storedEventsData[pubkey][kind].get(
							key[1]
						)?.created_at;

						if (!storedEventsData[pubkey][kind].has(key[1])) {
							storedEventsData[pubkey][kind].set(key[1], packet.event);
							eventListsMap.set(storedEventsData);

							const tag = packet.event.tags.find((tag) => tag[0] === 'd');
							const title = packet.event.tags.find((tag) => tag[0] === 'title');
							const image = packet.event.tags.find((tag) => tag[0] === 'image');
							const description = packet.event.tags.find(
								(tag) => tag[0] === 'description'
							);
							const newIdentifierList: Identifiers = {
								identifier: tag ? tag[1] : undefined,
								title: title ? title[1] : undefined,
								image: image ? image[1] : undefined,
								description: description ? description[1] : undefined
							};

							storedIdentifiersData[pubkey][kind].set(
								key[1],
								newIdentifierList
							);
							identifierListsMap.set(storedIdentifiersData);
						} else if (
							storedEventsData[pubkey][kind].has(key[1]) &&
							check &&
							packet.event.created_at > check
						) {
							storedEventsData[pubkey][kind].set(key[1], packet.event);

							eventListsMap.set(storedEventsData);

							const tag = packet.event.tags.find((tag) => tag[0] === 'd');
							const title = packet.event.tags.find((tag) => tag[0] === 'title');
							const image = packet.event.tags.find((tag) => tag[0] === 'image');
							const description = packet.event.tags.find(
								(tag) => tag[0] === 'description'
							);
							const newIdentifierList: Identifiers = {
								identifier: tag ? tag[1] : undefined,
								title: title ? title[1] : undefined,
								image: image ? image[1] : undefined,
								description: description ? description[1] : undefined
							};

							storedIdentifiersData[pubkey][kind].set(
								key[1],
								newIdentifierList
							);
							identifierListsMap.set(storedIdentifiersData);
						}
					}
					//eventsData[pubkey][kind]
				} else {
					console.log(kind);
					const check = storedEventsData[pubkey]?.[kind]?.get(
						kind.toString()
					)?.created_at;
					if (!storedEventsData[pubkey]?.[kind].has(kind.toString())) {
						storedEventsData[pubkey][kind].set(kind.toString(), packet.event);
						eventListsMap.set(storedEventsData);
					} else if (
						storedEventsData[pubkey]?.[kind].has(kind.toString()) &&
						check &&
						packet.event.created_at > check
					) {
						storedEventsData[pubkey][kind].set(kind.toString(), packet.event);
						eventListsMap.set(storedEventsData);
					}
				}
				console.log(storedEventsData, get(eventListsMap));
			},
			error: (error) => {
				console.error('Error occurred:', error);
			},
			complete: () => {
				console.log('Subscription completed');
			}
		};

		// 購読開始
		const subscription = observable.subscribe(observer);
	}
}
