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
	relayState,
	connectingRelays
} from './stores/bookmarkEvents';
import { formatResults, getPub } from './nostrFunctions';
import { getEventHash } from 'nostr-tools';
import { nsec, pubkey_viewer } from './stores/settings';
import { relaySet } from './stores/relays';
import type { ConnectionState } from 'rx-nostr';
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
	let tmp: { [relayURL: string]: ConnectionState } = get(relayState);

	if (tmp) {
		tmp[packet.from] = packet.state;
		relayState.set(tmp);
	} else {
		tmp = Object.assign({}, tmp, { [packet.from]: packet.state });
		relayState.set(tmp);
	}

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
	// for (const relayKey of get(relayState).keys()) {
	// 	if (!data.relays.includes(relayKey)) {
	// 		// data.relaysに含まれないrelayのエントリを削除
	// 		get(relayState).delete(relayKey);
	// 	}
	// }

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

	//ブクマを読み込むりれーと書き込みリレー違う場合があるからーーーーー
	const viewerRelay = get(relaySet)[get(pubkey_viewer)]?.postRelays ?? [];

	rxNostr.setRelays(mergeRelays(viewerRelay, data.relays));

	console.log('[get relays]', rxNostr.getRelays());
	relayState.set(rxNostr.getAllRelayState());

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

export async function publishEventWithTimeout(
	obj: Nostr.Event,
	relays: string[],
	timeout: number = 5000
): Promise<{
	isSuccess: boolean;
	event?: Nostr.Event;
	msg: string;
}> {
	if (relays.length === 0) {
		console.error('relay設定されてない');
		return { isSuccess: false, msg: 'relayが設定されていません' };
	}
	let isSuccess = false;
	const msgObj: { [relay: string]: boolean } = {};
	relays.forEach((relay) => {
		msgObj[relay] = false;
	});
	console.log(obj);

	const pubkey = await getPub();
	if (obj.pubkey === '') {
		obj.pubkey = pubkey;
	} else if (obj.pubkey !== pubkey) {
		console.log('ログイン中のpubとsignEvのpubが違う');

		return { isSuccess: false, msg: 'login error' };
	}

	try {
		// const t: ToastSettings = {
		// 	message: `publishing ...`
		// };
		// const publishingToast = toastStore.trigger(t);
		const event = obj;
		event.id = getEventHash(event);
		console.log(event);

		//ブクマを読み込むりれーと書き込みリレー違う場合があるからーーーーー
		const viewerRelay = get(relaySet)[get(pubkey_viewer)]?.postRelays ?? [];

		rxNostr.setRelays(mergeRelays(viewerRelay, relays));

		console.log('[get relays]', rxNostr.getRelays());

		//await rxNostr.setRelays(relays); //[...relays, 'wss://test']);
		const sec = get(nsec);
		const result = await Promise.race([
			new Promise<{
				isSuccess: boolean;
				msg: string;
				event?: Nostr.Event;
			}>((resolve) => {
				const subscription = rxNostr.send(event, sec).subscribe({
					next: (packet) => {
						//	console.log(packet);
						msgObj[packet.from] = true;
						isSuccess = true;
					},
					complete: () => {
						resolve({
							isSuccess,
							event: event,
							msg: formatResults(msgObj)
						});
					}
				});
			}),
			new Promise<{
				isSuccess: boolean;
				msg: string;
				event?: Nostr.Event;
			}>((resolve) => {
				setTimeout(() => {
					const hasTrue = Object.values(msgObj).some((value) => value === true);
					console.log(
						'timeout',
						event,
						formatResults(msgObj),
						hasTrue,
						isSuccess
					);
					resolve({
						isSuccess: hasTrue,
						event: event,
						msg: formatResults(msgObj)
					});
				}, timeout);
			})
		]);
		//	toastStore.close(publishingToast);
		return result;
	} catch (error) {
		return { isSuccess: false, msg: 'まだ書き込みできないよ' };
	}
}

function mergeRelays(
	writeRelays: string[],
	readRelays: string[]
): { [url: string]: { read: boolean; write: boolean } } {
	const result: { [url: string]: { read: boolean; write: boolean } } = {};

	const uniqueRelays = Array.from(new Set([...writeRelays, ...readRelays]));

	for (const url of uniqueRelays) {
		result[url] = {
			read: readRelays.includes(url),
			write: writeRelays.includes(url)
		};
	}
	connectingRelays.set(result);
	console.log(result);
	return result;
}
