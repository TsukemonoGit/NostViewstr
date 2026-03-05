import { getToastStore, type ToastStore } from '@skeletonlabs/skeleton';
import { createCustomModalStore, type CustomModalStore } from './customModal';

export let modalStore: CustomModalStore;
export let toastStore: ToastStore;

export function setModalStore() {
	modalStore = createCustomModalStore();
}

export function setToastStore() {
	toastStore = getToastStore();
}
