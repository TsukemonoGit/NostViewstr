import {
	getModalStore,
	getToastStore,
	type ModalStore,
	type ToastStore
} from '@skeletonlabs/skeleton';

export let modalStore: ModalStore;
export let toastStore: ToastStore;

export function setModalStore() {
	modalStore = getModalStore();
}

export function setToastStore() {
	toastStore = getToastStore();
}
