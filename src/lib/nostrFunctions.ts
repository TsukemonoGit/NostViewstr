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
	naddrStore,
	type NaddrStore
} from './stores/bookmarkEvents';
import {
	bookmarkRelays,
	defaultRelays,
	postRelays,
	relayEvent,
	relaySearchRelays,
	searchRelays
} from './stores/relays';

interface Kind3Relay {
	[key: string]: {
		read: boolean;
		write: boolean;
	};
}

export function parseNaddr(tag: string[]): AddressPointer {
	const parts = tag[1].split(':');
	return tag.length >= 2
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
	const searchR = get(searchRelays);
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
		rxNostr.send(event).subscribe((packet) => {
			console.log(packet);
			//	console.log(`relay: ${packet.from} -> ${packet.ok ? "succeeded" : "failed"}`);
		});
	} catch (error) {}
	return { isSuccess: false, msg: 'まだ書き込みできないよ' };
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
				console.error(`failed ${relays[index]}: ${result.reason}`);
			}
		});

		return { isSuccess: isSuccess, event: event, msg: formatResults(msgObj) };
	} catch (error) {
		if (error && typeof error === 'object' && 'errorOptions' in error) {
			const { isSuccess, event, msg } = (
				error as { errorOptions: ErrorOptions }
			).errorOptions;
			console.error('Timeout occurred');
			return { isSuccess, event, msg };
		} else {
			console.error(error);
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
//----------------------------------------------------------------
export async function fetchFilteredEvents(
	relays: string[],
	filters: Nostr.Filter[]
): Promise<Nostr.Event[]> {
	if (relays.length === 0) {
		console.error('relay設定されてない');
		return [];
	}
	const rxNostr = createRxNostr();
	console.log(relays);
	rxNostr.setRelays(relays);
	console.log(rxNostr.getRelays());
	const rxReq = createRxOneshotReq({ filters });
	console.log(filters[0].kinds);
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
					completeOnTimeout(5000)
			  )
			: rxNostr
					.use(rxReq)
					.pipe(uniq(), verify(), latest(), completeOnTimeout(5000));

	let eventList: Nostr.Event<number>[] = [];
	// オブザーバーオブジェクトの作成
	const observer: Observer<any> = {
		next: (packet: { event: Nostr.Event<number> }) => {
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

	console.log(eventList);
	nowProgress.set(false);
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
	await setRelays(kekka);

	return kekka;
}

export function setRelays(events: NostrEvent[]) {
	let read: string[] = [];
	let write: string[] = [];
	const kind10002 = events.find((item) => item.kind === 10002);
	const kind3 = events.find((item) => item.kind === 3);
	if (kind10002 && kind10002.tags.length > 0) {
		kind10002.tags.map((item) => {
			if (item[0] === 'r') {
				if (item.length < 3) {
					read.push(item[1]);
					write.push(item[1]);
				} else if (item[2] === 'read') {
					read.push(item[1]);
				} else if (item[2] === 'write') {
					write.push(item[1]);
				}
			}
			relayEvent.set(kind10002);
		});
	} else if (kind3 && kind3.content !== '') {
		try {
			const relays = JSON.parse(kind3.content);
			console.log(relays);
			Object.keys(relays).map((item) => {
				if (relays[item].read) {
					read.push(item);
				}
				if (relays[item].write) {
					write.push(item);
				}
			});
			relayEvent.set(kind3);
		} catch (error) {
			console.log(error);
		}
	}
	console.log(read);
	console.log(write);
	if (read.length > 0) {
		searchRelays.set(read);
	}
	if (write.length > 0) {
		bookmarkRelays.set(write);
		postRelays.set(write);
	}
	if (get(searchRelays).length === 0) {
		searchRelays.set(defaultRelays);
	}
	if (get(bookmarkRelays).length === 0) {
		bookmarkRelays.set(defaultRelays);
	}
	if (get(postRelays).length === 0) {
		postRelays.set(defaultRelays);
	}
}

//無効ならエラーメッセージ、有効ならtagが帰るけどエラーならthrowerrorで良くない？まあいいかちぇっくだし（？）
export async function checkInput(r: string | boolean): Promise<{
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
	console.log(noteId);

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

export async function updateBkmTag(num: number) {
	const bkm = get(bookmarkEvents);
	const relays = get(bookmarkRelays);
	if (bkm !== undefined && bkm.length > num && relays.length > 0) {
		const dtag = bkm[num].tags.find((tag) => tag[0] === 'd');
		const filter: Nostr.Filter =
			dtag !== undefined
				? {
						kinds: [bkm[num].kind],
						authors: [bkm[num].pubkey],
						'#d': [dtag[1]]
				  }
				: { kinds: [bkm[num].kind], authors: [bkm[num].pubkey] };

		const res = await fetchFilteredEvents(relays, [filter]);
		if (res.length > 0 && res[0].created_at > bkm[num].created_at) {
			bkm[num] = res[0];
			bookmarkEvents.set(bkm);
		}
	}
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
		throw new Error('error');
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
