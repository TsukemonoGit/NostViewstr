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
import {
	type Observer,
	groupBy,
	map,
	mergeAll,
	type MonoTypeOperatorFunction,
	pipe,
	scan,
	Observable
} from 'rxjs';

import {
	createRxNostr,
	createRxOneshotReq,
	Nostr,
	uniq,
	verify,
	latest,
	completeOnTimeout,
	latestEach,
	type EventPacket
} from 'rx-nostr';
import { get } from 'svelte/store';
import {
	bookmarkEvents,
	identifierList,
	naddrStore,
	type Identifiers,
	type NaddrStore
} from './stores/bookmarkEvents';
import {
	//bookmarkRelays,
	defaultRelays,
	initRelaySet,
	//	postRelays,
	//relayEvent,
	relaySearchRelays,
	relaySet
	//searchRelays
} from './stores/relays';

interface Kind3Relay {
	[key: string]: {
		read: boolean;
		write: boolean;
	};
}

export function parseNaddr(tag: string[]): AddressPointer {
	const parts = tag[1].split(':');
	//console.log([tag[2]]);
	return tag.length > 2 && tag[2] !== ''
		? {
				kind: Number(parts[0]),
				pubkey: parts.length > 1 ? parts[1] : '',
				identifier: parts.length > 2 ? parts[2] : '',
				relays: [tag[2]]
		  }
		: {
				kind: Number(parts[0]),
				pubkey: parts.length > 1 ? parts[1] : '',
				identifier: parts.length > 2 ? parts[2] : ''
		  };
}

export async function getIdByTag(
	tag: string[]
): Promise<{ id: string; filter: {}; kind?: number }> {
	if (tag[0] === 'e') {
		return { id: tag[1], filter: { ids: [tag[1]] } };
	} else if (tag[0] === 'a') {
		const naddr = parseNaddr(tag);
		if (!naddr.pubkey) {
			//tagはaだけどnaddrじゃなさそう
			return { id: tag[1], filter: {} };
		}
		const filter =
			naddr.identifier.trim() !== ''
				? {
						authors: [naddr.pubkey],
						'#d': [naddr.identifier],
						kinds: [naddr.kind]
				  }
				: {
						authors: [naddr.pubkey],
						kinds: [naddr.kind]
				  };
		// console.log(naddr.kind);
		//	const res = await getEvent(naddr);
		//	if (res) {
		//		return { id: res.id, kind: naddr.kind, filter: filter };
		//	} else {
		//取得失敗
		return { id: '', kind: naddr.kind, filter: filter };
		//	}
	} else {
		//タグがa,e以外はそのままかえす
		return { id: tag[1], filter: {} };
	}
}

// let storeValue: NaddrStore;

// // Storeの値を読み込む
// naddrStore.subscribe((value) => {
// 	storeValue = value;
// });

// let searchValue: string[];
// searchRelays.subscribe((value) => {
// 	searchValue = value;
// });

async function getEvent(naddr: {
	kind: number;
	pubkey: string;
	identifier: string;
	relays?: string[];
}) {
	const addressPointer = nip19.naddrEncode({
		identifier: naddr.identifier,
		pubkey: naddr.pubkey,
		kind: naddr.kind
	});
	console.log(naddrStore);
	// naddrStoreの内容を確認し、イベントが存在しない場合のみ取得と保存を行う
	const naddrs = get(naddrStore);
	const searchR = get(relaySet)[naddr.pubkey].searchRelays;
	if (!(addressPointer in naddrs)) {
		const relays = searchR && searchR.length > 0 ? searchR : defaultRelays;
		// naddr.relays && naddr.relays.length > 0 ? naddr.relays : RelaysforSearch;
		const filter =
			naddr.identifier.trim() !== ''
				? [
						{
							authors: [naddr.pubkey],
							'#d': [naddr.identifier],
							kinds: [naddr.kind]
						}
				  ]
				: [
						{
							authors: [naddr.pubkey],
							kinds: [naddr.kind]
						}
				  ];
		const res = await fetchFilteredEvents(relays, filter);

		if (res.length > 0) {
			res.sort((a, b) => b.created_at - a.created_at);
			// 取得したイベントをnaddrStoreに保存
			naddrs[addressPointer] = res[0];
			naddrStore.set(naddrs);
			return res[0];
		}
	} else {
		return naddrs[addressPointer];
	}
}

