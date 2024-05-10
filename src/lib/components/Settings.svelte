<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { iconView, saveObj, URLPreview } from '$lib/stores/settings';
	import FooterIcons from './FooterIcons.svelte';
	import Samples from '$lib/components/sample/Samples.svelte';
	export let settingFunc: () => void;

	const clickDefault = () => {
		//bookmarkEventsのしょきか

		iconView.set(true);
		URLPreview.set(true);
		//settings.set(true);
		settingFunc();
	};

	const clickLight = () => {
		//bookmarkEventsのしょきか

		iconView.set(false);
		URLPreview.set(false);
		//settings.set(true);
		settingFunc();
	};
	export let saveCheck: boolean;
	export let noSave: boolean = false;
	console.log(saveCheck);
</script>

<div class="mt-10">
	<h5 class="h5">📶{$_('mode.viewMode')}*</h5>

	<div class="grid grid-cols-2 gap-4 my-2 max-w-full">
		<button
			class="btn variant-filled-secondary fill-white break-words whitespace-pre-wrap"
			on:click={clickDefault}
			><span
				>{$_('mode.normal')}<svg
					class="ml-1 min-w-2 inline-block"
					xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
					viewBox="0 0 24 24"
					><path
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12h3m6-9v3M7.8 7.8L5.6 5.6m10.6 2.2l2.2-2.2M7.8 16.2l-2.2 2.2M12 12l9 3l-4 2l-2 4z"
					/></svg
				></span
			></button
		>

		<button
			class="btn variant-filled-secondary fill-white break-words whitespace-pre-wrap"
			on:click={clickLight}
			><span
				>{$_('mode.light')}<svg
					class="ml-1 min-w-2 inline-block"
					xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
					viewBox="0 0 24 24"
					><path
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12h3m6-9v3M7.8 7.8L5.6 5.6m10.6 2.2l2.2-2.2M7.8 16.2l-2.2 2.2M12 12l9 3l-4 2l-2 4z"
					/></svg
				></span
			></button
		>
	</div>
	{#if !noSave}
		<label class="flex items-center space-x-2 mx-2">
			<input class="checkbox" type="checkbox" bind:checked={saveCheck} />
			<p>{$_('mode.save')}</p>
		</label>{/if}
	<div class="rounded border border-primary-400-500-token p-4 m-2 mt-8">
		Sample
		<div class="grid sm:grid-cols-2 grid-cols-1">
			<div class="mx-2">
				<Samples light={true} />
			</div>
			<div class="mx-2">
				<Samples light={false} />
			</div>
		</div>

		<!-- <div class="mt-5">
	🌆{$_('mode.light_switch')}
	<div class="mt-2">
		<LightSwitch />
	</div> 
</div>-->

		<div class="mt-2 grid grid-cols-[auto_1fr]">
			<div class="ml-1">*</div>
			<ul class=" text-sm pl-1 pt-1">
				<li>
					<div class="break-keep">{$_('mode.normal_exp')}</div>
					<div>{$_('mode.normal_exp2')}</div>
				</li>
				<li class="mt-1">
					<span class="break-keep">{$_('mode.light_exp')}</span>
					<div>{$_('mode.light_exp2')}</div>
				</li>
			</ul>
		</div>
	</div>
</div>
<div
	class=" fixed bottom-0 left-0 w-full sm:h-12 h-10 bg-primary-200-700-token"
>
	<FooterIcons />
</div>
