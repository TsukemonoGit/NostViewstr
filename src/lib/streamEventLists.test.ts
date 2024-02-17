import { expect, it } from 'vitest';
import { StoreFetchFilteredEvents } from './streamEventLists';

import {
	createRxNostr,
	createRxOneshotReq,
	uniq,
	verify,
	latest,
	completeOnTimeout,
	latestEach,
	type EventPacket
} from 'rx-nostr';
import { from } from 'rxjs';
it('relays', async () => {
	const result = StoreFetchFilteredEvents('', 0, {
		relays: {
			'wss://nos.lol': { read: true, write: false },
			'wss://relay.damus.io': { read: false, write: true }
		},
		filters: []
	});
	console.log(result);

	expect(result);
});