export function windowOpen(str: string): void {
	window.open(
		// //nostr.bandはaタグでの検索ができない
		// `https://nostr.band/?q=${
		//   tagArray[0] === 'a'
		//     ? nip19.naddrEncode(parseNaddr(tagArray))
		//     : nip19.noteEncode(tagArray[1])
		// }`,
		`https://nostr.band/?q=${str}`,
		'_blank'
	);
}

///
export async function publishEventWithTimeout(
	obj: Event,
	relays: string[]
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
	//const msg: string[] = [];
	const msgObj: { [relay: string]: boolean } = {}; // リレーごとの結果を格納するオブジェクト
	// すべてのリレーの結果を初期値として false に設定
	relays.forEach((relay) => {
		msgObj[relay] = false;
	});
	console.log(obj);
	//console.log(relays);
	const pubkey = await getPub();
	if (obj.pubkey === '') {
		obj.pubkey = pubkey;
	} else if (obj.pubkey !== pubkey) {
		console.log('ログイン中のpubとsignEvのpubが違う');
		//const message = `$_('msg.nanka')`;
		return { isSuccess: false, msg: 'login error' };
	}
	try {
		const event = await signEv(obj);
		event.id = getEventHash(event);
		console.log(event);
		console.log(validateEvent(event));
		console.log(verifySignature(event));
		const rxNostr = createRxNostr();

		await rxNostr.setRelays(relays);

		// Promiseを作成してObservableを待機
		const result = await new Promise<{
			isSuccess: boolean;
			msg: string;
			event?: Nostr.Event;
		}>((resolve) => {
			rxNostr.send(event).subscribe({
				next: (packet) => {
					console.log(packet);
					msgObj[packet.from] = true;
					isSuccess = true; // packet.ok; // パケットの情報に基づいて isSuccess を設定
				},
				complete: () => {
					resolve({ isSuccess, event: event, msg: formatResults(msgObj) }); // complete時に結果を解決してresolve
				}
			});
		});

		return result;
	} catch (error) {
		return { isSuccess: false, msg: 'まだ書き込みできないよ' };
	}
}

// リレーの結果を指定の形式に整形
function formatResults(msg: { [relay: string]: boolean }): string {
	let resultString = '';
	for (const relay in msg) {
		resultString += msg[relay] ? `OK ${relay}<br/>` : `failed ${relay}<br/>`;
	}
	return resultString;
}
// ErrorOptions型の定義
type ErrorOptions = {
	isSuccess: boolean;
	event?: Nostr.Event;
	msg: string;
};

///
export async function publishEvent(
	obj: Event,
	relays: string[]
): Promise<{ isSuccess: boolean; event?: Nostr.Event; msg: string }> {
	if (relays.length === 0) {
		console.error('relay設定されてない');
		return { isSuccess: false, msg: 'relayが設定されていません' };
	}
	let isSuccess = false;
	const msgObj: { [relay: string]: boolean } = {}; // リレーごとの結果を格納するオブジェクト
	// すべてのリレーの結果を初期値として false に設定
	relays.forEach((relay) => {
		msgObj[relay] = false;
	});
	console.log(obj);
	console.log(relays);
	const pubkey = await getPub();
	if (obj.pubkey === '') {
		obj.pubkey = pubkey;
	} else if (obj.pubkey !== pubkey) {
		console.log('ログイン中のpubとsignEvのpubが違う');
		//const message = `$_('msg.nanka')`;
		return { isSuccess: false, msg: 'login error' };
	}
	try {
		const event = await signEv(obj); // window.nostr.signEvent(obj);
		event.id = getEventHash(event);

		const pool = new SimplePool();
		const pubs = pool.publish(relays, event);

		// プロミスの競合タイムアウトを設定
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => {
				reject({
					errorOptions: {
						isSuccess: isSuccess,
						event: event,
						msg: formatResults(msgObj)
					}
				});
			}, 3000); // 1.5秒のタイムアウト
		});

		const result = await Promise.race([
			Promise.allSettled(pubs),
			timeoutPromise
		]);

		if (result instanceof Error) {
			console.error('Timeout occurred');
		}

		const pubsResults: PromiseSettledResult<unknown>[] =
			await Promise.allSettled(pubs);

		pubsResults.forEach((result, index) => {
			console.log(result);
			if (result.status === 'fulfilled') {
				console.log(`success ${relays[index]} `);
				isSuccess = true;
				msgObj[relays[index]] = true;
			} else {
				console.log(`failed ${relays[index]}: ${result.reason}`);
			}
		});

		return { isSuccess: isSuccess, event: event, msg: formatResults(msgObj) };
	} catch (error) {
		if (error && typeof error === 'object' && 'errorOptions' in error) {
			const { isSuccess, event, msg } = (
				error as { errorOptions: ErrorOptions }
			).errorOptions;
			console.log('Timeout occurred');
			return { isSuccess, event, msg };
		} else {
			console.log(error);
			return { isSuccess: false, msg: `failed to publish` };
		}
	}
}

