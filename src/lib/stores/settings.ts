import { writable } from 'svelte/store';

export const pubkey = writable<string>(
	'84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5'
);
export const settings = writable<boolean>(false);
export const URLPreview = writable<boolean>(false);
export const iconView = writable<boolean>(false);

export const allView = writable<boolean>(false);

export const kind = writable<number>(30001);
