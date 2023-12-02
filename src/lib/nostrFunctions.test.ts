// import {
// 	getRelays,
// 	setRelays,
// 	fetchFilteredEvents,
// 	idlatestEach
// } from './nostrFunctions';
// import { writeFile } from 'fs/promises';
// import { expect, it } from 'vitest';
// import { testRelay } from './testData/test.js';
// import { bookmarkRelays } from './stores/relays';
// import { get } from 'svelte/store';

// import {
// 	createRxNostr,
// 	createRxOneshotReq,
// 	Nostr,
// 	uniq,
// 	verify,
// 	latest,
// 	completeOnTimeout,
// 	latestEach,
// 	type EventPacket
// } from 'rx-nostr';
// import { from } from 'rxjs';
// it('relays', async () => {
// 	// const result = await getRelays(
// 	// 	'84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5'
// 	// );
// 	// console.log(result);
// 	// writeFile('./test.json', JSON.stringify(result, null, 2));
// 	// expect(result);
// });

// it('setRelays', async () => {
// 	await setRelays(testRelay);
// });

// it('fetchFilteredEvents', async () => {
// 	// const filter = [
// 	// 	{
// 	// 		kinds: [30001],
// 	// 		authors: [
// 	// 			'84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5'
// 	// 		]
// 	// 	}
// 	// ];
// 	// const res = await fetchFilteredEvents(get(bookmarkRelays), filter);
// 	// console.log(res);
// });

// // it('idlatestEach', async () => {
// //   // テストデータを準備する必要があります
// //   // ここで rxNostr, rxReq, filters などの適切なテストデータを用意します
// //   // また、テストデータに合ったイベントパケットを用意することも必要です

// //   // 1. テストデータの準備

// //   // テストデータとして rxNostr, rxReq, filters を設定します
// //   const rxNostr = createRxNostr();
// //   rxNostr.setRelays(["wss://rest"]);
// // const filter={ids:["test"]};
// //   const rxReq = createRxOneshotReq( {filters:[filter]} );

// //   // テストデータに合ったイベントパケットを作成します
// //   const eventPacket = {
// //     event: {
// //       tags: [['tag1', 'value1'], ['tag2', 'value2']]
// //     }
// //   };

// //   // 2. テスト対象のコードを実行

// //   const keyFunction = (packet: { event: { tags: any[][]; }; }) => packet.event.tags[0][1];
// //   const observable = rxNostr.use(rxReq).pipe(idlatestEach(keyFunction));

// //   // 3. テスト対象のコードを実行し、結果をアサート

// //   // テスト対象のコードが正しく動作することを確認します
// //   const result = await observable.toPromise();

// //   // 4. 結果のアサーション

// //   // 期待される結果をアサートします
// //   // この部分を具体的に設定して、テストが成功するかどうかを確認します
// //   expect(result)//.toEqual(/* 期待される結果 */);
// // });
// it('should group and merge events based on the provided key', () => {
// 	// テストデータを準備
// 	const eventPackets = [
// 		{
// 			event: {
// 				tags: [
// 					['d', 'value1'],
// 					['e', 'value4']
// 				],
// 				created_at: 123
// 			}
// 		},
// 		{
// 			event: {
// 				tags: [
// 					['d', 'value2'],
// 					['e', 'value5']
// 				],
// 				created_at: 1223 //  value2で一番新しいイベント
// 			}
// 		},
// 		{
// 			event: {
// 				tags: [
// 					['d', 'value1'],
// 					['e', 'value6']
// 				],
// 				created_at: 1224 //  value１で一番新しいイベント
// 			}
// 		}
// 	];

// 	// key 関数の定義
// 	const keyFunction = (packet: { event: { tags: any[][] } }) =>
// 		packet.event.tags[0][1];

// 	// idlatestEach 関数を適用
// 	const observable = from(eventPackets).pipe(idlatestEach());

// 	// 期待される出力を定義
// 	const expectedOutput = [
// 		{
// 			event: {
// 				tags: [
// 					['d', 'value1'],
// 					['e', 'value6'] // 修正: 一番新しいイベント
// 				],
// 				created_at: 1224
// 			}
// 		},
// 		{
// 			event: {
// 				tags: [
// 					['d', 'value2'],
// 					['e', 'value5']
// 				],
// 				created_at: 1223
// 			}
// 		}
// 	];

// 	// アサーション
// 	const receivedOutput: any[] = [];
// 	observable.subscribe((packet: any) => {
// 		receivedOutput.push(packet);
// 	});

// 	console.log(receivedOutput);
// 	// 期待値と受信した値を比較
// 	expect(receivedOutput).toEqual(expectedOutput);
// });