//--------------------------------------------------nip07かnsecかでやるやつ
export async function getPub(): Promise<string> {
	let myPubkey: string = '';
	const unsubscribe = pubkey_viewer.subscribe(($pubkey) => {
		myPubkey = $pubkey;
	});
	if (myPubkey && myPubkey !== '') {
		return myPubkey;
	} else {
		//const sec = localStorage.getItem('nsec');
		const sec = get(nsec);
		if (sec && sec !== '') {
			try {
				pubkey_viewer.set(getPublicKey(sec));
				unsubscribe();
				return myPubkey;
			} catch (error) {
				try {
					pubkey_viewer.set(await window.nostr.getPublicKey());
					unsubscribe();
					return myPubkey;
				} catch (error) {
					unsubscribe();
					return '';
				}
			}
		} else {
			try {
				pubkey_viewer.set(await window.nostr.getPublicKey());
				unsubscribe();
				return myPubkey;
			} catch (error) {
				unsubscribe();
				return '';
			}
		}
	}
}

export async function nip04De(
	pubkey: string,
	message: string
): Promise<string> {
	//const sec = localStorage.getItem('nsec');
	const sec = get(nsec);
	if (sec && sec !== '') {
		try {
			return await nip04.decrypt(sec, getPublicKey(sec), message);
		} catch (error) {
			try {
				return await window.nostr.nip04.decrypt(pubkey, message);
			} catch (error) {
				throw error;
			}
		}
	} else {
		try {
			return await window.nostr.nip04.decrypt(pubkey, message);
		} catch (error) {
			throw error;
		}
	}
}

export async function nip04En(
	pubkey: string,
	message: string
): Promise<string> {
	//const sec = localStorage.getItem('nsec');
	const sec = get(nsec);
	if (sec && sec !== '') {
		try {
			return await nip04.encrypt(sec, getPublicKey(sec), message);
		} catch (error) {
			try {
				return await window.nostr.nip04.encrypt(pubkey, message);
			} catch (error) {
				throw error;
			}
		}
	} else {
		try {
			return await window.nostr.nip04.encrypt(pubkey, message);
		} catch (error) {
			throw error;
		}
	}
}

interface Event {
	sig: string;
	kind: number;
	pubkey: string;
	tags: string[][];
	content: string;
	created_at: number;
	id: string;
}

async function signEv(obj: NostrEvent): Promise<Event> {
	//const sec = localStorage.getItem('nsec');
	const sec = get(nsec);
	if (sec && sec !== '') {
		try {
			obj.sig = getSignature(obj, sec);
			return obj;
		} catch (error) {
			try {
				return await window.nostr.signEvent(obj);
			} catch (error) {
				throw error;
			}
		}
	} else {
		try {
			return await window.nostr.signEvent(obj);
		} catch (error) {
			throw error;
		}
	}
}

