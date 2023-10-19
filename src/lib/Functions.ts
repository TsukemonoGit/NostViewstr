import type { AddressPointer } from "nostr-tools/lib/types/nip19";

export function parseNaddr(tag: string[]): AddressPointer {
    const parts = tag[1].split(':');
    return tag.length >= 2
      ? {
          kind: Number(parts[0]),
          pubkey: parts.length > 1 ? parts[1] : '',
          identifier: parts.length > 2 ? parts[2] : '',
          relays: [tag[2]],
        }
      : {
          kind: Number(parts[0]),
          pubkey: parts.length > 1 ? parts[1] : '',
          identifier: parts.length > 2 ? parts[2] : '',
        };
  }
  

  export function windowOpen(str:string):void{
    window.open(
      // //nostr.bandはaタグでの検索ができない
      // `https://nostr.band/?q=${
      //   tagArray[0] === 'a'
      //     ? nip19.naddrEncode(parseNaddr(tagArray))
      //     : nip19.noteEncode(tagArray[1])
      // }`,
      `https://nostr.band/?q=${str}`,
      '_blank'
    );
  }