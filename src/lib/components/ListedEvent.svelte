<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { MenuMode } from '$lib/functions';
	import { searchRelays } from '$lib/stores/relays';
	import { Metadata, NostrApp, Text } from 'nosvelte';
	import OtherCard from '$lib/components/OtherCard.svelte';
	import { nip19, type Event as NostrEvent } from 'nostr-tools';
	import { getIdByTag } from '$lib/nostrFunctions';
	import SearchCard from './SearchCard.svelte';
	export let DeleteNote: (e: CustomEvent<any>) => void;
	export let MoveNote: (e: CustomEvent<any>) => void;
	export let CheckNote: (e: CustomEvent<any>) => void;

	const test = {
		content:
			'testuo nostr:note1ggwlje0d0lfu92gvvqswacna9uq8zz620n3ls7nk35z5rv34fyusrt73pt',
		created_at: 1697707178,
		id: 'e9a74219fbe7a15f1bfc7443bdeb5aadcb807f8312eed3d3736f88b53ee0a2f4',
		kind: 1,
		pubkey: '5650178597525e90ea16a4d7a9e33700ac238a1be9dbf3f5093862929d9a1e60',
		sig: 'cb490cde0dcad222a44baceb3fce6fc19a9120985f69721a44571bda89c4922f62b5b76ae3a44d81f4c1e271a97ddb6dd1e54b22772253e4ac10752d37d36919',
		tags: [
			[
				'e',
				'e6bc5926d88b02a0cb9d884df0527f8042e0483db2d5e05e594391bdd9738fbc',
				'',
				'reply'
			],
			[
				'e',
				'acc06bd082f0c62ceb345d381ac60b68b0969ac3ab93a48df5d0f20a12017a7b',
				'',
				'root'
			],
			[
				'e',
				'421df965ed7fd3c2a90c6020eee27d2f00710b4a7ce3f87a768d0541b2354939',
				'',
				'mention'
			],
			['p', '5650178597525e90ea16a4d7a9e33700ac238a1be9dbf3f5093862929d9a1e60']
		]
	};

	const metadata = {
		content:
			'{"picture":"https://image.nostr.build/5c56e25d60c50fdc4ffa85ecdbe55fe2c52130c298e9c50cdbe3853f002fbb70.jpg","banner":"https://nostr.build/i/c3b7bd020181bf53c66bed4a122b788cc0990e9357ebb6303becc9025e5ba738.jpg","display_name":"もの₍ ･ᴗ･ ₎mono","name":"もの₍ ･ᴗ･ ₎mono","about":"アイコンは崇徳さん作\\n(ひとりごと)\\n2023/02/04(土)17時位 に はじめました \\n【ぶくまびうあ】\\nhttps://nostr-bookmark-viewer3.vercel.app/\\n【ノートを単品で複製したいときのやつ】\\nhttps://dupstr.vercel.app/\\n【もの画像】\\nhttps://tsukemonogit.github.io/nostr-monoGazo-bot/\\n\\n【初めてクエストを達成した者】https://nostx.shino3.net/note18kn29rrwehlp9dgpqlrem3ysk5tt6ucl2h2tj4e4uh53facc6g2qxwa77h","nip05":"mono@tsukemonogit.github.io","lud16":"thatthumb37@walletofsatoshi.com","displayName":"","nip05valid":true}',
		created_at: 1697628186,
		id: '10f873640423965d99bde6ddb8098543fc34f8befb4dd37cec33860e3e8d1495',
		kind: 0,
		pubkey: '84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5',
		sig: '9f414555a4ddc308d4cc968a44bc471501943a1619ec217913d1109e72bcd644f026b52a12dae364ddf0f0e81561256e77dd131954b6b289648499f04fdab55e',
		tags: []
	};

	const test2 = {
		content:
			'やぶみちゃん観測がんばってるえらい\nhttps://i.nostr.build/yJLm.png',
		created_at: 1697806174,
		id: 'd91f6df10af6b1df6f39dc3f624eb5114707c9996b36f42377992661e2701705',
		kind: 1,
		pubkey: 'cd408a69cc6c737ca1a76efc3fa247c6ca53ec807f6e7c9574164164797e8162',
		sig: '170f1dcab84c265aa19a836e6090e7869a6961f73c329c958e96b8a60a9b2f11f69c3f01b870a515c312a9947a89d81a654ad3a880eaf962ae7680d5741f4f13',
		tags: []
	};

	export let listEvent: NostrEvent;
</script>

