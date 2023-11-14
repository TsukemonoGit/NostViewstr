import { extractTextParts } from '$lib/content';

const content = `MDN に全部書いてあった
https://developer.mozilla.org/ja/docs/Web/HTTP/Basics_of_HTTP/MIME_types#applicationoctet-stream
> 警告: ブラウザーは URL を処理する方法を決定するために、ファイル拡張子ではなく MIME タイプを使用しますので、ウェブサーバーは正しい MIME タイプをレスポンスの Content-Type ヘッダーで送信することが重要です。 これが正しく構成されていないと、ブラウザーはファイルの中身を誤って解釈し、サイトが正しく動作しなかったり、ダウンロードファイルが誤って扱われたりすることがあります。`;
//#applicationoctet-streamの部分でエラーが出る
//テストではエラーが出ない
it('extractTextParts', async () => {
	const res = await extractTextParts(content, []);
	console.log(res);
});
