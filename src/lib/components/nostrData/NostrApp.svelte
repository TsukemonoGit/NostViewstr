<script lang="ts">
	import { queryClient } from '$lib/stores/bookmarkEvents';
	/**
	 * @license Apache-2.0
	 * @copyright 2023 Akiomi Kamakura
	 */

	import type { QueryClientConfig } from '@tanstack/svelte-query';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	//import type { ConnectionStatePacket, DefaultRelayConfig } from 'rx-nostr';
	//import { createRxNostr } from 'rx-nostr';

	//import { app, useConnections } from '$lib/stores/index.js';

	export let queryClientConfig: QueryClientConfig = {};
	//export let relays: (string | DefaultRelayConfig)[] = [];

	//const rxNostr = createRxNostr();
	const defaultQueryClientConfig = {
		defaultOptions: {
			queries: {
				staleTime: Infinity,
				refetchInterval: Infinity
			}
		}
	};

	//$: connections = useConnections();
	$: mergedQueryClientConfig = {
		...defaultQueryClientConfig,
		...queryClientConfig
	};
	$: $queryClient = new QueryClient(mergedQueryClientConfig);

	// $: {
	//   rxNostr.setDefaultRelays(relays);
	//   app.set({ rxNostr });
	// }

	// onDestroy(() => {
	//   rxNostr.dispose();
	// });

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// interface $$Slots {
	//   default: { connections: ConnectionStatePacket[] };
	// }
</script>

<QueryClientProvider client={$queryClient}>
	<slot />
</QueryClientProvider>
