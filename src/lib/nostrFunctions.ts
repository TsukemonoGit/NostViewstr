interface Window {
	// NIP-07
	nostr: any;
	open: any;
}
declare let window: Window;

import { _ } from 'svelte-i18n';
import {
	SimplePool,
	finalizeEvent,
	getEventHash,
	getPublicKey,
	nip04,
	nip19
} from 'nostr-tools';
import { verifier, seckeySigner } from 'rx-nostr-crypto';
import type { Event as NostrEvent } from 'nostr-tools';
import {
	pubkey_viewer,
	nsec,
	nowProgress,
	nip46Check
} from './stores/settings';
import { type Observer, type MonoTypeOperatorFunction, Observable } from 'rxjs';

import {
	createRxNostr,
	uniq,
	completeOnTimeout,
	latestEach,
	type EventPacket,
	createRxBackwardReq,
	now
} from 'rx-nostr';
import { get } from 'svelte/store';

import {
	//bookmarkRelays,
	defaultRelays,
	initRelaySet,
	//	postRelays,
	//relayEvent,
	relaySearchRelays,
	relaySet,
	type RelayConfig
	//searchRelays
} from './stores/relays';
import type Nostr from 'nostr-typedef';
import { setDefaultRelays } from './streamEventLists';
import { normalizeURL } from 'nostr-tools/utils';

export function parseNaddr(tag: string[]): nip19.AddressPointer {
	const [, reference, relay] = tag; // 配列の2番目の要素を取り出す
	const [kind, pubkey, ...identifierParts] = reference.split(':'); // referenceをコロンで分割, identifierの中に:が含まれる可能性がある
	const identifier = identifierParts.join(':'); // identifierの部分を結合する
	//console.log(identifier);
	return relay !== undefined && relay !== ''
		? {
				kind: Number(kind),
				pubkey: pubkey,
				identifier: identifier ?? '',
				relays: [relay]
			}
		: {
				kind: Number(kind),
				pubkey: pubkey,
				identifier: identifier ?? ''
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
	} else if (tag[0] === 'p') {
		//タグがpの場合はプロフィールを取得
		return { id: tag[1], filter: { kinds: [0], authors: [tag[1]] } };
	} else {
		//タグがa,eかp以外はそのままかえす
		return { id: tag[1], filter: {} };
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
		//`https://nostr.band/?q=${str}`,
		`https://njump.me/${str}`,
		'_blank'
	);
}
export const urlParam = (
	tag: string[],
	relays: string[]
): string | undefined => {
	console.log(tag);
	if (tag[0] === 'p') {
		return nip19.nprofileEncode({ relays: relays, pubkey: tag[1] });
	} else if (tag[0] === 'e') {
		return nip19.neventEncode({ relays: relays, id: tag[1] });
	} else if (tag[0] === 'a') {
		const naddr = parseNaddr(tag);
		naddr.relays = relays;
		return nip19.naddrEncode(naddr);
	}
};
// リレーの結果を指定の形式に整形
export function formatResults(msg: { [relay: string]: boolean }): string {
	let resultString = '';
	for (const relay in msg) {
		resultString += msg[relay] ? `OK ${relay}<br/>` : `failed ${relay}<br/>`;
	}
	return resultString;
}