//------------------------------------------------
//ほぼじぇぺとがかいたidごとに最新のeventだけ受け取るためのpipe
export function idlatestEach(): MonoTypeOperatorFunction<EventPacket> {
	return (source) => {
		return new Observable(
			(observer: {
				next: (arg0: any) => void;
				complete: () => void;
				error: (arg0: any) => void;
			}) => {
				const eventMap = new Map();

				source.subscribe({
					next(packet) {
						const id = packet.event.tags.find((item) => item[0] === 'd'); //一応一個目にdがない場合も考慮
						//console.log(id);
						if (id) {
							const key = id[1]; // タグをキーとして文字列化
							const existingPacket = eventMap.get(key);

							if (
								!existingPacket ||
								packet.event.created_at > existingPacket.event.created_at
							) {
								eventMap.set(key, packet);
							}
						}
					},
					complete() {
						// Map内の最新のパケットを取得
						const latestPackets = Array.from(eventMap.values());
						latestPackets.forEach((packet) => observer.next(packet));
						observer.complete();
					},
					error(err) {
						observer.error(err);
					}
				});
			}
		);
	};
}

//---------------------------------------------------------------
export async function StoreFetchFilteredEvents(
	pubkey: string,
	kind: number,
	data: {
		relays: string[];
		filters: Nostr.Filter[];
	}
): Promise<void> {
	nowProgress.set(true);
	let eventsData = get(bookmarkEvents);
	try {
		const check = eventsData[pubkey][kind]; // すでにデータがあるか確認
		if (check.length === 0) {
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

		try {
			// 新しいイベントを作成してデータに追加
			const newEvent: Nostr.Event[] = await fetchFilteredEvents(
				data.relays,
				data.filters
			);

			//so-tosite
			if (newEvent.length > 1) {
				newEvent.sort((a, b) => {
					const tagID_A = a.tags[0][1];
					const tagID_B = b.tags[0][1];
					return tagID_A.localeCompare(tagID_B);
				});
			}
			eventsData = {
				...eventsData,
				[pubkey]: { ...eventsData[pubkey], [kind]: newEvent }
			};
			console.log(eventsData);
			// 更新したデータをストアにセット
			bookmarkEvents.set(eventsData);

			//IdentifierListも更新する
			const identifierListData = get(identifierList);
			const newIdentifierList: Identifiers[] =
				newEvent.map((item) => {
					const tag = item.tags.find((tag) => tag[0] === 'd');
					const title = item.tags.find((tag) => tag[0] === 'title');
					const image = item.tags.find((tag) => tag[0] === 'image');
					const description = item.tags.find((tag) => tag[0] === 'description');
					return {
						identifier: tag ? tag[1] : undefined,
						title: title ? title[1] : undefined,
						image: image ? image[1] : undefined,
						description: description ? description[1] : undefined
					};
				}) ?? [];

			identifierList.set({
				...identifierListData,
				[pubkey]: { ...identifierListData[pubkey], [kind]: newIdentifierList }
			});
		} catch (error) {
			console.error('Failed to fetch filtered events:', error);
			// エラー処理が必要な場合に追加
		}

		nowProgress.set(false);
	}
}

//----------------------------------------------------------------
export async function fetchFilteredEvents(
	relays: string[],
	filters: Nostr.Filter[]
): Promise<Nostr.Event[]> {
	console.log(`fetchFilteredEvents ` + JSON.stringify(filters[0]));
	if (relays.length === 0) {
		console.error('relay設定されてない');
		return [];
	}
	//console.log(filters);

	const rxNostr = createRxNostr();
	//console.log(relays);

	rxNostr.setRelays(relays);
	console.log('[rx-nostr getRelays]');
	console.log(rxNostr.getRelays());
	const rxReq = createRxOneshotReq({ filters });
	//	console.log(filters[0].kinds);
	// データの購読
	const observable =
		filters[0].kinds &&
		filters[0].kinds[0] >= 30000 &&
		filters[0].kinds[0] < 40000
			? rxNostr.use(rxReq).pipe(
					uniq(),
					verify(),

					idlatestEach(),
					//	(packet) => packet.event.tags[0][1] //.find((item) => item[0] === 'd')
					completeOnTimeout(3000)
			  )
			: rxNostr
					.use(rxReq)
					.pipe(uniq(), verify(), latest(), completeOnTimeout(3000));

	let eventList: Nostr.Event<number>[] = [];
	// オブザーバーオブジェクトの作成
	const observer: Observer<any> = {
		next: (packet: { event: Nostr.Event<number> }) => {
			console.log('[rx-nostr packet]');
			console.log(packet);
			eventList.push(packet.event);
			// if (filters[0].kinds) {
			// 	if (
			// 		filters[0].kinds[0] >= 30000 &&
			// 		filters[0].kinds[0] < 40000 &&
			// 		packet.event.tags[0][0] === 'd'
			// 	) {
			// 		const tagID = packet.event.tags[0][1];
			// 		const existingEvent = eventMap.get(tagID);
			// 		if (
			// 			!existingEvent ||
			// 			packet.event.created_at > existingEvent.created_at
			// 		) {
			// 			eventMap.set(tagID, packet.event);
			// 		}
			// 	} else {
			// 		if (
			// 			returnEvent.id === '' ||
			// 			packet.event.created_at > returnEvent.created_at
			// 		) {
			// 			returnEvent = packet.event;
			// 		}
			// 	}
			// }
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

	// 5秒後に購読を停止
	setTimeout(() => {
		subscription.unsubscribe();
	}, 5 * 1000);

	//Observable の完了を待つ
	await new Promise<void>((resolve) => {
		subscription.add(() => {
			resolve();
		});
	});

	console.log(`[fetchFilteredEvents]`);
	console.log(eventList);
	//nowProgress.set(false);
	return eventList;
	// if (returnEvent.id !== '') {
	// 	return [returnEvent];
	// } else if (eventMap.size > 0) {
	// 	const eventArray: Nostr.Event[] = Array.from(eventMap.values());
	// 	console.log(eventArray);

	// 	return eventArray;
	// } else {
	// 	throw new Error(
	// 		`${JSON.stringify(filters)}に一致するイベントが見つかりませんでした`
	// 	);
	// }
}

export async function getRelays(author: string) {
	const rxNostr = createRxNostr();
	rxNostr.setRelays(relaySearchRelays);
	console.log(rxNostr.getRelays());
	const filters: Nostr.Filter[] = [{ authors: [author], kinds: [3, 10002] }];
	console.log(filters);
	const rxReq = createRxOneshotReq({ filters });
	// データの購読
	const observable = rxNostr.use(rxReq).pipe(
		verify(),
		uniq(),
		latestEach((packet: { event: { kind: number } }) => packet.event.kind),
		completeOnTimeout(2000)
	); //verify()はなんかThe following error occurred during verify(): TypeError: Expected input type is Uint8Array (got object)エラーがテストだと出る（？）
	const kekka: Nostr.Event<number>[] = [];
	// 購読開始
	const subscription = observable.subscribe({
		next: (packet) => {
			console.log(packet);
			kekka.push(packet.event);
		},
		error: (error) => {
			console.log(error);
		},
		complete: () => {
			console.log('owari');
		}
	});

	// Observable の完了を待つ
	await new Promise<void>((resolve) => {
		subscription.add(() => {
			resolve();
		});
	});

	//リレー用イベント取ってきたらそれをセットする
	await setRelays(author, kekka);

	return kekka;
}

export async function setRelays(pubkey: string, events: NostrEvent[]) {
	console.log(`setting relays...`);
	let read: string[] = [];
	let write: string[] = [];
	const kind10002 = events.find((item) => item.kind === 10002);
	const kind3 = events.find((item) => item.kind === 3);
	const tmp_relaySet = get(relaySet);

	// もし pubKey が存在しなければ初期化
	if (!tmp_relaySet[pubkey]) {
		tmp_relaySet[pubkey] = { ...initRelaySet };
	}

	if (kind10002 && kind10002.tags.length > 0) {
		for (const item of kind10002.tags) {
			if (item[0] === 'r') {
				const existRelay = await checkRelayExist(item[1]);
				if (existRelay) {
					if (item.length < 3) {
						read.push(item[1]);
						write.push(item[1]);
					} else if (item[2] === 'read') {
						read.push(item[1]);
					} else if (item[2] === 'write') {
						write.push(item[1]);
					}
				}
			}

			tmp_relaySet[pubkey].relayEvent = kind10002;
		}
	} else if (kind3 && kind3.content !== '') {
		try {
			const relays = JSON.parse(kind3.content);
			for (const item of Object.keys(relays)) {
				const existRelay = await checkRelayExist(item);
				if (existRelay) {
					if (relays[item].read) {
						read.push(item);
					}
					if (relays[item].write) {
						write.push(item);
					}
				}
			}

			tmp_relaySet[pubkey].relayEvent = kind3;
		} catch (error) {
			console.error('JSON parse error:', error);
		}
	}

	if (read.length > 0) {
		tmp_relaySet[pubkey].searchRelays = read;
	}
	if (write.length > 0) {
		tmp_relaySet[pubkey].bookmarkRelays = write;
		tmp_relaySet[pubkey].postRelays = write;
	}
	if (tmp_relaySet[pubkey].searchRelays.length === 0) {
		tmp_relaySet[pubkey].searchRelays = defaultRelays;
	}
	if (tmp_relaySet[pubkey].bookmarkRelays.length === 0) {
		tmp_relaySet[pubkey].bookmarkRelays = defaultRelays;
	}
	if (tmp_relaySet[pubkey].postRelays.length === 0) {
		tmp_relaySet[pubkey].postRelays = defaultRelays;
	}

	// Subscribe を使って直接変更を検知し、それに基づいて更新
	relaySet.update((prev) => ({
		...prev,
		[pubkey]: { ...prev[pubkey], ...tmp_relaySet[pubkey] }
	}));

	console.log(`complete set relsys`);
}

// そのURLのリレーが存在するか確認 NIP11
async function checkRelayExist(relay: string, timeout: number = 1000) {
	let urlstr, url; //protocol,
	if (relay.startsWith('ws://')) {
		// inputValueがws://から始まる場合
		//protocol = 'ws';
		urlstr = relay.slice(5); // ws://の部分を削除した残りの文字列を取得する
		url = new URL('http://' + urlstr);
	} else if (relay.startsWith('wss://')) {
		// inputValueがwss://から始まる場合
		//protocol = 'wss';
		urlstr = relay.slice(6); // wss://の部分を削除した残りの文字列を取得する
		url = new URL('https://' + urlstr);
	} else {
		// console.log('test');
		return false;
		// throw new Error('error');
	}

	let header = new Headers();
	header.set('Accept', 'application/nostr+json');

	// AbortControllerを作成し、timeoutミリ秒後にabort()を呼び出す
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		let response = await fetch(url, {
			headers: header,
			signal: controller.signal
		});
		console.log(response);
		//console.log(response.ok);

		// タイムアウトが発生した場合、response.okもfalseになります
		if (response.ok) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				console.log('Request timed out');
			} else {
				console.log(error);
			}
		}
		return false;
		// throw new Error('error');
	} finally {
		// クリーンアップ: タイムアウト用のタイマーをクリア
		clearTimeout(timeoutId);
	}
}

