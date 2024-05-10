<script lang="ts">
	import type { ReqStatus, RxReqBase } from '$lib/types';
	/**
	 * @license Apache-2.0
	 * @copyright 2023 Akiomi Kamakura
	 * @license This code is a derivative work based on code licensed under the Apache License, Version 2.0.
	 */

	import type { QueryKey } from '@tanstack/svelte-query';
	import type Nostr from 'nostr-typedef';
	import { useMetadata } from './useMetadata';

	export let queryKey: QueryKey;
	export let pubkey: string;
	export let req: RxReqBase | undefined = undefined;
	export let relay: string[] | undefined = undefined;
	// TODO: Check if $app.rxNostr is defined
	$: result = useMetadata(queryKey, pubkey, req, relay);
	$: data = result.data;
	$: status = result.status;
	$: error = result.error;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface $$Slots {
		default: { metadata: Nostr.Event; status: ReqStatus };
		loading: Record<never, never>;
		error: { error: Error };
		nodata: Record<never, never>;
	}
</script>

{#if $error}
	<slot name="error" error={$error} />
{:else if $data}
	<slot metadata={$data?.event} status={$status} />
{:else if $status === 'loading'}
	<slot name="loading" />
{:else}
	<slot name="nodata" />
{/if}
