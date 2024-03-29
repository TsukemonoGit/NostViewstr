import { _ } from 'svelte-i18n';

import type { Observer } from 'rxjs';

import { createRxNostr, uniq, verify, createRxForwardReq } from 'rx-nostr';
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
import { formatResults, getPub, signEv } from './nostrFunctions';
import { getEventHash } from 'nostr-tools';
import { nsec, pubkey_viewer } from './stores/settings';
import { relaySet } from './stores/relays';
import type { ConnectionState } from 'rx-nostr';
import type { Nostr } from 'nosvelte';

const reconnectableStates: ConnectionState[] = [
	'reconnecting', //りこねくてぃんぐ表示から変化しないようにみえるから追加してみる
	'not-started',
	'error',
	//'rejected',
	'terminated'
	//'waiting-for-retrying',
	//'retrying',
	//'dormant'
];

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

export function GetAllRelayState() {
	return rxNostr.getAllRelayState();
}

export async function RelaysReconnectChallenge() {
	const states = Object.entries(rxNostr.getAllRelayState());
	console.log('[relay states]', states);

	const reconnectableCount = states.filter(([relayUrl, state]) =>
		reconnectableStates.includes(state)
	).length;
	console.log(reconnectableCount, states.length);
	if (reconnectableCount / states.length >= 2 / 3) {
		//設定中のリレーの2/3以上が接続切れてたらセットし直してみる
		const tmp = Object.fromEntries(
			rxNostr.getRelays().map(({ url, read, write }) => [url, { read, write }])
		);
		//すでにセットされてる場合は何もおこらないっぽい？ので一度全部外す
		rxNostr.switchRelays({});
		rxNostr.switchRelays(tmp);

		// states.forEach(([relayUrl, state]) => {
		//   if (reconnectableStates.includes(state)) {
		//     rxNostr.reconnect(relayUrl);
		//   }
		// });
	}
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
	//この段階で閲覧者のリレー情報がわかってたらここでwriteリレー情報も入る
	//なかったらとりあえずreadだけtrueのはず
	const viewerRelay = get(relaySet)[get(pubkey_viewer)]?.postRelays ?? [];
	console.log(data.relays);
	console.log(viewerRelay);
	//const merges = mergeRelays(viewerRelay, data.relays);
	//if( Object.entries(rxNostr.getRelays())!==merges){
	rxNostr.switchRelays(mergeRelays(viewerRelay, data.relays));
	//}
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
				const key = packet.event.tags.find((item: string[]) => item[0] === 'd');
				if (key) {
					const check = storedEventsData[pubkey][kind].get(key[1])?.created_at;

					if (!storedEventsData[pubkey][kind].has(key[1])) {
						storedEventsData[pubkey][kind].set(key[1], packet.event);
						eventListsMap.set(storedEventsData);

						const tag = packet.event.tags.find(
							(tag: string[]) => tag[0] === 'd'
						);
						const title = packet.event.tags.find(
							(tag: string[]) => tag[0] === 'title'
						);
						const image = packet.event.tags.find(
							(tag: string[]) => tag[0] === 'image'
						);
						const description = packet.event.tags.find(
							(tag: string[]) => tag[0] === 'description'
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

						const tag = packet.event.tags.find(
							(tag: string[]) => tag[0] === 'd'
						);
						const title = packet.event.tags.find(
							(tag: string[]) => tag[0] === 'title'
						);
						const image = packet.event.tags.find(
							(tag: string[]) => tag[0] === 'image'
						);
						const description = packet.event.tags.find(
							(tag: string[]) => tag[0] === 'description'
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
	timeout: number = 10000
): Promise<{
	isSuccess: boolean;
	event?: Nostr.Event;
	msg: string;
}> {
	if (relays.length === 0) {
		console.error('relay設定されてない');
		return { isSuccess: false, msg: 'relayが設定されていません' };
	}
	const check = validCheck(obj);
	if (!check) {
		return { isSuccess: false, msg: '無効なイベントです' };
	}
	let isSuccess = false;
	const msgObj: { [relay: string]: boolean } = {};
	relays.forEach((relay) => {
		msgObj[relay] = false;
	});
	console.log(obj);

	const pubkey = await getPub(true); //書き込みたいときには再度のNIP46チェックも含む
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
		if (event?.id == undefined || event?.id == '') {
			event.id = getEventHash(event);
		}
		console.log(event);

		//ブクマを読み込むりれーと書き込みリレー違う場合があるからーーーーー
		//もし書き込みリレーがセットされてない場合のみこの設定を行う
		//セットされてるリレーのWriteがtrueのものがなかったら設定する
		const setting_relays = rxNostr.getRelays();
		const hasWriteTrue = setting_relays.some((item) => item.write === true);
		if (!hasWriteTrue) {
			//const viewerRelay = get(relaySet)[get(pubkey_viewer)]?.postRelays ?? [];

			rxNostr.switchRelays(addsetRelays(relays));
		}
		console.log('[get relays]', rxNostr.getRelays());

		//await rxNostr.setRelays(relays); //[...relays, 'wss://test']);
		//const sec = get(nsec);
		//console.log(sec);

		// if (sec) {
		// 	//
		// 	//	return { isSuccess: false, msg: 'まだ書き込みできないよ' };

		// 	const result = await Promise.race([
		// 		new Promise<{
		// 			isSuccess: boolean;
		// 			msg: string;
		// 			event?: Nostr.Event;
		// 		}>((resolve) => {
		// 			const subscription = rxNostr.send(event, sec).subscribe({
		// 				next: (packet) => {
		// 					console.log(packet);
		// 					msgObj[packet.from] = true;
		// 					isSuccess = true;
		// 				},
		// 				complete: () => {
		// 					resolve({
		// 						isSuccess,
		// 						event: event,
		// 						msg: formatResults(msgObj)
		// 					});
		// 				}
		// 			});
		// 		}),
		// 		new Promise<{
		// 			isSuccess: boolean;
		// 			msg: string;
		// 			event?: Nostr.Event;
		// 		}>((resolve) => {
		// 			setTimeout(() => {
		// 				const hasTrue = Object.values(msgObj).some(
		// 					(value) => value === true
		// 				);
		// 				console.log(
		// 					'timeout',
		// 					event,
		// 					formatResults(msgObj),
		// 					hasTrue,
		// 					isSuccess
		// 				);
		// 				resolve({
		// 					isSuccess: hasTrue,
		// 					event: event,
		// 					msg: formatResults(msgObj)
		// 				});
		// 			}, timeout);
		// 		})
		// 	]);
		// 	//	toastStore.close(publishingToast);
		// 	return result;
		// } else {
		const result = await Promise.race([
			new Promise<{
				isSuccess: boolean;
				msg: string;
				event?: Nostr.Event;
			}>((resolve) => {
				const subscription = rxNostr.send(event).subscribe({
					next: (packet) => {
						//	console.log('test', packet);タイムアウトまでに署名がすんでないとなぜかタイムアウト直前にokpacketがとんでくる。署名もしてないのに
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
		//}
	} catch (error) {
		return { isSuccess: false, msg: error as string };
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
function addsetRelays(relays: string[]): {
	[url: string]: { read: boolean; write: boolean };
} {
	const tmp = Object.fromEntries(
		rxNostr.getRelays().map(({ url, read, write }) => [url, { read, write }])
	);

	relays.forEach((relay) => {
		if (tmp[relay]) {
			// tmpがrelay要素を持っていた場合
			tmp[relay].write = true;
		} else {
			// tmpがrelay要素を持っていなかった場合
			tmp[relay] = { read: false, write: true };
		}
	});
	return tmp;
}
function validCheck(obj: Nostr.Event<number>): Boolean {
	//３００００台でdtagsがなかったらエラー
	if (obj.kind >= 30000 && obj.kind < 40000) {
		const index = obj.tags.findIndex((tag: string[]) => tag[0] === 'd');
		if (index === -1) {
			return false;
		}
	}
	//なんでもコンテントとtagのりょうほうが空だったらエラー
	if (obj.content === '' && obj.tags.length === 0) {
		return false;
	}
	return true;
}
