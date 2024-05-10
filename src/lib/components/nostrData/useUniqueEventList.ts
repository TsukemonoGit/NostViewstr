/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 */

import type { ReqResult, RxReqBase } from '$lib/types';
import type { QueryKey } from '@tanstack/svelte-query';
import type Nostr from 'nostr-typedef';
import type { EventPacket, RxNostr } from 'rx-nostr';
import { uniq, verify } from 'rx-nostr';
import { pipe } from 'rxjs';
import { scanArray } from './operator';
import { useReq } from '$lib/streamEventLists';

export function useUniqueEventList(
	queryKey: QueryKey,
	filters: Nostr.Filter[],
	req?: RxReqBase | undefined
): ReqResult<EventPacket[]> {
	const operator = pipe(uniq(), verify(), scanArray());
	return useReq({ queryKey, filters, operator, req });
}
