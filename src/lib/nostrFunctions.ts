interface Window {
	// NIP-07
	nostr: any;
	open: any;
}
declare let window: Window;

import {
	SimplePool,
	getEventHash,
	getPublicKey,
	getSignature,
	nip04,
	nip19,
	verifySignature
} from 'nostr-tools';
import type { AddressPointer } from 'nostr-tools/lib/types/nip19';

import type { Event as NostrEvent } from 'nostr-tools';
import { pubkey_viewer, nsec } from './stores/settings';
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
	type EventPacket
} from 'rx-nostr';
import { get } from 'svelte/store';
import { naddrStore, type NaddrStore } from './stores/bookmarkEvents';
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

export async function publishEvent(
	obj: Event,
	relays: string[]
): Promise<{ isSuccess: boolean; event?: Nostr.Event; msg: string[] }> {
	if (relays.length === 0) {
		console.error('relay設定されてない');
		return { isSuccess: false, msg: ['relayが設定されていません'] };
	}
	let isSuccess = false;
	const msg: string[] = [];
	console.log(obj);
	console.log(relays);
	if (obj.pubkey === '') {
		obj.pubkey = await getPub();
	}
	try {
		const event = await signEv(obj); //window.nostr.signEvent(obj);
		event.id = getEventHash(event);

		const pool = new SimplePool();
		const pubs = pool.publish(relays, event);

		await Promise.allSettled(pubs).then((results) => {
			results.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					console.log(`success ${relays[index]} `);
					isSuccess = true;
					msg.push(`[ok] ${relays[index]}`);
				} else {
					console.error(`failed ${relays[index]}: ${result.reason}`);
					msg.push(`[failed] ${relays[index]}`);
				}
			});
		});
		return { isSuccess: isSuccess, event: event, msg: msg };
	} catch (error) {
		console.error(error);
		return { isSuccess: false, msg: [`failed to publish`] };
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

export async function fetchFilteredEvents(
	relays: string[],
	filters: Nostr.Filter[]
): Promise<Nostr.Event[]> {
	if (relays.length === 0) {
		console.error('relay設定されてない');
		return [];
	}
	const rxNostr = createRxNostr();

	rxNostr.setRelays(relays);

	const rxReq = createRxOneshotReq({ filters });

	// データの購読
	const observable = rxNostr.use(rxReq).pipe(
		uniq(),
		verify(),

		filters[0].kinds &&
			filters[0].kinds[0] >= 30000 &&
			filters[0].kinds[0] < 40000
			? latestEach(
					(packet) => packet.event.tags[0][1] //.find((item) => item[0] === 'd')
			  )
			: latest()
	);

	const eventMap = new Map<string, any>(); // タグIDをキーとするイベントのマップ

	let returnEvent: Nostr.Event<number> = {
		id: '',
		sig: '',
		kind: 0,
		tags: [],
		pubkey: '',
		content: '',
		created_at: 0
	};
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

	// Observable の完了を待つ
	await new Promise<void>((resolve) => {
		subscription.add(() => {
			resolve();
		});
	});

	console.log(eventList);
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
