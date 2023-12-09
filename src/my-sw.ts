// sw.js ファイル内の例
import { precacheAndRoute } from 'workbox-precaching';

// precacheAndRoute メソッドを使ってキャッシュを設定する
precacheAndRoute([
	{ url: '/' }
	// 他のプリキャッシュしたいリソースも追加
]);
console.log('[service worker]');
