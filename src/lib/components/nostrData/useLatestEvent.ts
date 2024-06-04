/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 * @license This code is a derivative work based on code licensed under the Apache License, Version 2.0.
 */

import type { QueryKey } from '@tanstack/svelte-query';
import type Nostr from 'nostr-typedef';
import type { EventPacket, RxNostr } from 'rx-nostr';
import { latest, uniq, verify } from 'rx-nostr';
import { pipe } from 'rxjs';

import { useReq } from '$lib/streamEventLists.js';
import type { ReqResult, RxReqBase } from '$lib/types';
export function useLatestEvent(
	queryKey: QueryKey,
	filters: Nostr.Filter[],
	req?: RxReqBase | undefined
): ReqResult<EventPacket> {
	const operator = pipe(uniq(), verify(), latest());
	return useReq({ queryKey, filters, operator, req }) as ReqResult<EventPacket>;
}