export async function checkInputNpub(r: string): Promise<{
	tag?: string[];
	message?: string;
	error: boolean;
}> {
	if (r == null) {
		return { message: '無効なIDです', error: true };
	}

	// nostr:で始まる場合、その部分をカット
	if (r.startsWith('nostr:')) {
		r = r.slice(6);
	}

	try {
		const decoded = nip19.decode(r);
		if (decoded.type == 'npub') {
			return { tag: ['p', decoded.data], error: false };
		}
		if (decoded.type == 'nprofile') {
			return { tag: ['p', decoded.data.pubkey], error: false };
		} else {
			throw new Error();
		}
	} catch (error) {
		return { message: '無効なIDです', error: true };
	}
}

export async function checkInputNaddr(r: string): Promise<{
	tag?: string[];
	message?: string;
	error: boolean;
}> {
	if (r == null) {
		return { message: '無効なIDです', error: true };
	}

	// nostr:で始まる場合、その部分をカット
	if (r.startsWith('nostr:')) {
		r = r.slice(6);
	}

	try {
		const decoded = nip19.decode(r);
		if (decoded.type == 'naddr') {
			return {
				tag: [
					'a',
					`${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`
				],
				error: false
			};
		} else {
			throw new Error();
		}
	} catch (error) {
		return { message: '無効なIDです', error: true };
	}
}

