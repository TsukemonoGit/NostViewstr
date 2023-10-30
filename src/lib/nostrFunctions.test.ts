import { getRelays, setRelays, fetchFilteredEvents } from './nostrFunctions';
import { writeFile } from 'fs/promises';
import { expect, it } from 'vitest';
import { testRelay } from './testData/test.js';
import { bookmarkRelays } from './stores/relays';
import { get } from 'svelte/store';
it('relays', async () => {
	// const result = await getRelays(
	// 	'84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5'
	// );
	// console.log(result);
	// writeFile('./test.json', JSON.stringify(result, null, 2));
	// expect(result);
});

it('setRelays', async () => {
	await setRelays(testRelay);
});

it('fetchFilteredEvents', async () => {
	// const filter = [
	// 	{
	// 		kinds: [30001],
	// 		authors: [
	// 			'84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5'
	// 		]
	// 	}
	// ];
	// const res = await fetchFilteredEvents(get(bookmarkRelays), filter);
	// console.log(res);
});
