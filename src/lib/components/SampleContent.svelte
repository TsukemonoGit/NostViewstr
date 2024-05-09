<script lang="ts">
	import { extractTextParts } from '$lib/content';
	import { loadOgp } from '$lib/otherFunctions.js';
	import OGP from './OGP.svelte';
	import { contentStore, ogpStore } from '$lib/stores/bookmarkEvents';
	export let id: string;
	export let text: string;
	export let tag: string[][];
	export let light: boolean;

	async function getTextParts(text: string, tag: string[][]) {
		if ($contentStore.has(id)) {
			return $contentStore.get(id)!; // Non-null assertion operator used to assert that $contentStore.get(id) is not undefined
		} else {
			const content = await extractTextParts(text, tag);
			$contentStore.set(id, content);
			return content;
		}
	}
	export let view = false;
	function clickView() {
		view = true;
	}
</script>

{#await getTextParts(text, tag)}
	{text}
{:then viewContent}
	{#each viewContent as item, index}
		{#if item.content?.length > 0}{#if item.type === 'url'}{#if light}
					{#await loadOgp(item.content)}<span class=" break-all"
							><a class="anchor" href={item.content} target="_blank"
								>{#if item.content.length > 80}{item.content.slice(
										0,
										75
									)}...{:else}{item.content}{/if}</a
							></span
						>{:then ogp}
						{#if $ogpStore[item.content] && $ogpStore[item.content].title && $ogpStore[item.content].title !== ''}
							<OGP ogp={$ogpStore[item.content]} url={item.content} />
						{:else}<a
								class="anchor"
								href={item.content}
								target="_blank"
								rel="external noreferrer"
								>{#if item.content.length > 80}{item.content.slice(
										0,
										75
									)}...{:else}{item.content}{/if}</a
							>{/if}
					{/await}
				{:else}<a
						class="anchor"
						href={item.content}
						target="_blank"
						rel="external noreferrer"
						>{#if item.content.length > 80}{item.content.slice(0, 75)}...
						{:else}{item.content}{/if}</a
					>{/if}
			{:else if item.content.length > 0}<span
					style="	white-space: pre-wrap; word-break: break-word;"
					>{item.content}</span
				>{/if}{/if}
	{/each}
{/await}
