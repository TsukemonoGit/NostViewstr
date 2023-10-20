import { writable } from 'svelte/store';

export const pubkey = writable<string>();

export const allView = writable<boolean>(false);
