import { writable } from 'svelte/store';

export const pubkey_viewer = writable<string>('');
//export const settings = writable<boolean>(false);
export const URLPreview = writable<boolean>(false);
export const iconView = writable<boolean>(false);

export const allView = writable<boolean>(false);
export const nowProgress = writable<boolean>(false);
export const nsec = writable<string>();
export const isMulti = writable<boolean>(false);
//export const kind = writable<number>(30001);
