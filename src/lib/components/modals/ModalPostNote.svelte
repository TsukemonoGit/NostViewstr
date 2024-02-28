<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { relaySet } from '$lib/stores/relays';
	import type { Event } from 'nostr-tools';

	import { publishEventWithTimeout } from '$lib/streamEventLists';
	import { pubkey_viewer } from '$lib/stores/settings';
	import postIcon from '@material-design-icons/svg/round/post_add.svg?raw';

	export let parent: any;
	let checked: boolean;
	let kind: number | undefined = $modalStore[0].value?.kind;
	let isRepostable =
		$modalStore[0].value?.tagArray?.[0] === 'e' && $modalStore[0].value?.pubkey;
	let tags = [...$modalStore[0].value.tags];
	//kind1の引用の場合のみqtagsに変更する
	if (kind === 1) {
		tags.map((item) => {
			if (item[0] === 'e') {
				item[0] = 'q';
			}
		});
	}
	let contents = {
		//id:'',
		pubkey: $modalStore[0].value.pubkey ? $modalStore[0].value.pubkey : '',
		//created_at:,
		kind: 1,
		tags: tags,
		content: $modalStore[0].value.content
		//sig:''
	};
	$: contents.content = res.content;

	const tags_p = [['p', contents.pubkey, '', 'mention'], ...contents.tags];

	let res = {
		content: $modalStore[0].value.content,
		tags: $modalStore[0].value.tags
	};

	// We've created a custom submit function to pass the response and close the modal.
	async function onFormSubmit(): Promise<void> {
		if (res.content === undefined) {
			res.content = '';
		}
		res.content = res.content.trim();
		if (checked) {
			res.tags = [['p', contents.pubkey, '', 'mention'], ...contents.tags];
		}
		//		if ($modalStore[0].response) $modalStore[0].response(res);
		const event: Event = {
			id: '',
			pubkey: $pubkey_viewer,
			created_at: Math.floor(Date.now() / 1000),
			kind: 1,
			tags: res.tags,
			content: res.content,
			sig: ''
		};
		const response = await publishEventWithTimeout(
			event,
			$relaySet[$pubkey_viewer].postRelays
		);
		const toastSettings: ToastSettings = response.isSuccess
			? {
					message: `publish result<br>${response.msg}`,
					timeout: 5000
			  }
			: {
					message: `failed to publish`,
					background: 'bg-orange-500 text-white width-filled ',
					timeout: 5000
			  };
		toastStore.trigger(toastSettings);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold flex  ';
	// const cForm =
	//   'border border-surface-500 p-4 space-y-4 rounded-container-token';

	function onClickCopy() {
		navigator.clipboard.writeText(res.content.trim()).then(
			() => {
				/* clipboard successfully set */
				const t = {
					message: $_('PostNote.copied'),
					timeout: 3000
				};
				toastStore.trigger(t);
			},
			() => {
				/* clipboard write failed */
				const t = {
					message: $_('PostNote.failed_copy'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};
				toastStore.trigger(t);
			}
		);
	}

	async function repostNote() {
		if ($modalStore[0].value?.tagArray && $modalStore[0].value?.pubkey) {
			const tags = [
				$modalStore[0].value.tagArray,
				['p', $modalStore[0].value.pubkey]
			];
			if (kind !== undefined) {
				tags.push(['k', kind.toString()]);
			}
			console.log(tags);

			const event: Event = {
				id: '',
				pubkey: $pubkey_viewer,
				created_at: Math.floor(Date.now() / 1000),
				kind: kind === 1 ? 6 : 16,
				tags: tags,
				content: '',
				sig: ''
			};
			const response = await publishEventWithTimeout(
				event,
				$relaySet[$pubkey_viewer].postRelays
			);
			const toastSettings: ToastSettings = response.isSuccess
				? {
						message: `publish result<br>${response.msg}`,
						timeout: 5000
				  }
				: {
						message: `failed to publish`,
						background: 'bg-orange-500 text-white width-filled ',
						timeout: 5000
				  };
			toastStore.trigger(toastSettings);
			modalStore.close();
		}
	}
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<div class="grid grid-cols-[1fr_auto]">
			<header class={cHeader}>
				<span class="dark:fill-white">{@html postIcon}</span>{$modalStore[0]
					.title ?? '(title missing)'}
			</header>

			<button class="btn-icon variant-filled-surface" on:click={onClickCopy}
				>📋</button
			>
		</div>
		<article class="body break-all whitespace-pre-wrap">
			{$modalStore[0].body ?? '(body missing)'}
		</article>
		<!-- Enable for debugging: -->

		{#if isRepostable}
			<p>Repost:</p>
			<button
				class="btn variant-filled-secondary"
				type="button"
				on:click={repostNote}>Repost</button
			>
			<p>Quote:</p>
		{/if}

		<textarea
			class="textarea"
			rows="5"
			placeholder=""
			bind:value={res.content}
		/>
		{#if contents.pubkey !== ''}
			<label class="flex items-center space-x-2">
				<input class="checkbox" type="checkbox" bind:checked />
				<p>{$_('PostNote.p_tag')}</p>
			</label>
		{/if}

		<div class="break-all text-sm">
			<p>
				<b>kind:</b>
				{contents.kind}
			</p>
			<p>
				<b>content:</b><br />
				<span class="whitespace-pre-wrap"> {contents.content}</span>
			</p>
			<p>
				<b>tags:</b><br />
				<span class="text-xs"
					>[{#if contents.tags}
						{#each checked ? tags_p : contents.tags as tags}
							<div class="ml-2">{JSON.stringify(tags, null, 0)},</div>
						{/each}
					{/if}]</span
				>
			</p>
		</div>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}
				>Post Note</button
			>
		</footer>
	</div>
{/if}
