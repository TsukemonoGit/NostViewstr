interface Window {
	// NIP-07
	nostr: any;
	open: any;
}
declare let window: Window;

import { SimplePool, getEventHash, getPublicKey, getSignature, nip04 } from 'nostr-tools';
import type { AddressPointer } from 'nostr-tools/lib/types/nip19';
import type { Nostr } from 'nosvelte';
import type { Event as NostrEvent } from 'nostr-tools';
import { pubkey } from '$lib/stores/settings';
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
	const unsubscribe = pubkey.subscribe(($pubkey) => {
		myPubkey = $pubkey;
	});
	if (myPubkey && myPubkey !== '') {
		return myPubkey;
	} else {
		const sec = localStorage.getItem('nsec');
		if (sec) {
			try {
				pubkey.set(getPublicKey(sec));
				unsubscribe();
				return myPubkey;
			} catch (error) {
				try {
					pubkey.set(await window.nostr.getPublicKey());
					unsubscribe();
					return myPubkey;
				} catch (error) {
					unsubscribe();
					return '';
				}
			}
		} else {
			try {
				pubkey.set(await window.nostr.getPublicKey());
				unsubscribe();
				return myPubkey;
			} catch (error) {
				unsubscribe();
				return '';
			}
		}
	}
}

export async function nip04De(pubkey: string, message: string): Promise<string> {
	const sec = localStorage.getItem('nsec');
	if (sec) {
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

export async function nip04En(pubkey: string, message: string): Promise<string> {
	const sec = localStorage.getItem('nsec');
	if (sec) {
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
	const sec = localStorage.getItem('nsec');
	if (sec) {
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
export const uniqueTags = (tags: any[]): string[][] => {
	if (tags.length > 0) {
		return tags.reduce((acc: any[][], curr: [any, any]) => {
			// Standardized Tag | id? | ... |marker
			const [tag1, tag2, ...marker] = curr;

			//重複削除
			const isDuplicate = acc.some(
				([existingTag1, existingTag2]) => existingTag1 === tag1 && existingTag2 === tag2
			);

			//絵文字タグ、URLタグ、ハッシュタグ、qタグを除外
			const isValidTag = tag1 !== 'emoji' && tag1 !== 'r' && tag1 !== 't' && tag1 !== 'q';

			// 追加: 最後の要素が"mention"でない場合にのみ追加する
			//(mentionは引用でこんてんとのなかにnostr:~~ではいってるはずということから)
			//mentionのeタグだけ除外
			//const isMention = marker[marker.length - 1] === 'mention';
			const isMention = marker[marker.length - 1] === 'mention' && tag1 === 'e';
			if (!isDuplicate && isValidTag && !isMention) {
				acc.push([tag1, tag2, ...marker]);
			}
			return acc;
		}, []);
	} else {
		return [];
	}
};
