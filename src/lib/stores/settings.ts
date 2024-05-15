import { writable } from 'svelte/store';

export const pubkey_viewer = writable<string>('');
//export const settings = writable<boolean>(false);
export const URLPreview = writable<boolean>(undefined);
export const iconView = writable<boolean>(undefined);

export const allView = writable<boolean>(false);
export const nowProgress = writable<boolean>(false);
export const nsec = writable<string>();

export enum MultiMenu {
	None,
	Multi,
	Sort
}
export const isMulti = writable<MultiMenu>(MultiMenu.None);

//export const kind = writable<number>(30001);
export const backButton = writable<boolean>(false);
export const nip46Check = writable<boolean>(true); //nip46ログインが拒否されたらfalse

export const send_pubhex = writable<string>('');
//localstrageのinfo情報
export const saveObj = writable<{
	pub: string;
	kind: number;
	iconView: boolean;
	URLPreview: boolean;
} | null>(null);

export let login = writable<boolean>(false);

export let kindSortToggle = writable<boolean>(true);