export async function checkInputNote(r: string): Promise<{
	tag?: string[];
	message?: string;
	error: boolean;
}> {
	if (r == null) {
		return { message: '無効なIDです', error: true };
	}

	// nostr:で始まる場合、その部分をカット
	if (r.startsWith('nostr:')) {
		r = r.slice(6);
	}

	try {
		const decoded = nip19.decode(r);
		if (decoded.type == 'note') {
			return {
				tag: ['e', decoded.data],
				error: false
			};
		} else if (decoded.type == 'nevent') {
			return {
				tag: ['e', decoded.data.id],
				error: false
			};
		} else {
			throw new Error();
		}
	} catch (error) {
		return { message: '無効なIDです', error: true };
	}
}
//無効ならエラーメッセージ、有効ならtagが帰るけどエラーならthrowerrorで良くない？まあいいかちぇっくだし（？）
export async function checkInputNoteOrNaddr(r: string | boolean): Promise<{
	tag?: string[];
	message?: string;
	error: boolean;
}> {
	console.log('response:', r);
	if (r == null || r == false) {
		return { message: '無効なIDかもです', error: true };
	}
	//rが適切なNoteIDなのかどうかのチェック
	//適切であればHexのNoteIdを返してほしい
	const noteId = await validateNoteId(r as string);
	//console.log(noteId);

	return noteId;
}

