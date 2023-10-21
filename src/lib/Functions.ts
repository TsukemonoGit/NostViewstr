export enum MenuMode {
	Multi, //複数選択モード
	Owner, //追加削除ボタン込み
	Viewer //追加削除ボタンなし
}

// サーバーサイドでのOGP情報取得は不要なので、クライアントサイド用の関数を追加する
interface Ogp {
	title: string;
	image: string;
	description: string;
	favicon: string;
}
import type { Metadata } from 'unfurl.js/dist/types';

export async function getOgp(url: string): Promise<Ogp> {
	try {
		const response = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`).catch((err) =>
			console.log(err)
		);
		const result = (await response?.json().catch((err) => console.log(err))) as Metadata;

		// APIエンドポイントから取得したOGP情報を返す
		return {
			title: result.title || '',
			image: result.open_graph && result.open_graph.images ? result.open_graph.images[0].url : '',
			description: (result.open_graph && result.open_graph.description) || '',
			favicon: result.favicon || ''
		};
	} catch (error) {
		console.log(error);
		return {
			title: '',
			image: '',
			description: '',
			favicon: ''
		};
	}
}
