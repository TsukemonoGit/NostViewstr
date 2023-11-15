<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { iconView, URLPreview, settings } from '$lib/stores/settings';
	import { bookmarkEvents } from '$lib/stores/bookmarkEvents';
	import { LightSwitch } from '@skeletonlabs/skeleton';

	const clickDefault = () => {
		//bookmarkEventsのしょきか
		$bookmarkEvents = [];
		iconView.set(true);
		URLPreview.set(true);
		settings.set(true);
	};

	const clickLight = () => {
		//bookmarkEventsのしょきか
		$bookmarkEvents = [];
		iconView.set(false);
		URLPreview.set(false);
		settings.set(true);
	};
</script>

📶{$_('mode.viewMode')}*
<div class="flex gap-4 mt-2">
	<div>
		<button class="btn variant-filled-primary" on:click={clickDefault}
			>{$_('mode.normal')}</button
		>
	</div>
	<div>
		<button class="btn variant-filled-primary" on:click={clickLight}
			>{$_('mode.light')}</button
		>
	</div>
</div>
<div class="mt-5">
	🌆{$_('mode.light_switch')}
	<div class="mt-2">
		<LightSwitch />
	</div>
</div>
<div class="mt-10">
	<div class="grid grid-cols-[auto_1fr]">
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