async function validateNoteId(str: string): Promise<{
	tag?: string[];
	message?: string;
	error: boolean;
}> {
	const res: {
		tag?: string[];
		message?: string;
		error: boolean;
	} = {
		error: false
	};

	// nostr:で始まる場合、その部分をカット
	if (str.startsWith('nostr:')) {
		str = str.slice(6);
	}
	//note1はじまりかnevent始まりかだったらデコードしてみる
	if (str.startsWith('note1') || str.startsWith('nevent')) {
		// "note1"で始まる場合の処理
		try {
			const decoded = nip19.decode(str);
			if (decoded.type == 'note') {
				res.tag = ['e', decoded.data];
			} else if (decoded.type == 'nevent') {
				res.tag = ['e', decoded.data.id];
			}

			// デコードに成功した場合の追加処理
		} catch (error) {
			res.error = true;
			res.message = error as string;
			console.log('Decoding failed:', error);
			// デコードに失敗した場合の追加処理
		}
	} else if (str.startsWith('naddr')) {
		try {
			const decoded = nip19.decode(str);
			if (decoded.type == 'naddr') {
				res.tag = [
					'a',
					`${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`
				];
				return res;
			} else {
				res.error = true;
				return res;
			}
		} catch (error) {
			res.error = true;
			res.message = error as string;
			return res;
		}
	} else {
		// それ以外の場合の処理
		//逆にノートIDに変換できるか確認してみる
		if (/^[0-9a-fA-F]+$/.test(str)) {
			try {
				nip19.noteEncode(str);
				res.tag = ['e', str];
			} catch (error) {
				res.error = true;
				res.message = error as string;
			}
		} else {
			res.error = true;
			res.message = '無効なIDです';
		}
	}
	console.log(res);
	return res;
}

