# nostr-bookmark-viewer5

https://nostr-bookmark-viewer5.vercel.app/

第五弾 SvelteKit と Skeleton と Tailwindcss と Nostr と Nosvelte と rx-nostr とその他諸々の勉強

いまのとこリストの削除はリストの e タグ指定での kind5 送信による削除
（空配列での同 kind への更新にする？）

## Tool for Displaying and Editing

The tool, based on NIP-51, provides functionality for displaying and editing categorized bookmarks. Additionally, it allows users to view information related to other categories such as 'bookmark sets,' 'blocked relays,' 'communities,' 'curation sets,' 'emojis,' 'emoji sets,' 'interests,' 'interest sets,' 'lists,' 'mute,' 'people sets,' 'pin,' 'profile badges,' 'public chats,' 'relay sets,' and 'search relays.'

For more details, refer to the [NIP-51 documentation](https://github.com/nostr-protocol/nips/blob/master/51.md).

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

##

- [nostr logo] (https://github.com/mbarulli/nostr-logo)

- [nostr-zap] (https://github.com/SamSamskies/nostr-zap)

- [nosey(ハッシュタグのリンク先に使用)] (https://github.com/akiomik/nosey]

- [nostr band(プロフィール,ノートのリンク先に使用)] (https://nostr.band/
  )
