import { _ } from 'svelte-i18n';

import type { Observer } from 'rxjs';

import {
	createRxNostr,
	Nostr,
	uniq,
	verify,
	createRxForwardReq
} from 'rx-nostr';
import { get } from 'svelte/store';
import {
	type Identifiers,
	eventListsMap,
	type MapEventLists,
	identifierListsMap,
	type MapIdentifierList,
	relayState
} from './stores/bookmarkEvents';

let storedEventsData: MapEventLists;
eventListsMap.subscribe((value) => {
	storedEventsData = value;
});
let storedIdentifiersData: MapIdentifierList;
identifierListsMap.subscribe((value) => {
	storedIdentifiersData = value;
});

const rxNostr = createRxNostr();
rxNostr.createConnectionStateObservable().subscribe((packet) => {
	get(relayState).set(packet.from, packet.state);
	console.log(packet);
	console.log(get(relayState));
});

export async function ReconnectRelay(relay: string) {
	console.log('reconnecting');
	rxNostr.reconnect(relay);
}
export async function GetRelayState(relay: string) {
	return rxNostr.getRelayState(relay);
}

//export const eventListsMap = writable(new Map<string, Nostr.Event>());---------------------------------------------------------------
export async function StoreFetchFilteredEvents(
	pubkey: string,
	kind: number,
	data: {
		relays: string[];
		filters: Nostr.Filter[];
	}
) {
	// relayStateのすべてのキーに対して処理
	for (const relayKey of get(relayState).keys()) {
		if (!data.relays.includes(relayKey)) {
			// data.relaysに含まれないrelayのエントリを削除
			get(relayState).delete(relayKey);
		}
	}

	let eventsData = get(eventListsMap);

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

	console.log('[get relays]', rxNostr.getRelays());
	console.log('[get states]', rxNostr.getAllRelayState());
	//console.log(relays);

	rxNostr.setRelays(data.relays);

	const rxReq = createRxForwardReq();
	rxReq.emit(data.filters);

	// データの購読
	const observable = rxNostr.use(rxReq).pipe(uniq(), verify());

	// オブザーバーオブジェクトの作成
	const observer: Observer<any> = {
		next: (packet: { event: Nostr.Event<number> }) => {
			console.log('[rx-nostr packet]', packet);

			if (kind >= 30000 && kind < 40000) {
				//30000代の場合のキー値はdタグのあたい
				const key = packet.event.tags.find((item) => item[0] === 'd');
				if (key) {
					const check = storedEventsData[pubkey][kind].get(key[1])?.created_at;

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

						storedIdentifiersData[pubkey][kind].set(key[1], newIdentifierList);
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

						storedIdentifiersData[pubkey][kind].set(key[1], newIdentifierList);
						identifierListsMap.set(storedIdentifiersData);
					}
				}
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
			//console.log(storedEventsData, get(eventListsMap));
		},
		error: (error) => {
			console.log('Error occurred:', error);
		},
		complete: () => {
			console.log('Subscription completed');
		}
	};

	// 購読開始
	const subscription = observable.subscribe(observer);
}
