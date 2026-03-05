import type { QueryKey } from '@tanstack/svelte-query';
import type Nostr from 'nostr-typedef';
import type {
	DefaultRelayConfig,
	EventPacket,
	RxNostr,
	RxReq,
	RxReqEmittable,
	RxReqOverable,
	RxReqPipeable
} from 'rx-nostr';
import type { OperatorFunction } from 'rxjs';
import type { Readable } from 'svelte/store';

export type RxReqBase = RxReq<'backward'> &
	RxReqEmittable<{
		relays: string[];
	}> &
	RxReqOverable &
	RxReqPipeable;

export type ReqStatus = 'loading' | 'success' | 'error';

export interface ReqResult<A> {
	data: Readable<A | undefined>;
	status: Readable<ReqStatus>;
	error: Readable<Error>;
}

export interface UseConnectionsOpts {
	rxNostr: RxNostr;
	relays: (string | DefaultRelayConfig)[];
}

export interface UseReqOpts<A> {
	queryKey: QueryKey;
	filters: Nostr.Filter[];
	operator: OperatorFunction<EventPacket, A>;
	req?: RxReqBase;
	initData?: A;
}

/** Skeleton Modal parent prop type */
export interface ModalParent {
	position: string;
	background: string;
	width: string;
	height: string;
	padding: string;
	spacing: string;
	rounded: string;
	shadow: string;
	buttonNeutral: string;
	buttonPositive: string;
	buttonTextCancel: string;
	buttonTextConfirm: string;
	buttonTextSubmit: string;
	regionBackdrop: string;
	regionHeader: string;
	regionBody: string;
	regionFooter: string;
	onClose: () => void;
}
