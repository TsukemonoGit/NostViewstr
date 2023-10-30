<script lang="ts">
	import { allView, nowProgress, settings } from '$lib/stores/settings';
	import Setting from '@material-design-icons/svg/round/settings.svg?raw';
	import firstIcon from '@material-design-icons/svg/round/first_page.svg?raw';
	import lastIcon from '@material-design-icons/svg/round/last_page.svg?raw';
	import backIcon from '@material-design-icons/svg/round/chevron_left.svg?raw';
	import nextIcon from '@material-design-icons/svg/round/chevron_right.svg?raw';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	$: console.log(
		`${$amount * $pageNum} - ${Math.min(($pageNum + 1) * $amount, $listSize)}`
	);
	$: last = Math.floor($listSize / $amount);
	function next(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if ($pageNum < Math.floor($listSize / $amount)) {
			$pageNum++;
		}
	}

	function back(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if ($pageNum > 0) {
			$pageNum--;
		}
	}

	function firstPage(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		$pageNum = 0;
	}

	function lastPage(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		$pageNum = last;
	}

	const buttonClass = 'pageIcon btn btn-sm  fill-white';
</script>

{#if $settings}
	<div class=" fixed bottom-0 z-10 w-screen">
		<div
			class=" inline-flex flex-row space-x-0 overflow-hidden rounded-token; variant-filled-primary w-screen justify-center rounded-none"
		>
			<button
				class={buttonClass}
				on:click={firstPage}
				disabled={$pageNum === 0 ? true : false}>{@html firstIcon}</button
			>
			<button
				class={buttonClass}
				on:click={back}
				disabled={$pageNum === 0 ? true : false}>{@html backIcon}</button
			>
			<div class="flex justify-center items-center">
				{`${$amount * $pageNum} - ${Math.min(
					($pageNum + 1) * $amount,
					$listSize
				)}`}
			</div>
			<button
				class={buttonClass}
				on:click={next}
				disabled={$pageNum === last ? true : false}>{@html nextIcon}</button
			>
			<button
				class={buttonClass}
				on:click={lastPage}
				disabled={$pageNum === last ? true : false}>{@html lastIcon}</button
			>
			<button class={buttonClass}>{@html Setting}</button>
		</div>
	</div>
{/if}

<style>
	:global(.pageIcon svg) {
		width: 2em;
		height: 2em;
		fill: white;
	}
</style>
