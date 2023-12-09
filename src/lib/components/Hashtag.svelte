<script lang="ts">
	import { tagExp } from '$lib/kind';
	import { encodedURL } from '$lib/otherFunctions';

	export let tagArray: string[];

	let hashtag = '#' + tagArray?.[1];
</script>

<!--ICON そのた-->
<div class="pl-1 grid grid-rows-[auto_1fr] gap-1.5">
	<div>{tagExp[tagArray[0]]}</div>
	<div class="pl-2">
		<a
			class="anchor"
			rel="external noreferrer"
			target="_blank"
			href={encodedURL(hashtag)}>{hashtag}</a
		>
	</div>
</div>
