import { getRelays, setRelays } from './nostrFunctions';
import { writeFile } from 'fs/promises';
import { expect, it } from 'vitest';
import { testRelay } from './test.js';
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
