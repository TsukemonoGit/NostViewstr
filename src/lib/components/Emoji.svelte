<script lang="ts">
	import { iconView } from '$lib/stores/settings';

	export let tagArray: string[];
</script>

<div class="grid grid-cols-[auto_1fr] gap-1">
	<div class="m-2">
		{#if $iconView}
			<img
				class="max-w-16 max-h-16 h-16 object-contain justify-center"
				src={tagArray[2]}
				alt={tagArray[1]}
			/>{:else}
			<div
				class="w-4 h-4 object-contain justify-center variant-filled-surface"
			/>
		{/if}
	</div>
	<div class="grid grid-rows-[auto_1fr]">
		<div class="h5 break-all">{tagArray[1]}</div>
		<a
			rel="external noreferrer"
			target="_blank"
			href={tagArray[2]}
			class="anchor break-all">{tagArray[2]}</a
		>
	</div>
</div>
