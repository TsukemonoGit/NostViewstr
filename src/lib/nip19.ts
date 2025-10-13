import { bytesToHex, concatBytes, hexToBytes } from '@noble/hashes/utils';
import { bech32 } from '@scure/base';

export const utf8Decoder = new TextDecoder('utf-8');
export const utf8Encoder = new TextEncoder();
export const Bech32MaxSize = 5000;

export const BECH32_REGEX =
	/[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;

function integerToUint8Array(number: number): Uint8Array {
	const uint8Array = new Uint8Array(4);
	uint8Array[0] = (number >> 24) & 0xff;
	uint8Array[1] = (number >> 16) & 0xff;
	uint8Array[2] = (number >> 8) & 0xff;
	uint8Array[3] = number & 0xff;
	return uint8Array;
}

export type ProfilePointer = {
	pubkey: string;
	relays?: string[];
};

export type EventPointer = {
	id: string;
	relays?: string[];
	author?: string;
	kind?: number;
};

export type AddressPointer = {
	identifier: string;
	pubkey: string;
	kind: number;
	relays?: string[];
};

type Prefixes = {
	nprofile: ProfilePointer;
	nrelay: string;
	nevent: EventPointer;
	naddr: AddressPointer;
	nsec: Uint8Array;
	npub: string;
	note: string;
};

type DecodeValue<Prefix extends keyof Prefixes> = {
	type: Prefix;
	data: Prefixes[Prefix];
};

export type DecodeResult = {
	[P in keyof Prefixes]: DecodeValue<P>;
}[keyof Prefixes];

export function decode<Prefix extends keyof Prefixes>(
	nip19: `${Prefix}1${string}`
): DecodeValue<Prefix>;
export function decode(nip19: string): DecodeResult;
export function decode(nip19: string): DecodeResult {
	const { prefix, words } = bech32.decode(
		nip19 as `${string}1${string}`,
		Bech32MaxSize
	);
	const data = new Uint8Array(bech32.fromWords(words));

	switch (prefix) {
		case 'nprofile': {
			const tlv = parseTLV(data);
			if (!tlv[0]?.[0]) throw new Error('missing TLV 0 for nprofile');
			if (tlv[0][0].length !== 32) throw new Error('TLV 0 should be 32 bytes');

			return {
				type: 'nprofile',
				data: {
					pubkey: bytesToHex(tlv[0][0]),
					relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
				}
			};
		}
		case 'nevent': {
			const tlv = parseTLV(data);
			if (!tlv[0]?.[0]) throw new Error('missing TLV 0 for nevent');
			if (tlv[0][0].length !== 32) throw new Error('TLV 0 should be 32 bytes');
			if (tlv[2]?.[0] && tlv[2][0].length !== 32)
				throw new Error('TLV 2 should be 32 bytes');
			if (tlv[3]?.[0] && tlv[3][0].length !== 4)
				throw new Error('TLV 3 should be 4 bytes');

			return {
				type: 'nevent',
				data: {
					id: bytesToHex(tlv[0][0]),
					relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : [],
					author: tlv[2]?.[0] ? bytesToHex(tlv[2][0]) : undefined,
					kind: tlv[3]?.[0] ? parseInt(bytesToHex(tlv[3][0]), 16) : undefined
				}
			};
		}
		case 'naddr': {
			const tlv = parseTLV(data);
			if (!tlv[0]?.[0]) throw new Error('missing TLV 0 for naddr');
			if (!tlv[2]?.[0]) throw new Error('missing TLV 2 for naddr');
			if (tlv[2][0].length !== 32) throw new Error('TLV 2 should be 32 bytes');
			if (!tlv[3]?.[0]) throw new Error('missing TLV 3 for naddr');
			if (tlv[3][0].length !== 4) throw new Error('TLV 3 should be 4 bytes');

			return {
				type: 'naddr',
				data: {
					identifier: utf8Decoder.decode(tlv[0][0]),
					pubkey: bytesToHex(tlv[2][0]),
					kind: parseInt(bytesToHex(tlv[3][0]), 16),
					relays: tlv[1] ? tlv[1].map((d) => utf8Decoder.decode(d)) : []
				}
			};
		}
		case 'nrelay': {
			const tlv = parseTLV(data);
			if (!tlv[0]?.[0]) throw new Error('missing TLV 0 for nrelay');

			return {
				type: 'nrelay',
				data: utf8Decoder.decode(tlv[0][0])
			};
		}
		case 'nsec':
			return { type: prefix, data };
		case 'npub':
		case 'note':
			return { type: prefix, data: bytesToHex(data) };
		default:
			throw new Error(`unknown prefix ${prefix}`);
	}
}

type TLV = { [t: number]: Uint8Array[] };

function parseTLV(data: Uint8Array): TLV {
	const result: TLV = {};
	let rest = data;
	while (rest.length > 0) {
		const t = rest[0];
		const l = rest[1];
		const v = rest.slice(2, 2 + l);
		if (v.length < l) throw new Error(`not enough data to read on TLV ${t}`);
		rest = rest.slice(2 + l);
		result[t] = result[t] || [];
		result[t].push(v);
	}
	return result;
}

export function nsecEncode(key: Uint8Array): `nsec1${string}` {
	return encodeBytes('nsec', key);
}

export function npubEncode(hex: string): `npub1${string}` {
	return encodeBytes('npub', hexToBytes(hex));
}

export function noteEncode(hex: string): `note1${string}` {
	return encodeBytes('note', hexToBytes(hex));
}

function encodeBech32<Prefix extends string>(
	prefix: Prefix,
	data: Uint8Array
): `${Prefix}1${string}` {
	const words = bech32.toWords(data);
	return bech32.encode(prefix, words, Bech32MaxSize) as `${Prefix}1${string}`;
}

export function encodeBytes<Prefix extends string>(
	prefix: Prefix,
	bytes: Uint8Array
): `${Prefix}1${string}` {
	return encodeBech32(prefix, bytes);
}

export function nprofileEncode(profile: ProfilePointer): `nprofile1${string}` {
	const data = encodeTLV({
		0: [hexToBytes(profile.pubkey)],
		1: (profile.relays || []).map((url) => utf8Encoder.encode(url))
	});
	return encodeBech32('nprofile', data);
}

export function neventEncode(event: EventPointer): `nevent1${string}` {
	const kindArray =
		event.kind !== undefined ? integerToUint8Array(event.kind) : undefined;

	const data = encodeTLV({
		0: [hexToBytes(event.id)],
		1: (event.relays || []).map((url) => utf8Encoder.encode(url)),
		2: event.author ? [hexToBytes(event.author)] : [],
		3: kindArray ? [new Uint8Array(kindArray)] : []
	});

	return encodeBech32('nevent', data);
}

export function naddrEncode(addr: AddressPointer): `naddr1${string}` {
	const kindArray = new ArrayBuffer(4);
	new DataView(kindArray).setUint32(0, addr.kind, false);

	const data = encodeTLV({
		0: [utf8Encoder.encode(addr.identifier)],
		1: (addr.relays || []).map((url) => utf8Encoder.encode(url)),
		2: [hexToBytes(addr.pubkey)],
		3: [new Uint8Array(kindArray)]
	});

	return encodeBech32('naddr', data);
}

export function nrelayEncode(url: string): `nrelay1${string}` {
	const data = encodeTLV({ 0: [utf8Encoder.encode(url)] });
	return encodeBech32('nrelay', data);
}

function encodeTLV(tlv: TLV): Uint8Array {
	const entries: Uint8Array[] = [];

	Object.entries(tlv)
		.reverse()
		.forEach(([t, vs]) => {
			vs.forEach((v) => {
				const entry = new Uint8Array(v.length + 2);
				entry[0] = parseInt(t, 10);
				entry[1] = v.length;
				entry.set(v, 2);
				entries.push(entry);
			});
		});

	return concatBytes(...entries);
}
