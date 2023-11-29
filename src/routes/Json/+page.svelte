<script lang="ts">
	import { FileButton, LightSwitch } from '@skeletonlabs/skeleton';

	import { goto } from '$app/navigation';

	import { _ } from 'svelte-i18n';

	import { iconView, URLPreview } from '$lib/stores/settings';

	import { toastStore } from '$lib/stores/store';
	import { JsonEventData } from '$lib/stores/bookmarkEvents';
	import type { Nostr } from 'nosvelte';

	let files: FileList | undefined;
	let fileData: File | undefined;
	const allowedExtensions = ['.json'];
	const handleFileChange = () => {
		const selectedFile = files?.[0];

		if (selectedFile) {
			const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

			if (!allowedExtensions.includes(`.${fileExtension}`)) {
				const t = {
					message: $_('toast.invalidJson'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);

				// ファイル選択をクリア
				files = undefined;
				return;
			}
			fileData = selectedFile;
			console.log(fileData);
		}
	};
	$: console.log(fileData);

	const clickDefault = async () => {
		const check = await CheckJson();
		//bookmarkEventsのしょきか
		if (!check) {
			return;
		} else {
			iconView.set(true);
			URLPreview.set(true);
			//settings.set(true);
			goto(`/Json/View`);
		}
	};

	const clickLight = async () => {
		//bookmarkEventsのしょきか
		const check = await CheckJson();

		if (!check) {
			return;
		} else {
			iconView.set(false);
			URLPreview.set(false);
			//settings.set(true);
			goto(`/Json/View`);
		}
	};

	async function CheckJson(): Promise<boolean> {
		if (fileData === undefined) {
			const t = {
				message: $_('toast.selectJson'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			return false;
		}

		try {
			const tmp: Nostr.Event = JSON.parse(await fileData.text()); // ファイルをテキストとして読み込み、JSONパース
			$JsonEventData = tmp;
			return true;
			// 他の処理...
		} catch (error) {
			const t = {
				message: $_('toast.checkJson'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			return false;
		}
	}
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1">{$_('main.title')}</h1>

		<div class="space-t-5 min-w-[80vw]">
			<div class="mt-10">
				<h5 class="h5">{`view from json`}</h5>

				<div class="flex gap-4 mt-1">
					<div>
						<FileButton bind:files on:change={handleFileChange} name="files" />
					</div>
					<div>
						<button
							class="btn variant-filled-primary"
							on:click={() => {
								fileData = undefined;
							}}>Reset</button
						>
					</div>
				</div>
			</div>
			{#if fileData}
				{fileData.name}
			{/if}
		</div>

		<div class="mt-10">
			<h5 class="h5">📶{$_('mode.viewMode')}*</h5>
			<div class="flex gap-4 mt-1">
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
		</div>
		<!-- <div class="mt-5">
	🌆{$_('mode.light_switch')}
	<div class="mt-2">
		<LightSwitch />
	</div> 
</div>-->
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
	</div>
</div>
