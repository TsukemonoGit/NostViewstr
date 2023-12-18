<script lang="ts">
	import { tagExp } from '$lib/kind';
	import { loadOgp } from '$lib/otherFunctions';
	import { ogpStore } from '$lib/stores/bookmarkEvents';
	import { URLPreview } from '$lib/stores/settings';
	import OGP from './OGP.svelte';
	export let tagArray: string[];
</script>

<!--ICON そのた-->
<div class="pl-1 grid grid-rows-[auto_1fr] gap-1.5">
	<div>{tagExp[tagArray[0]]}</div>
	<div class="px-2">
		{#if tagArray.length > 1 && tagArray[1].startsWith('http')}
			{#if $URLPreview}
				{#await loadOgp(tagArray[1])}<span class=" break-all"
						><a class="anchor" href={tagArray[1]} target="_blank"
							>{#if tagArray[1].length > 80}{tagArray[1].slice(
									0,
									75
								)}...{:else}{tagArray[1]}{/if}</a
						></span
					>{:then ogp}
					{#if $ogpStore[tagArray[1]] && $ogpStore[tagArray[1]].title && $ogpStore[tagArray[1]].title !== ''}
						<OGP ogp={$ogpStore[tagArray[1]]} url={tagArray[1]} />
					{:else}<a class="anchor" href={tagArray[1]} target="_blank"
							>{#if tagArray[1].length > 80}{tagArray[1].slice(
									0,
									75
								)}...{:else}{tagArray[1]}{/if}</a
						>{/if}
				{/await}
			{:else}
				<span class=" break-all"
					><a class="anchor" href={tagArray[1]} target="_blank"
						>{#if tagArray[1].length > 80}{tagArray[1].slice(
								0,
								75
							)}...{:else}{tagArray[1]}{/if}</a
					></span
				>
			{/if}
		{:else if tagArray.length > 1}
			<!--urlいがいのreferenceわかんないけどとりあえずタグの長さわかんないから…-->
			{#each tagArray.slice(1) as array, index}
				<div class="pl-2">{array}</div>
			{/each}
		{/if}
	</div>
</div>
