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
	30002: 'relay sets'
};

export let kindsValidTag: { [key: number]: string[] } = {
	3: ['p'],
	10003: ['e', 'a', 't', 'r'],
	30003: ['e', 'a', 't', 'r'],
	10006: ['relay'],
	10004: ['a'],
	30004: ['a', 'e'],
	10030: ['emoji', 'a'],
	30030: ['emoji'],
	10015: ['t', 'a'],
	30015: ['t'],
	30001: [],
	10000: ['p', 't', 'word', 'e'],
	30000: ['p'],
	10001: ['e'],
	30008: ['a', 'e'],
	10005: ['e'],
	10002: ['r'],
	10007: ['relay'],
	30002: ['relay']
};

export let tagExp: Record<string, string> = {
	t: 'hashtag',
	r: 'reference (URL, etc)',
	word: 'word'
};
