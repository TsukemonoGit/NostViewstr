export const kinds: { [name: number]: string } = {
	3: 'contact list',
	10003: 'bookmark',
	30003: 'bookmark sets',
	10006: 'blocked relays',
	10004: 'communities',
	30004: 'curation sets',
	10030: 'emojis',
	30030: 'emoji sets',
	10015: 'interests',
	30015: 'interest sets',
	30001: 'lists',
	10000: 'mute',
	30000: 'people sets',
	10001: 'pin',
	30008: 'profile badges',
	10005: 'public chats',
	10002: 'relays',
	10007: 'search relays',
	30002: 'relay sets',
	10101: 'good wiki authors',
	10102: 'good wiki relays'
};

export let kindsValidTag: { [key: number]: string[] } = {
	3: ['p'],
	10003: ['e', 'a', 't', 'r'], //a-30023 etc
	30003: ['e', 'a', 't', 'r'], //a-30023 etc
	10006: ['relay'],
	10004: ['a'], //a-34550 (kind:34550 community definitions)
	30004: ['a', 'e'], //"a" (kind:30023 articles), "e" (kind:1 notes)
	10030: ['emoji', 'a'], //a-30030(kind:30030 emoji set)
	30030: ['emoji'],
	10015: ['t', 'a'], //a-30015(kind:30015 interest set)
	30015: ['t'],
	30001: [],
	10000: ['p', 't', 'word', 'e'],
	30000: ['p'],
	10001: ['e'],
	30008: ['a', 'e'], //a-30009 e-kind8
	10005: ['e'], //kind40 (kind:40 channel definitions)
	10002: ['r'],
	10007: ['relay'],
	30002: ['relay'],
	10101: ['p'],
	10102: ['relay']
};

// 重複を排除して新しい配列を作成する
export const uniqueArray = () => {
	// すべての配列を取り出し、結合する
	const combinedArray = Object.values(kindsValidTag).reduce(
		(acc, val) => acc.concat(val),
		[]
	);
	return [...new Set(combinedArray)];
};

export let naddrVaridKind: { [key: number]: number[] } = {
	10004: [34550],
	10030: [30030],
	10015: [30015],
	30008: [30009]
};

export let tagExp: Record<string, string> = {
	t: 'hashtag',
	r: 'reference (URL, etc)',
	word: 'word'
};
