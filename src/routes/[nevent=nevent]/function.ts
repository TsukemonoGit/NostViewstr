import { SimplePool, relayInit, type Event as NostrEvent } from 'nostr-tools';

import type Nostr from 'nostr-typedef';

export async function getViewEvent(
	id: string,
	relays: string[]
): Promise<Nostr.Event<number>> {
	const pool = new SimplePool();
	let sub = pool.sub(relays, [{ ids: [id] }]);
	let resEvent: Promise<Nostr.Event<number>>;
	const result: Promise<Nostr.Event<number>> = new Promise((resolve) => {
		const timeoutID = setTimeout(() => {
			resolve(resEvent); //, pubkeys]);
		}, 5000);

		sub.on('event', (event) => {
			// @ts-ignore
			resEvent = event;
			//    if (!pubkeys.includes(event.pubkey)) {
			//      pubkeys.push(event.pubkey);
			//}
		});
		sub.on('eose', () => {
			sub.unsub(); //イベントの購読を停止
			clearTimeout(timeoutID); //settimeoutのタイマーより早くeoseを受け取ったら、setTimeoutをキャンセルさせる。
			resolve(resEvent); //, pubkeys]);
			clearTimeout(timeoutID);
		});
	});
	//console.log(eventList);

	await result; // result プロミスの解決を待つ
	return result;
}