//--------------------------------------------------nip07かnsecかでやるやつ
export async function getPub(nip46: boolean): Promise<string> {
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
			//nsecログイン
			try {
				pubkey_viewer.set(getPublicKey(nip19.decode(sec).data as Uint8Array));
				unsubscribe();
				return myPubkey;
			} catch (error) {
				//拡張機能があれば拡張機能優先。なければNIP46Challengeになるので？
				if (nip46) {
					try {
						//nip07ログイン//nip46ログイン
						pubkey_viewer.set(await window.nostr.getPublicKey());
						return myPubkey;
					} catch (error) {
						//nip46ログイン
						nip46Check.set(false);
					}
				}
				unsubscribe();
				return '';
			}
		} else {
			//拡張機能があれば拡張機能優先。なければNIP46Challengeになるので？
			if (nip46) {
				try {
					//nip07ログイン//nip46ログイン
					const pub = await (window.nostr as Nostr.Nip07.Nostr).getPublicKey();
					if (!pub) {
						throw Error;
					}
					pubkey_viewer.set(pub);
					//console.log(pubkey_viewer);
					return myPubkey;
				} catch (error) {
					console.log(error);
					//nip46ログイン
					nip46Check.set(false);
				}
			}
			unsubscribe();
			return '';
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
			return await nip04.decrypt(
				sec,
				getPublicKey(nip19.decode(sec).data as Uint8Array),
				message
			);
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
			return await nip04.encrypt(
				sec,
				getPublicKey(nip19.decode(sec).data as Uint8Array),
				message
			);
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

export async function signEv(obj: NostrEvent): Promise<Event> {
	//const sec = localStorage.getItem('nsec');

	const sec = get(nsec);
	if (sec && sec !== '') {
		console.log('nsec');
		try {
			obj = finalizeEvent(obj, nip19.decode(sec).data as Uint8Array);
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
						//	console.log(packet);
						const id = packet.event.tags.find(
							(item: string[]) => item[0] === 'd'
						); //一応一個目にdがない場合も考慮
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

export async function getRelays(author: string) {
	const filters: Nostr.Filter[] = [
		{ authors: [author], kinds: [3, 10002], until: now() }
	];
	const kekka = await getRelayEvents(filters, relaySearchRelays);

	//リレー用イベント取ってきたらそれをセットする
	await setRelays(author, kekka);

	//リレー設定変えてもっかい撮ってきてみる
	const kekka2 = await getRelayEvents(
		filters,
		get(relaySet)[author].mergeRelays
	);

	//リレー用イベント取ってきたらそれをセットする
	await setRelays(author, kekka2);

	return kekka2;
}

async function getRelayEvents(
	filters: Nostr.Filter[],
	relays: string[]
): Promise<{ [key: number]: Nostr.Event | undefined }> {
	const rxNostr = createRxNostr({ verifier });
	// インデックスシグネチャを修正する
	const rxReq = createRxBackwardReq();

	// データの購読
	const observable = rxNostr.use(rxReq).pipe(
		uniq(),
		latestEach((packet: { event: { kind: number } }) => packet.event.kind),
		completeOnTimeout(3000)
	);
	const kekka: { [key: number]: Nostr.Event | undefined } = {};
	// 購読開始
	const subscription = observable.subscribe({
		next: (packet) => {
			//	console.log(packet);
			if (
				!kekka[packet.event.kind] ||
				packet.event.created_at > (kekka[packet.event.kind]?.created_at ?? 0)
			) {
				kekka[packet.event.kind] = packet.event;
			}
		},
		error: (error) => {
			console.log(error);
		},
		complete: () => {
			console.log('owari');
		}
	});
	rxReq.emit(filters, { relays: relays });
	rxReq.over();
	// Observable の完了を待つ
	await new Promise<void>((resolve) => {
		subscription.add(() => {
			resolve();
		});
	});

	subscription.unsubscribe();
	rxNostr.dispose();
	console.log('kekka', kekka);
	return kekka;
}

export async function setRelays(
	pubkey: string,
	events: { [key: number]: Nostr.Event | undefined }
) {
	console.log(`setting relays...`);
	let read: string[] = [];
	let write: string[] = [];
	let both: string[] = [];
	const kind10002 = events[10002];
	const kind3 = events[3];
	//まず今持ってる値を確認する
	// const relaySetData = get(relaySet);
	// if(relaySetData.hasOwnProperty(pubkey));
	const tmp_relaySet = get(relaySet);
	const tmp_relay: RelayConfig = { ...initRelaySet };
	// もし pubKey が存在しなければ初期化
	if (tmp_relaySet[pubkey]?.relayEvent !== undefined) {
		const tmp = tmp_relaySet[pubkey].relayEvent as Nostr.Event;
		if (
			tmp.kind === 3 &&
			!kind10002 &&
			((kind3 && tmp.created_at > kind3?.created_at) || !kind3)
		) {
			return;
		} else if (
			tmp.kind === 10002 &&
			(!kind10002 || (kind10002 && tmp.created_at > kind10002.created_at))
		) {
			return;
		}
	}

	if (kind10002 && kind10002.tags.length > 0) {
		for (const item of kind10002.tags) {
			try {
				const relayURL = normalizeURL(item[1]);

				if (item[0] === 'r') {
					// const existRelay = await checkRelayExist(relayURL);
					// if (existRelay) {
					if (item.length < 3) {
						read.push(relayURL);
						write.push(relayURL);
					} else if (item[2] === 'read') {
						read.push(relayURL);
					} else if (item[2] === 'write') {
						write.push(relayURL);
					}
					both.push(relayURL);
					//}
				}
			} catch (error) {}
			tmp_relay.relayEvent = kind10002;
		}
	} else if (kind3 && kind3.content !== '') {
		try {
			const relays = JSON.parse(kind3.content);
			for (const item of Object.keys(relays)) {
				try {
					const relayURL = normalizeURL(item);

					// const existRelay = await checkRelayExist(relayURL);
					// if (existRelay) {
					if (relays[item].read) {
						read.push(relayURL);
					}
					if (relays[item].write) {
						write.push(relayURL);
					}
					//}

					both.push(relayURL);
				} catch (error) {}
			}

			tmp_relay.relayEvent = kind3;
		} catch (error) {
			console.error('JSON parse error:', error);
		}
	}

	if (read.length > 0) {
		tmp_relay.readRelays = read.sort();
	} else {
		tmp_relay.readRelays = defaultRelays;
	}
	if (write.length > 0) {
		tmp_relay.writeRelays = write.sort();
	} else {
		tmp_relay.writeRelays = defaultRelays;
	}
	if (both.length > 0) {
		tmp_relay.mergeRelays = both.sort();
	} else {
		tmp_relay.mergeRelays = defaultRelays;
	}

	// // Subscribe を使って直接変更を検知し、それに基づいて更新
	// relaySet.update((prev) => ({
	// 	...prev,
	// 	[pubkey]: { ...prev[pubkey], ...tmp_relaySet[pubkey] }
	// }));
	console.log('pub, tmp_relay', pubkey, tmp_relay);
	relaySet.set({ ...get(relaySet), [pubkey]: tmp_relay });
	console.log(`complete set relsys`, get(relaySet));
	setDefaultRelays(get(relaySet)[pubkey].mergeRelays);
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
	tags: string[][],
	check: boolean
): Promise<string> {
	console.log(content, pubkey, tags);
	let array: string[][] = [];
	if (content.length > 0) {
		try {
			const privateContent = await nip04De(pubkey, content);
			const parsedContent: string[][] = JSON.parse(privateContent);
			if (
				(Array.isArray(parsedContent) && parsedContent.length <= 0) ||
				(Array.isArray(parsedContent) && Array.isArray(parsedContent[0]))
			) {
				if (check) {
					tags.map((tag) => {
						const index = parsedContent.findIndex((item) => item[1] === tag[1]);
						if (index !== -1) {
							throw Error(`same name exists`);
						}
					});
				}
				parsedContent.push(...tags);
				array = parsedContent;
			} else {
				throw new Error('content is not array');
			}
		} catch (error: any) {
			throw new Error(error);
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
		console.log('error');
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
	const newTags = [...tags];

	if (newTags.length > 0 && numList.length > 0) {
		numList.sort((a, b) => b - a); //大きい順にソート
		try {
			for (const index of numList) {
				newTags.splice(index, 1); // インデックスに対応するノートを削除する
			}
		} catch (error) {
			throw new Error('error');
		}
	}
	return newTags;
}

export async function editPrivates(
	content: string,
	pubkey: string,
	number: number,
	tag: string[]
): Promise<string> {
	console.log(content, pubkey, tag);

	try {
		const privateContent = await nip04De(pubkey, content);
		const parsedContent = JSON.parse(privateContent);
		parsedContent[number] = tag;
		return await nip04En(pubkey, JSON.stringify(parsedContent));
	} catch (error) {
		throw new Error('Decode error');
	}
}

//現バージョンのrx-nostrでは署名なしに送信できないので別で
export async function broadcast(
	event: Nostr.Event,
	postRelays: string[]
): Promise<string> {
	const timeoutMs: number = 5000; // デフォルトのタイムアウト時間は5秒

	let webSockets: WebSocket[] = [];

	const msgObj: { [relay: string]: boolean } = {};
	const wsPromises: Promise<void>[] = [];

	postRelays.forEach((relay) => {
		msgObj[relay] = false;
	});

	for (let i = 0; i < postRelays.length; i++) {
		const ws = new WebSocket(postRelays[i]);
		webSockets.push(ws);

		const wsPromise = new Promise<void>((resolve) => {
			const timerId = setTimeout(() => {
				ws.close();
			}, timeoutMs);

			ws.onopen = () => {
				// WebSocketがオープンされた後にイベントを送信
				ws.send(JSON.stringify(['EVENT', event]));
			};
			ws.onmessage = (e) => {
				console.log('[broadcast]', e);
				const msg = JSON.parse(e.data);
				msgObj[postRelays[i]] = msg[2];
				clearTimeout(timerId); // タイムアウト用のタイマーをクリア
				ws.close();
				resolve(); // メッセージ受信処理が完了したことを解決
			};
		});

		wsPromises.push(wsPromise);
	}

	try {
		// WebSocket処理が完了するか、タイムアウトするまで待つ
		await Promise.race([
			Promise.all(wsPromises),
			new Promise<void>((resolve, reject) => {
				setTimeout(() => {
					resolve(); // タイムアウト時に即座にresolveすることで待機中のPromise.allを解決
				}, timeoutMs);
			})
		]);
	} catch (error) {
		console.error(error);
		// エラーが発生した場合、すべてのWebSocket接続を閉じる
		webSockets.forEach((ws) => ws.close());
		throw error;
	}

	// すべての処理が完了した後に結果を返す
	return formatResults(msgObj);
}
