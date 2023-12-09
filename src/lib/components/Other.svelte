<script lang="ts">
	import { tagExp } from '$lib/kind';

	export let tagArray: string[];
</script>

<!--ICON そのた-->
<div class="pl-1 grid grid-rows-[auto_1fr] gap-1.5">
	<div>{tagExp[tagArray[0]]}</div>
	<div class="pl-2">{tagArray[1]}</div>
</div>
