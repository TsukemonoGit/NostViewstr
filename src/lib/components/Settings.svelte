<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { iconView, URLPreview, settings } from '$lib/stores/settings';
	import { bookmarkEvents } from '$lib/stores/bookmarkEvents';
	
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
<div>
	<button class="btn variant-filled-primary" on:click={clickDefault}
		>通常モード</button
	>
	<button class="btn variant-filled-primary" on:click={clickLight}
		>通信量軽量モード</button
	>
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
