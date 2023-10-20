import { writable } from 'svelte/store';
import type { Event } from 'nostr-tools';

export const bookmarkEvents = writable<Event[] | undefined>();

export const pubkey = writable<string>();
