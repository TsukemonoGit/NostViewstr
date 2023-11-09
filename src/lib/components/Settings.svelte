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

表示モードを選択してください
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
		<div class="text-sm pl-1 pt-1">
			{$_('mode.light_exp')}
		</div>
	</div>
</div>
<div class="mt-5">
	{$_('mode.light_switch')}
	<div class="mt-2">
		<LightSwitch />
	</div>
</div>

<!-- <div>
	{$_('Settings.login')}
	<div>
		公開鍵設定
		<input type="text" placeholder="npub1..." />
		<button class="btn variant-filled-primary">Use Browser Extension</button>
	</div> -->

<!-- <div>
		<input
			type="checkbox"
		/>URLプレビュー画像展開表示する（モバイルの場合通信料に注意）

		<input
			type="checkbox"
		/>ユーザーアイコンを表示する（モバイルの場合通信料に注意）
	</div>
	<button class="btn variant-filled-primary">OK</button>
</div> -->
