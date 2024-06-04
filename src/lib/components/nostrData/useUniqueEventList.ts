/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 */

import { useReq } from '$lib/streamEventLists';
import type { RxReqBase, ReqResult } from '$lib/types';
import type { QueryKey } from '@tanstack/svelte-query';
import type Nostr from 'nostr-typedef';
import type { EventPacket, RxNostr } from 'rx-nostr';
import { uniq, verify } from 'rx-nostr';
import { pipe } from 'rxjs';
import { scanArray } from './operator';

export function useUniqueEventList(
	queryKey: QueryKey,
	filters: Nostr.Filter[],
	req?: RxReqBase | undefined,
	relay?: string[] | undefined
): ReqResult<EventPacket[]> {
	const operator = pipe(uniq(), verify(), scanArray());
	return useReq({ queryKey, filters, operator, req }, relay) as ReqResult<
		EventPacket[]
	>;
}
