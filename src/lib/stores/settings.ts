import { writable } from 'svelte/store';

export const pubkey_viewer = writable<string>('');
//export const settings = writable<boolean>(false);
export const URLPreview = writable<boolean>(undefined);
export const iconView = writable<boolean>(undefined);

export const allView = writable<boolean>(false);
export const nowProgress = writable<boolean>(false);
export const nsec = writable<string>();
export const isMulti = writable<boolean>(false);
//export const kind = writable<number>(30001);
export const backButton = writable<boolean>(false);
export const nip46Check = writable<boolean>(true); //nip46ログインが拒否されたらfalse
