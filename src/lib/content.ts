enum TextPartType {
	Text = 'text',
	URL = 'url',
	Emoji = 'emoji',
	Image = 'image',
	Newline = 'newline',
	Nostr = 'nostr',
	Space = 'space',
	Quote = 'quote',
	Hashtag = 'hashtag'
}

export interface TextPart {
	content: string;
	type: TextPartType;
	url?: string;

	number?: number;
}
const emojiRegex = /(:[^:\s]+:)/;

const urlRegex = /(https?:\/\/+[^\s"'<`\]]+[^\s"'<`:\].]+)/;
const imageRegex = /\.(?:jpg|jpeg|png|gif|webp)$/i;

//const linesRegex = /(\r\n|\n|\r)/;

const nostrRegex2 = /(nostr:[A-Za-z0-9]+)/; // 「+」を追加して1文字以上の文字列にマッチするように修正

const numberRegex = /(#\[\d+\])/i;
const hashtagRegex = /(\B#[^\s#.?:/。、　()（）]+)/gi;

//const hashtagRegex = /(?:^|\s)(\B#[^\s#\/.\-?:。、　()（）]+)(?=\s|$)/gi;
//hashtagRegex の中で(?:^|\s)と(?=\s|$)を追加したことです。これにより、ハッシュタグの前後に空白か行の先頭/末尾がある場合にのみマッチするようになります
//()を含むと、それを含める結果が帰る// /(#\S+)/i;

export async function extractTextParts(text: string, tags: string[][]) {
	try {
		//とりあえずタグに絵文字タグがある場合とない場合でわけておく（いらんかも
		const emoji = tags.filter((item) => item[0] === 'emoji');
		//  const emojiPatterns = tags.map(tag => `:${tag[1]}:`).join('|');
		// const emojiRegex = new RegExp(`(${emojiPatterns})`, 'u');

		const hashTag = tags.filter((item) => item[0] === 't');
		// タグを長さの降順で並び替え
		hashTag.sort((a, b) => b[1].length - a[1].length);

		//const hashTagPatterns = hashTag.map((tag) => tag[1]).join('|');
		//const hashtagRegexT = new RegExp(`(#[${hashTagPatterns}])`, 'gi');
		//console.log(hashtagRegexT);
		// const hashtagRegex=/(#[ hashTagPatterns])/i
		//console.log(emoji);
		let regexPatterns: string[] = [];

		if (emoji.length > 0) {
			regexPatterns.push(emojiRegex.source);
		}
		if (hashTag.length > 0) {
			regexPatterns.push(hashtagRegex.source);
		}
		regexPatterns.push(nostrRegex2.source);
		regexPatterns.push(urlRegex.source);
		regexPatterns.push(imageRegex.source);

		//regexPatterns.push(linesRegex.source);
		regexPatterns.push(numberRegex.source);

		//regexPatterns.push(/\s/.source);

		const regex = new RegExp(regexPatterns.join('|'), 'g');

		const words: string[] = text.split(regex);

		//console.log(words);
		const parts: TextPart[] = [];

		//分割された各ワードについて振り分け分けする
		let index = 0;

		for (let word of words) {
			if (word !== undefined) {
				try {
					//console.log(word);
					if (word.match(nostrRegex2)) {
						const index = word.indexOf('nostr:');
						const textContent = word.slice(0, index);
						const nostrContent = word.slice(index);

						parts.push({
							content: textContent,
							type: TextPartType.Text
						});

						parts.push({
							content: nostrContent,
							type: TextPartType.Nostr,
							url: nostrContent.slice(6)
						});
					} else if (emoji.length > 0 && word.match(emojiRegex)) {
						const url = emoji.find((item) => `:${item[1]}:` === word)?.[2];
						if (url) {
							parts.push({
								content: word,
								type: TextPartType.Emoji,
								url: url
							});
						} else {
							parts.push({
								content: word,
								type: TextPartType.Text
							});
						}
					} else if (isValidUrl(word)) {
						if (word.match(urlRegex)) {
							if (word.match(imageRegex)) {
								parts.push({
									content: word,
									type: TextPartType.Image
								});
							} else {
								parts.push({
									content: word,
									type: TextPartType.URL
								});
							}
						} else {
							parts.push({
								content: word,
								type: TextPartType.URL
							});
						}
						//}
						//  else if (word.match(linesRegex)) {
						//   parts.push({
						//     content: 'Newline',
						//     type: TextPartType.Newline,
						//   });
					} else if (word.match(numberRegex)) {
						if (parseInt(word.slice(2, -1)) < tags.length) {
							parts.push({
								content: word,
								type: TextPartType.Quote,

								number: parseInt(word.slice(2, -1))
							});
						} else {
							parts.push({
								content: word,
								type: TextPartType.Text
							});
						}
					} else if (hashTag.length > 0 && word.match(hashtagRegex)) {
						//console.log(word);
						const tag = hashTag.find((item) =>
							new RegExp(`${item[1]}`, 'i').test(word)
						);
						// const tag = hashTag.find((item) => new RegExp(`#${item[1]}`, 'i').test(word));
						if (tag) {
							parts.push({
								content: word,
								type: TextPartType.Hashtag
							});
						} else {
							parts.push({
								content: word,
								type: TextPartType.Text
							});
						}

						// console.log(tag);
						// if (tag) {

						//   parts.push({
						//     content: word.slice(0, `#${tag}`.length + 1),
						//     type: TextPartType.Hashtag,
						//   });
						//   if (word.length > tag.length) {
						//     parts.push({
						//       content: word.slice(`#${tag}`.length + 1, word.length),
						//       type: TextPartType.Text,
						//     });
						//   }

						// } else {
						//     parts.push({
						//       content: word,
						//       type: TextPartType.Text,
						//     });

						// }
					} else {
						parts.push({
							content: word,
							type: TextPartType.Text
						});
					}
				} catch (error) {
					console.log('Error processing word:', word, error);
				}
				index++;
			}
		}

		//console.log(parts);

		return parts;
	} catch (error) {
		console.log('Error in extractTextParts:', text, error);
		return [{ content: text, type: TextPartType.Text }];
	}
}

function isValidUrl(string: string) {
	const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
	try {
		new URL(string);
		return urlRegex.test(string);
	} catch (err) {
		return false;
	}
}
