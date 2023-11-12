<script lang="ts">
	import '../app.postcss';
	import {
		computePosition,
		autoUpdate,
		offset,
		shift,
		flip,
		arrow
	} from '@floating-ui/dom';
	import {
		Modal,
		Toast,
		initializeStores,
		storePopup
	} from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
	//最初に一回だけ実行するやつ
	import { setModalStore } from '$lib/stores/store';
	import { setToastStore } from '$lib/stores/store';
	initializeStores();
	setModalStore();
	setToastStore();
</script>

<slot />
<Modal />
<Toast class="z-[9999]" />
