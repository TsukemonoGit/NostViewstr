/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 */

import { useReq } from '$lib/streamEventLists';
import type { ReqResult, RxReqBase } from '$lib/types';
import type { QueryKey } from '@tanstack/svelte-query';
import type { EventPacket, RxNostr } from 'rx-nostr';
import { uniq } from 'rx-nostr';
import { pipe } from 'rxjs';
import { filterId } from './operator';

export function useEvent(
	queryKey: QueryKey,
	id: string,
	req?: RxReqBase | undefined,
	relay?: string[] | undefined
): ReqResult<EventPacket> {
	const filters = [{ ids: [id], limit: 1 }];
	const operator = pipe(filterId(id), uniq());
	return useReq(
		{ queryKey, filters, operator, req },
		relay
	) as ReqResult<EventPacket>;
}
