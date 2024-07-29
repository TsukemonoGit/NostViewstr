import type Nostr from 'nostr-typedef';
import { createRxBackwardReq, createRxNostr, type EventPacket } from 'rx-nostr';
import { verifier } from 'rx-nostr-crypto';

export async function getViewEvent(
	id: string,
	relays: string[]
): Promise<Nostr.Event> {
	const filters = [{ ids: [id], limit: 1 }];
	const rxNostr = createRxNostr({ verifier });
	rxNostr.setDefaultRelays(relays);
	const req = createRxBackwardReq();
	return new Promise((resolve, reject) => {
		const subscribe = rxNostr.use(req).subscribe({
			next: (v: EventPacket) => {
				resolve(v.event);
			},

			complete: () => {
				subscribe.unsubscribe();
			},
			error: (e) => {
				console.error('[rx-nostr]', e);

				reject(e);

				subscribe.unsubscribe();
			}
		});

		req.emit(filters);
		req.over();
	});
}
