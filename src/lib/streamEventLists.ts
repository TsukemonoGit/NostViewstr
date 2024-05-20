import { _ } from 'svelte-i18n';

import type { Observer, Observable } from 'rxjs';

import {
	createRxNostr,
	uniq,
	verify,
	createRxForwardReq,
	createRxBackwardReq,
	nip07Signer
} from 'rx-nostr';
import { derived, get, writable } from 'svelte/store';
import {
	type Identifiers,
	eventListsMap,
	type MapEventLists,
	identifierListsMap,
	type MapIdentifierList,
	rx,
	relayState
} from './stores/bookmarkEvents';
import { formatResults, getPub, setRelays, signEv } from './nostrFunctions';
import {
	getEventHash,
	generatePrivateKey,
	getPublicKey,
	nip04,
	SimplePool,
	getSignature,
	verifySignature
} from 'nostr-tools';
import { nsec, pubkey_viewer } from './stores/settings';
import { feedbackRelay, relaySet } from './stores/relays';
import type {
	ConnectionState,
	DefaultRelayConfig,
	EventPacket,
	RxReq,
	RxReqOverable,
	RxReqPipeable
} from 'rx-nostr';
import type { ReqResult, ReqStatus, RxReqBase, UseReqOpts } from './types';
import {
	createQuery,
	useQueryClient,
	type QueryClient
} from '@tanstack/svelte-query';
import type Nostr from 'nostr-typedef';
import type { EventParameters, Filter } from 'nostr-typedef';
import type { RelayStatus } from 'rx-nostr/types/src/rx-nostr/interface';

