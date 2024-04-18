<script lang="ts">
	import FeedbackIcon from '@material-design-icons/svg/round/announcement.svg?raw';
	import lightningIcon from '@material-design-icons/svg/round/bolt.svg?raw';
	import githubIconWhite from '$lib/assets/github-mark-white.png';
	import { nostrIcon } from '$lib/components/icons';
</script>

<div class="flex gap-6 sm:gap-10 justify-center h-full">
	<a
		class="btn p-0 badge-icon sm:w-[32px] sm:h-[32px] w-[24px] h-[24px] variant-filled-surface rounded-full flex self-center"
		rel="external noreferrer"
		target="_blank"
		href="https://github.com/TsukemonoGit/nostviewstr"
	>
		<img src={githubIconWhite} class=" w-[18px] h-[18px]" alt="githubLink" />
	</a>

	<a
		class="btn p-0 badge-icon sm:w-[32px] sm:h-[32px] w-[24px] h-[24px] nostr variant-filled-surface rounded-full flex self-center"
		rel="external noreferrer"
		target="_blank"
		href="https://nostter.app/mono@tsukemonogit.github.io"
	>
		{@html nostrIcon}
	</a>
	<button
		class="light btn p-0 m-0 sm:w-[32px] sm:h-[32px] w-[24px] h-[24px] badge-icon variant-filled-surface rounded-full flex self-center"
		data-npub="npub1sjcvg64knxkrt6ev52rywzu9uzqakgy8ehhk8yezxmpewsthst6sw3jqcw"
		data-note-id="note1sgfa7nh4p4k76k23e0vr0k95svg5hp3xqshq6ewd9jaut6hnp7jq8jhpy8"
		data-relays="wss://yabu.me,wss://nos.lol,wss://relay.nostr.wirednet.jp,wss://relay.nostr.band"
		>{@html lightningIcon}</button
	> <script src="https://cdn.jsdelivr.net/npm/nostr-zap@0.22.0"></script>
	<button
		class="feedback btn p-0 m-0 sm:w-[32px] sm:h-[32px] w-[24px] h-[24px] badge-icon variant-filled-surface rounded-full flex self-center"
		on:click={() => {}}>{@html FeedbackIcon}</button
	>
</div>

<style>
	:global(.light svg) {
		width: 32px;
		height: 32px;
		fill: yellow;
	}
	:global(.feedback svg) {
		width: 18px;
		height: 18px;
		fill: white;
	}
</style>