export async function updateBkmTag(pubkey: string, kind: number, num: number) {
	console.log(`updateBkmTag[${get(identifierList)[num]}] updating...`);

	const bkm = get(bookmarkEvents);

	const relays = get(relaySet)[pubkey].bookmarkRelays;
	if (
		bkm[pubkey][kind] !== undefined &&
		bkm[pubkey][kind].length > num &&
		relays.length > 0
	) {
		const dtag = bkm[pubkey][kind][num].tags.find((tag) => tag[0] === 'd');
		const filter: Nostr.Filter =
			dtag !== undefined
				? {
						kinds: [bkm[pubkey][kind][num].kind],
						authors: [bkm[pubkey][kind][num].pubkey],
						'#d': [dtag[1]]
				  }
				: {
						kinds: [bkm[pubkey][kind][num].kind],
						authors: [bkm[pubkey][kind][num].pubkey]
				  };

		const res = await fetchFilteredEvents(relays, [filter]);
		if (
			res.length > 0 &&
			res[0].created_at > bkm[pubkey][kind][num].created_at
		) {
			bkm[pubkey][kind][num] = res[0];
			bookmarkEvents.set(bkm);

			//IdentifierListも更新する
			const identifierListData = get(identifierList);

			const tag = bkm[pubkey][kind][num].tags.find((tag) => tag[0] === 'd');
			const title = bkm[pubkey][kind][num].tags.find(
				(tag) => tag[0] === 'title'
			);
			const image = bkm[pubkey][kind][num].tags.find(
				(tag) => tag[0] === 'image'
			);
			const description = bkm[pubkey][kind][num].tags.find(
				(tag) => tag[0] === 'description'
			);
			const newIdentifierList: Identifiers = {
				identifier: tag ? tag[1] : undefined,
				title: title ? title[1] : undefined,
				image: image ? image[1] : undefined,
				description: description ? description[1] : undefined
			};

			identifierListData[pubkey][kind][num] = newIdentifierList;
			identifierList.set(identifierListData);

			console.log(
				`updateBkmTag[${get(identifierList)[pubkey][kind][num]}] updated`
			);
			// //newIdentifierListも更新してーーー
			// const newIdentifierList =
			// 	bkm.map((item) => {
			// 		const tag = item.tags.find((tag) => tag[0] === 'd');
			// 		const title = item.tags.find((tag) => tag[0] === 'title');
			// 		const image = item.tags.find((tag) => tag[0] === 'image');
			// 		const summary = item.tags.find((tag) => tag[0] === 'summary');
			// 		return {
			// 			identifier: tag ? tag[1] : undefined,
			// 			title: title ? title[1] : undefined,
			// 			image: image ? image[1] : undefined,
			// 			summary: summary ? summary[1] : undefined
			// 		};
			// 	}) ?? [];
			// identifierList.set(newIdentifierList);
		}
	}
	console.log(
		`updateBkmTag[${
			get(identifierList)[pubkey][kind][num].identifier
		}] completed`
	);
}

//タグごと追加の項目で入力された値が一次元配列かどうかを確認
export function isOneDimensionalArray(arr: string[]) {
	if (Array.isArray(arr)) {
		// 配列の中身がすべて要素（スカラー値やオブジェクト）であるか確認します。
		return arr.every((item) => !Array.isArray(item));
	}
	return false;
}

//check.tagを追加した新しいeventを返してもら
export async function addPrivates(
	content: string,
	pubkey: string,
	tags: string[][]
): Promise<string> {
	console.log(content, pubkey, tags);
	let array: string[][] = [];
	if (content.length > 0) {
		try {
			const privateContent = await nip04De(pubkey, content);
			const parsedContent = JSON.parse(privateContent);
			if (Array.isArray(parsedContent) && Array.isArray(parsedContent[0])) {
				parsedContent.push(...tags);
				array = parsedContent;
			} else {
				throw new Error('content is not array');
			}
		} catch (error) {
			throw new Error('Decode error');
		}
	} else {
		array = tags;
	}
	console.log(array);
	if (array.length > 0) {
		try {
			return await nip04En(pubkey, JSON.stringify(array));
		} catch (error) {
			throw new Error('Encode error');
		}
	} else {
		throw new Error('error');
	}
}

//check.tagを追加した新しいeventを返してもら
export async function deletePrivates(
	content: string,
	pubkey: string,
	numList: number[]
): Promise<string> {
	console.log(content, numList, numList.length);
	let array: string[][] = [];
	if (content.length > 0 && numList.length > 0) {
		numList.sort((a, b) => b - a); //大きい順にソート
		try {
			const privateContent = await nip04De(pubkey, content);
			const parsedContent = JSON.parse(privateContent);
			if (Array.isArray(parsedContent) && Array.isArray(parsedContent[0])) {
				for (const index of numList) {
					parsedContent.splice(index, 1); // インデックスに対応するノートを削除する
				}
				array = parsedContent;
			} else {
				throw new Error('content is not array');
			}
		} catch (error) {
			throw new Error('Decode error');
		}
	} else {
		throw new Error('error');
	}
	console.log(array);
	if (array.length > 0) {
		try {
			return await nip04En(pubkey, JSON.stringify(array));
		} catch (error) {
			throw new Error('Encode error');
		}
	} else {
		return '';
	}
}

export function deletePubs(tags: string[][], numList: number[]): string[][] {
	if (tags.length > 0 && numList.length > 0) {
		numList.sort((a, b) => b - a); //大きい順にソート
		try {
			for (const index of numList) {
				tags.splice(index, 1); // インデックスに対応するノートを削除する
			}
		} catch (error) {
			throw new Error('error');
		}
	}
	return tags;
}
