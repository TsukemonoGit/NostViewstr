<script lang="ts">
	//アイコンの表示設定の有無があるからさんぷるように別で
	export let ogp: {
		title: string;
		image: string;
		description: string;
		favicon: string;
		memo?: string;
	};
	export let url: string;
</script>

<div
	class="drop-shadow-md rounded-xl m-1 p-1 border border-primary-400 hover:drop-shadow-xl break-all bg-primary-200 dark:bg-primary-700 dark:hover:border-primary-400 dark:border-primary-500"
>
	<a class="" href={url} target="_blank">
		<div class="grid grid-rows-[auto_1fr]">
			<div class="grid grid-cols-[0.5fr_1.5fr] gap-0.5">
				<div
					class="overflow-hidden relative rounded-xl max-h-[6rem] flex justify-center"
				>
					<img
						loading="lazy"
						class="object-contain max-h-[6rem] max-w-full"
						src={ogp.image}
						alt=""
					/>
				</div>
				<div class="p-0.5 grid grid-rows-[auto_1fr] w-full">
					<div
						class="line-clamp-2 text-sm font-bold text-primary-700 dark:text-primary-100"
					>
						{ogp.title}
					</div>
					<div
						class="line-clamp-4 text-xs text-primary-500 dark:text-primary-300 max-w-full"
						style="	white-space: pre-wrap; word-break: break-word;"
					>
						{ogp.description}
					</div>
				</div>
			</div>

			<div class="flex flex-row-reverse ... -my-1">
				{#if ogp.favicon !== ''}
					<img
						loading="lazy"
						class="object-contain w-5 pl-0.5 pr-0.5"
						src={ogp.favicon}
						alt=""
					/>
				{/if}
				<div class="text-xs text-primary-500 dark:text-primary-300">
					{#if ogp.memo}
						{ogp.memo} /
					{/if}{new URL(url).hostname}
				</div>
			</div>
		</div>
	</a>
</div>
