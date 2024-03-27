import { writable } from 'svelte/store';

export const listSize = writable<number>(0);
export const pageNum = writable<number>(0);
export const amount = writable<number>(4);
