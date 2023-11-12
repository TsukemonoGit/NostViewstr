import type { Metadata } from 'unfurl.js/dist/types';

export enum MenuMode {
	Multi, //複数選択モード
	Owner, //追加削除ボタン込み
	Viewer, //追加削除ボタンなし
	other, //追加削除ボタンだけ（ノート読み込めてないときとか、ノートじゃないときとか）
	none //ぼたんなし
}

// サーバーサイドでのOGP情報取得は不要なので、クライアントサイド用の関数を追加する
interface Ogp {
	title: string;
	image: string;
	description: string;
	favicon: string;
}

export async function getOgp(url: string): Promise<Ogp> {
	try {
		const response = await fetch(
			`/api/ogp?url=${encodeURIComponent(url)}`
		).catch((err) => console.log(err));
		const result = (await response
			?.json()
			.catch((err) => console.log(err))) as Metadata;

		// APIエンドポイントから取得したOGP情報を返す
		return {
			title: result.title || '',
			image:
				result.open_graph && result.open_graph.images
					? result.open_graph.images[0].url
					: '',
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

export const uniqueTags = async (tags: any[]): Promise<string[][]> => {
	if (tags.length > 0) {
		return await tags.reduce((acc: any[][], curr: [any, any]) => {
			const [tag1, tag2, ...tag3] = curr;
			const isDuplicate = acc.some(
				([existingTag1, existingTag2]) =>
					existingTag1 === tag1 && existingTag2 === tag2
			);
			const isValidTag =
				tag1 !== 'emoji' && tag1 !== 'r' && tag1 !== 't' && tag1 !== 'q';

			// 追加: 最後の要素が"mention"でない場合にのみ追加する
			//(mentionは引用でこんてんとのなかにnostr:~~ではいってるはずということから)
			//mentionのeタグだけ除外
			//const isMention = tag3[tag3.length - 1] === 'mention';
			const isMention = tag3[tag3.length - 1] === 'mention' && tag1 === 'e';
			if (!isDuplicate && isValidTag && !isMention) {
				acc.push([tag1, tag2, ...tag3]);
			}
			return acc;
		}, []);
	} else {
		return [];
	}
};
