<script lang="ts">
	import expandMoreIcon from '@material-design-icons/svg/round/expand_more.svg?raw';
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

<div class=" input-group w-full grid grid-cols-[1fr_auto]">
	<input
		class="px-2"
		type="number"
		placeholder="other kind"
		bind:value={selectValue}
	/>
	<button
		class="btn w-full variant-filled-primary fill-white"
		use:popup={popupSelect}
	>
		{@html expandMoreIcon}
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
	class="card w-56 shadow-xl py-2 border border-primary-500-400-token"
	data-popup="popupSelect"
>
	<ListBox class="h-56 max-h-[80%] overflow-y-auto"
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
