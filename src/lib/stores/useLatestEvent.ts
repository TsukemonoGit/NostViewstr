/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 */

import type { QueryKey } from '@tanstack/svelte-query';
import type Nostr from 'nostr-typedef';
import type { EventPacket, RxNostr } from 'rx-nostr';
import { latest, verify } from 'rx-nostr';
import { pipe } from 'rxjs';

import { useReq } from '$lib/streamEventLists.js';
import type { ReqResult, RxReqBase } from '$lib/types';
export function useLatestEvent(
	queryKey: QueryKey,
	filters: Nostr.Filter[],
	req?: RxReqBase | undefined
): ReqResult<EventPacket> {
	const operator = pipe(verify(), latest());
	return useReq({ queryKey, filters, operator, req });
}
