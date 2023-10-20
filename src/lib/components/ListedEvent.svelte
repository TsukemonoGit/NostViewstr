<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { MenuMode } from '$lib/functions';

	const test = {
		kind: 1,
		content:
			'てすとのもじたち nostr:note1ggwlje0d0lfu92gvvqswacna9uq8zz620n3ls7nk35z5rv34fyusrt73pt',
		tags: [
			['e', 'e6bc5926d88b02a0cb9d884df0527f8042e0483db2d5e05e594391bdd9738fbc', '', 'reply'],
			['e', 'acc06bd082f0c62ceb345d381ac60b68b0969ac3ab93a48df5d0f20a12017a7b', '', 'root'],
			['e', '421df965ed7fd3c2a90c6020eee27d2f00710b4a7ce3f87a768d0541b2354939', '', 'mention'],
			['p', '5650178597525e90ea16a4d7a9e33700ac238a1be9dbf3f5093862929d9a1e60']
		],
		created_at: 1697707178,
		pubkey: '5650178597525e90ea16a4d7a9e33700ac238a1be9dbf3f5093862929d9a1e60',
		id: 'e9a74219fbe7a15f1bfc7443bdeb5aadcb807f8312eed3d3736f88b53ee0a2f4',
		sig: 'cb490cde0dcad222a44baceb3fce6fc19a9120985f69721a44571bda89c4922f62b5b76ae3a44d81f4c1e271a97ddb6dd1e54b22772253e4ac10752d37d36919'
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

	function DeleteNote(e: CustomEvent<any>): void {
		console.log('DeleteNote');
		console.log(e.detail.number);
	}

	function MoveNote(e: CustomEvent<any>): void {
		console.log('MoveNote');
		console.log(e.detail.number);
	}

	function CheckNote(e: CustomEvent<any>): void {
		console.log('CheckNote');
		console.log(e.detail.number);
	}
</script>

<EventCard
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
		'30001:84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5:bookamrk'
	]}
	note={test}
	{metadata}
	myIndex={2}
	on:DeleteNote={DeleteNote}
	on:MoveNote={MoveNote}
	on:CheckNote={CheckNote}
	menuMode={MenuMode.Viewer}
/>
