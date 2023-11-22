import { uniqueTags } from './otherFunctions';

test('tag', async () => {
	const result = await uniqueTags([
		[
			'e',
			'23b933abc8da1edf89e1f68dda1658be58da530155a25da8e4b626eb8f7b59be',
			'',
			'mention'
		],
		[
			'p',
			'a9f8b3f2ac19cc06d5194dd1ac9314d4741a09777444986553926d9165181647',
			'',
			'mention'
		],
		['t', 'Amethyst'],
		['t', 'amethyst'],
		['t', 'zapathon'],
		['t', 'zapathon']
	]);
	console.log(result);
	expect(result).toStrictEqual([
		[
			'p',
			'a9f8b3f2ac19cc06d5194dd1ac9314d4741a09777444986553926d9165181647',
			'',
			'mention'
		]
	]);
});
