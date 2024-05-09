<script lang="ts">
	import { kinds } from '$lib/kind';
	import {
		ListBox,
		ListBoxItem,
		popup,
		type PopupSettings
	} from '@skeletonlabs/skeleton';

	export let selectValue: number;

	const popupSelect: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: 'popupSelect',
		// Defines which side of your trigger the popup will appear
		placement: 'left',
		closeQuery: '.listbox-item'
	};
</script>

<div class=" input-group w-full grid grid-cols-[auto_1fr_auto] box-border">
	<div class="input-group-shim whitespace-pre">
		{kinds[Number(selectValue)] ?? 'kind'}
	</div>
	<input
		class="px-2"
		type="number"
		placeholder="other kind"
		bind:value={selectValue}
	/>
	<button
		class="btn sm:w-24 w-12 variant-filled-primary fill-white"
		style="padding-right:  0; padding-left:0; justify-content:center"
		use:popup={popupSelect}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="32"
			height="32"
			viewBox="0 0 24 24"
			><path
				fill="currentColor"
				d="M16.59 8.59L12 13.17L7.41 8.59L6 10l6 6l6-6z"
			/></svg
		>
	</button>
</div>
<!-- 
<div
	class=" btn-group-vertical variant-filled-primary h-60 max-h-[80%] w-56 overflow-y-auto border border-primary-300-600-token"
	data-popup="popupSelect"
>
	{#each Object.keys(kinds) as value (value)}
		<button
			class="w-full"
			on:click={() => {
				selectValue = Number(value);
			}}
		>
			<span class="w-full flex text-left"
				>{`${kinds[Number(value)]} (${value})`}</span
			>
		</button>
	{/each}
</div> -->
<div
	class="z-10 card w-56 shadow-xl py-2 border border-primary-500-400-token"
	data-popup="popupSelect"
>
	<ListBox class="h-72 max-h-[80%] overflow-y-auto"
		>{#each Object.keys(kinds) as value (value)}
			<ListBoxItem bind:group={selectValue} name="medium" {value}
				>{`${kinds[Number(value)]} (${value})`}</ListBoxItem
			>
		{/each}
	</ListBox>
	<div
		class="arrow bg-primary-500-400-token border border-primary-500-400-token"
	/>
</div>
