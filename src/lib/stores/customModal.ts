/**
 * Custom Modal Store - Svelte 5 compatible replacement for Skeleton v2's modal system.
 *
 * Key difference: two-phase close.
 *   1. `close()` sets a "closing" signal but keeps the store data intact.
 *   2. The Modal component starts its out-transition while data is still available.
 *   3. After the transition ends, `_commitClose()` actually removes the entry.
 *
 * This prevents "Cannot read properties of undefined" errors that occur in Svelte 5
 * when child components access `$modalStore[0]` during out-transitions.
 */
import {
	writable,
	get,
	type Subscriber,
	type Unsubscriber,
	type Updater
} from 'svelte/store';
import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';

export type { ModalSettings, ModalComponent };

export interface CustomModalStore {
	subscribe: (
		run: Subscriber<ModalSettings[]>,
		invalidate?: () => void
	) => Unsubscriber;
	set: (value: ModalSettings[]) => void;
	update: (updater: Updater<ModalSettings[]>) => void;
	/** Add a new modal to the queue */
	trigger: (settings: ModalSettings) => void;
	/** Signal the modal to start closing (data kept for transition) */
	close: () => void;
	/** Clear all modals immediately */
	clear: () => void;
	/** @internal Called by Modal component after out-transition completes */
	_commitClose: () => void;
	/** @internal Readable store indicating if a close transition is in progress */
	_closing: {
		subscribe: (
			run: Subscriber<boolean>,
			invalidate?: () => void
		) => Unsubscriber;
	};
}

export function createCustomModalStore(): CustomModalStore {
	const queue = writable<ModalSettings[]>([]);
	const closing = writable(false);

	function commitClose() {
		closing.set(false);
		queue.update((q) => (q.length > 0 ? q.slice(1) : q));
	}

	function trigger(settings: ModalSettings) {
		// If a close transition is pending, commit it before adding new modal
		if (get(closing)) {
			commitClose();
		}
		queue.update((q) => [...q, settings]);
	}

	function close() {
		// Don't empty the store yet – just signal the Modal component to start
		// its out-transition.  The data stays so child components won't crash.
		closing.set(true);
	}

	function clear() {
		closing.set(false);
		queue.set([]);
	}

	return {
		subscribe: queue.subscribe,
		set: queue.set,
		update: queue.update,
		trigger,
		close,
		clear,
		_commitClose: commitClose,
		_closing: { subscribe: closing.subscribe }
	};
}
