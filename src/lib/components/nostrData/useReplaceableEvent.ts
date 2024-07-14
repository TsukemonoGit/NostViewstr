/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 */

import { useReq } from '$lib/streamEventLists';
import type { ReqResult, RxReqBase } from '$lib/types';
import type { QueryKey } from '@tanstack/svelte-query';
import type { EventPacket, RxNostr } from 'rx-nostr';
import { filterByKind, latest } from 'rx-nostr';
import { pipe } from 'rxjs';
import { filterPubkey } from './operator';

export function useReplaceableEvent(
	queryKey: QueryKey,
	pubkey: string,
	kind: number,
	req?: RxReqBase | undefined,
	relay?: string[] | undefined
): ReqResult<EventPacket> {
	// TODO: Add npub support
	const filters = [{ kinds: [kind], authors: [pubkey], limit: 1 }];
	const operator = pipe(
		filterByKind(kind),
		filterPubkey(pubkey),

		latest()
	);
	return useReq(
		{ queryKey, filters, operator, req },
		relay
	) as ReqResult<EventPacket>;
}
