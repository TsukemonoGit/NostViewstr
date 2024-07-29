<script lang="ts">
	import { extractTextParts } from '$lib/content';
	import { contentStore } from '$lib/stores/bookmarkEvents';
	import { page } from '$app/stores';
	import SampleOgp from './SampleOgp.svelte';

	export let id: string;
	export let text: string;
	export let tag: string[][];
	export let light: boolean;
	const ogp = {
		title: 'nostviewstr',
		image: `${$page.url.origin}/ogp.png`,
		description: 'りすととかみれるやつ',
		favicon: `${$page.url.origin}/favicon.png`
	};

	async function getTextParts(text: string, tag: string[][]) {
		if ($contentStore.has(id)) {
			return $contentStore.get(id)!; // Non-null assertion operator used to assert that $contentStore.get(id) is not undefined
		} else {
			const content = await extractTextParts(text, tag);
			$contentStore.set(id, content);
			return content;
		}
	}
</script>

{#await getTextParts(text, tag)}
	{text}
{:then viewContent}
	{#each viewContent as item, index}
		{#if item.content?.length > 0}{#if item.type === 'url'}{#if light}
					<SampleOgp {ogp} url={item.content} />
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