{#if $searchRelays}
	<NostrApp relays={$searchRelays}>
		{#each listEvent.tags as tag, index}
			{#await getIdByTag(tag)}
				<!--loading a タグ　のなかみ-->
			{:then { id, filter, kind }}
				{#if id === ''}
					<!--tagをそのままだす-->
					<SearchCard
						{filter}
						message={`failed to get event ${tag}`}
						isPageOwner={true}
						menuMode={MenuMode.other}
						tagArray={tag}
						myIndex={index}
						on:DeleteNote={DeleteNote}
						on:MoveNote={MoveNote}
						on:CheckNote={CheckNote}
					/>
				{:else if tag[0] === 'e' || tag[0] === 'a'}
					<Text queryKey={[id]} {id} let:text>
						<SearchCard
							slot="loading"
							{filter}
							message={`loading ${tag}`}
							isPageOwner={true}
							menuMode={MenuMode.other}
							tagArray={tag}
							myIndex={index}
							on:DeleteNote={DeleteNote}
							on:MoveNote={MoveNote}
							on:CheckNote={CheckNote}
						/>

						<SearchCard
							slot="error"
							{filter}
							message={`error ${tag}`}
							isPageOwner={true}
							menuMode={MenuMode.other}
							tagArray={tag}
							myIndex={index}
							on:DeleteNote={DeleteNote}
							on:MoveNote={MoveNote}
							on:CheckNote={CheckNote}
						/>

						<SearchCard
							slot="nodata"
							{filter}
							message={`not found ${tag}`}
							isPageOwner={true}
							menuMode={MenuMode.other}
							tagArray={tag}
							myIndex={index}
							on:DeleteNote={DeleteNote}
							on:MoveNote={MoveNote}
							on:CheckNote={CheckNote}
						/>

						<Metadata
							queryKey={['metadata', text.pubkey]}
							pubkey={text.pubkey}
							let:metadata
						>
							<EventCard
								slot="loading"
								isPageOwner={true}
								menuMode={MenuMode.Owner}
								tagArray={tag}
								note={text}
								metadata={undefined}
								myIndex={index}
								on:DeleteNote={DeleteNote}
								on:MoveNote={MoveNote}
								on:CheckNote={CheckNote}
							/>
							<EventCard
								slot="error"
								isPageOwner={true}
								menuMode={MenuMode.Owner}
								tagArray={tag}
								note={text}
								metadata={undefined}
								myIndex={index}
								on:DeleteNote={DeleteNote}
								on:MoveNote={MoveNote}
								on:CheckNote={CheckNote}
							/>
							<EventCard
								slot="nodata"
								isPageOwner={true}
								menuMode={MenuMode.Owner}
								tagArray={tag}
								note={text}
								metadata={undefined}
								myIndex={index}
								on:DeleteNote={DeleteNote}
								on:MoveNote={MoveNote}
								on:CheckNote={CheckNote}
							/>

							<EventCard
								isPageOwner={true}
								menuMode={MenuMode.Owner}
								tagArray={tag}
								note={text}
								{metadata}
								myIndex={index}
								on:DeleteNote={DeleteNote}
								on:MoveNote={MoveNote}
								on:CheckNote={CheckNote}
							/>
						</Metadata>
					</Text>
				{:else}
					<!--あとでかく-->
					{tag}
				{/if}
			{/await}
		{/each}

		<!-- <EventCard
			tagArray={['e', test.id]}
			note={test}
			metadata={undefined}
			myIndex={0}
			on:DeleteNote={DeleteNote}
			on:MoveNote={MoveNote}
			on:CheckNote={CheckNote}
			menuMode={MenuMode.Multi}
		/>
		<EventCard
			tagArray={['e', test.id]}
			note={test}
			{metadata}
			myIndex={1}
			on:DeleteNote={DeleteNote}
			on:MoveNote={MoveNote}
			on:CheckNote={CheckNote}
			menuMode={MenuMode.Owner}
		/>
		<EventCard
			tagArray={[
				'a',
				'30001:84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5:bookmark'
			]}
			note={test}
			{metadata}
			myIndex={2}
			on:DeleteNote={DeleteNote}
			on:MoveNote={MoveNote}
			on:CheckNote={CheckNote}
			menuMode={MenuMode.Viewer}
		/>
		<EventCard
			tagArray={['e', test2.id]}
			note={test2}
			metadata={undefined}
			myIndex={3}
			on:DeleteNote={DeleteNote}
			on:MoveNote={MoveNote}
			on:CheckNote={CheckNote}
			menuMode={MenuMode.Viewer}
		/> -->
	</NostrApp>
{/if}