const reconnectableStates: ConnectionState[] = [
	//https://penpenpng.github.io/rx-nostr/v2/monitoring-connections.html
	//"initialized",  //初期状態,
	//"connecting",  //自動再接続以外の理由で接続を試みている,
	//"connected",  //接続状態,
	//"retrying",  //再接続を試みている,
	//'waiting-for-retrying', //再接続待機中
	//'dormant', //休眠中,//BackwardReqが終わったあともこれになるっぽい？やることないなったとき？
	'error', //エラー終了,
	'rejected' //エラー終了,
	//'terminated' //終了状態,
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
rx.set(rxNostr);

rxNostr.createConnectionStateObservable().subscribe((packet) => {
	let tmp = get(relayState);

	tmp.set(packet.from, packet.state);
	relayState.set(tmp);
});

export async function setDefaultRelays(relays: string[]) {
	rxNostr.setDefaultRelays(relays);
	// relayList.set(rxNostr.getDefaultRelays());
	// // relayStateを初期化
	// const newRelayState = new Map<string, ConnectionState>();

	// // 各リレーのステータスを取得して、接続されているもののみを追加
	// Object.entries(rxNostr.getDefaultRelays()).forEach(([key, item]) => {
	// 	const status = rxNostr.getRelayStatus?.(item?.url);
	// 	if (status?.connection) {
	// 		newRelayState.set(item.url, status.connection);
	// 	}
	// });

	// // 更新されたrelayStateをセット
	// relayState.set(newRelayState);
}

export async function ReconnectRelay(relay: string) {
	console.log('reconnecting');
	rxNostr.reconnect(relay);
}

export async function GetRelayState(relay: string) {
	return (rxNostr.getRelayStatus(relay) as RelayStatus).connection;
}

export function GetAllRelayState() {
	return rxNostr.getAllRelayStatus().connection;
}

export async function RelaysReconnectChallenge() {
	const allRelay = rxNostr.getDefaultRelays();
	if (!allRelay) return;
	const status = Object.entries(allRelay);
	if (status.length <= 0) {
		return;
	}
	//console.log(status);

	status.forEach(([relayUrl, state]) => {
		if (
			rxNostr.getRelayStatus(relayUrl)?.connection === undefined ||
			reconnectableStates.includes(
				rxNostr.getRelayStatus(relayUrl)?.connection as ConnectionState
			)
		) {
			rxNostr.reconnect(relayUrl);
		}
	});
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

	//console.log('[get relays]', rxNostr.getDefaultRelays());

	//console.log(relays);

	//ブクマを読み込むりれーと書き込みリレー違う場合があるからーーーーー
	//この段階で閲覧者のリレー情報がわかってたらここでwriteリレー情報も入る
	//なかったらとりあえずreadだけtrueのはず
	//書き込みは一時リレーでやるにする？
	// const viewerRelay = get(relaySet)[get(pubkey_viewer)]?.postRelays ?? [];
	// console.log(data.relays);
	// console.log(viewerRelay);
	//const merges = mergeRelays(viewerRelay, data.relays);
	//if( Object.entries(rxNostr.getDefaultRelays())!==merges){
	setDefaultRelays(data.relays);
	//}
	// const tmp = get(relayState);
	// console.log('[get relays]', rxNostr.getDefaultRelays());
	// Object.entries(rxNostr.getDefaultRelays()).forEach(([url, config]) => {
	// 	const relayStatus = rxNostr.getRelayStatus(url);
	// 	if (relayStatus !== undefined) {
	// 		tmp.set(url, relayStatus.connection);
	// 	}
	// });
	// console.log('[get states]', tmp);
	// relayState.set(tmp);

	const rxReq = createRxForwardReq();

	// データの購読
	const observable = rxNostr.use(rxReq).pipe(uniq(), verify());

	// オブザーバーオブジェクトの作成
	const observer: Observer<any> = {
		next: (packet: EventPacket) => {
			console.log('[rx-nostr packet]', packet);

			if (packet.event.kind === 10002) {
				setRelayEvent(packet);
			}
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
	rxReq.emit(data.filters);
}

export async function publishEventWithTimeout(
	obj: Nostr.Event,
	relays: string[],
	userCheck: boolean = true,
	timeout: number = 3000
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
	if (userCheck) {
		const pubkey = await getPub(true); //書き込みたいときには再度のNIP46チェックも含む
		if (obj.pubkey === '') {
			obj.pubkey = pubkey;
		} else if (obj.pubkey !== pubkey) {
			console.log('ログイン中のpubとsignEvのpubが違う');

			return { isSuccess: false, msg: 'login error' };
		}
	}

	try {
		let event = obj;
		if (event?.id == undefined || event?.id == '') {
			event.id = getEventHash(event);
		}
		if (!event.sig || event.sig === '') {
			// //event.sigが""でもサインしてくれないみたいなので
			// const tmpEvent: EventParameters<number> = {
			// 	id: event.id,
			// 	pubkey: event.pubkey,
			// 	content: event.content,
			// 	tags: event.tags,
			// 	created_at: event.created_at,
			// 	kind: event.kind
			// };

			// event = await nip07Signer().signEvent(tmpEvent);
			event = await signEv(event);
		}
		console.log(event);
		if (!verifySignature(event)) {
			return { isSuccess: false, msg: 'error' };
		}

		const result = await Promise.race([
			new Promise<{
				isSuccess: boolean;
				msg: string;
				event?: Nostr.Event;
			}>((resolve) => {
				const subscription = rxNostr.send(event, { relays: relays }).subscribe({
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
					},
					error: () => {
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

// function mergeRelays(
// 	writeRelays: string[],
// 	readRelays: string[]
// ): { [url: string]: { read: boolean; write: boolean } } {
// 	const result: { [url: string]: { read: boolean; write: boolean } } = {};

// 	const uniqueRelays = Array.from(new Set([...writeRelays, ...readRelays]));

// 	for (const url of uniqueRelays) {
// 		result[url] = {
// 			read: readRelays.includes(url),
// 			write: writeRelays.includes(url)
// 		};
// 	}
// 	connectingRelays.set(result);
// 	console.log(result);
// 	return result;
// }

function addsetRelays(relays: string[]): {
	[url: string]: { read: boolean; write: boolean };
} {
	// const tmp = Object.fromEntries(
	// 	rxNostr.getDefaultRelays().map(({ url, read, write }) => [url, { read, write }])
	// );
	const tmp: Record<string, DefaultRelayConfig> = rxNostr.getDefaultRelays();
	relays.forEach((relay) => {
		if (tmp[relay]) {
			// tmpがrelay要素を持っていた場合
			tmp[relay].write = true;
		} else {
			// tmpがrelay要素を持っていなかった場合
			tmp[relay] = { url: relay, read: false, write: true };
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

export async function sendMessage(message: string, pubhex: string) {
	if (!pubhex) {
		throw Error;
	}
	const sk = generatePrivateKey();
	const pk = getPublicKey(sk);
	const encryptedMessage = await nip04.encrypt(sk, pubhex, message);
	const pool = new SimplePool();
	const ev = {
		kind: 4,
		created_at: Math.floor(Date.now() / 1000),
		tags: [['p', pubhex]],

		content: encryptedMessage,
		pubkey: pk,
		sig: '',
		id: ''
	};
	ev.sig = getSignature(ev, sk);
	ev.id = getEventHash(ev);
	//サイン無しでrxnostrでやれないから
	await Promise.any(pool.publish(feedbackRelay, ev));
	pool.close(feedbackRelay);
}

//------------------------------------------------------------------------------------------------------------------------以下
/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 * @license This code is a derivative work based on code licensed under the Apache License, Version 2.0.
 */

export function useReq<A>(
	{ queryKey, filters, operator, req, initData }: UseReqOpts<A>,
	relay: string[] | undefined = undefined
): ReqResult<A> {
	const queryClient: QueryClient = useQueryClient();
	// if (Object.keys(rxNostr.getDefaultRelays()).length === 0) {
	// 	queryClient.setQueryData(queryKey, initData);
	// 	return {
	// 		data: readable<A>(initData),
	// 		status: readable('success'),
	// 		error: readable()
	// 	};
	// }

	let _req:
		| RxReqBase
		| (RxReq<'backward'> & {
				emit(
					filters: Filter | Filter[],
					options?:
						| {
								relays: string[];
						  }
						| undefined
				): void;
		  } & RxReqOverable &
				RxReqPipeable);

	if (req) {
		_req = req;
	} else {
		_req = createRxBackwardReq();
	}

	const status = writable<ReqStatus>('loading');
	const error = writable<Error>();

	const obs: Observable<A> = rxNostr
		.use(_req, { relays: relay })
		.pipe(operator);
	const query = createQuery({
		queryKey: queryKey,
		queryFn: (): Promise<A> => {
			return new Promise((resolve, reject) => {
				let fulfilled = false;

				obs.subscribe({
					next: (v: A) => {
						//console.log(v);
						if (fulfilled) {
							queryClient.setQueryData(queryKey, v);
						} else {
							resolve(v);
							fulfilled = true;
						}
					},
					complete: () => status.set('success'),
					error: (e) => {
						console.error('[rx-nostr]', e);
						status.set('error');
						error.set(e);

						if (!fulfilled) {
							reject(e);
							fulfilled = true;
						}
					}
				});
				_req.emit(filters);
			});
		}
	});

	return {
		data: derived(query, ($query) => $query.data, initData),
		status: derived([query, status], ([$query, $status]) => {
			if ($query.isSuccess) {
				return 'success';
			} else if ($query.isError) {
				return 'error';
			} else {
				return $status;
			}
		}),
		error: derived([query, error], ([$query, $error]) => {
			if ($query.isError) {
				return $query.error;
			} else {
				return $error;
			}
		})
	};
}

function setRelayEvent(eventPacket: EventPacket) {
	const pub = eventPacket.event.pubkey;
	const tmp = get(relaySet)[pub];
	if (
		!tmp ||
		(tmp.relayEvent && eventPacket.event.created_at > tmp.relayEvent.created_at)
	) {
		console.log('tesr');
		setRelays(pub, { 10002: eventPacket.event });
	}
}
