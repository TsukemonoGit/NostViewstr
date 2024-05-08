//app.d.ts

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
	interface Navigator {
		connection?: NetworkInformation;
	}
}
//https://zenn.dev/qnighy/articles/9a6a0041f2a1aa
declare var nostr: Nip07.Nostr;
