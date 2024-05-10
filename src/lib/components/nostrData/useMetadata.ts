/**
 * @license Apache-2.0
 * @copyright 2023 Akiomi Kamakura
 */

import type { ReqResult, RxReqBase } from '$lib/types';
import type { QueryKey } from '@tanstack/svelte-query';
import type { EventPacket, RxNostr } from 'rx-nostr';
import { useReplaceableEvent } from './useReplaceableEvent';

export function useMetadata(
	queryKey: QueryKey,
	pubkey: string,
	req?: RxReqBase | undefined,
	relay?: string[] | undefined
): ReqResult<EventPacket> {
	return useReplaceableEvent(queryKey, pubkey, 0, req, relay);
}
