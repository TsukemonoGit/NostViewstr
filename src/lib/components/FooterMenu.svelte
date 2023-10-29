<script lang="ts">
	import { allView, nowProgress } from '$lib/stores/settings';
	import Setting from '@material-design-icons/svg/round/settings.svg?raw';
</script>

<div class=" fixed bottom-0 z-10 w-screen">
	<div
		class="btn-group py-0.5 variant-filled-primary w-screen justify-center rounded-none"
	>
		<button>btn</button>
		<button>btn</button>
		<button class="fill-white">{@html Setting}</button>
	</div>
</div>
