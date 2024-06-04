/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 */

import type { ReqResult, RxReqBase } from '$lib/types';
import type { QueryKey } from '@tanstack/svelte-query';
import type Nostr from 'nostr-typedef';
import type { EventPacket, RxNostr } from 'rx-nostr';
import { uniq, verify, latest } from 'rx-nostr';
import { pipe } from 'rxjs';
import { scanArray } from './operator';
import { useReq } from '$lib/streamEventLists';
import type { UnaryFunction, Observable } from 'rxjs';
//replacedEventの特定のフィルターでの最新イベント
export function useUniqueEventList(
	queryKey: QueryKey,
	filters: Nostr.Filter[],
	req?: RxReqBase | undefined,
	relay?: string[] | undefined
): ReqResult<EventPacket> {
	const operator: UnaryFunction<
		Observable<EventPacket>,
		Observable<EventPacket>
	> = pipe(uniq(), verify(), latest());
	return useReq({ queryKey, filters, operator, req }, relay);
}
