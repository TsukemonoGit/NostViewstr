import { SEND_PUBHEX } from '$env/static/private';
//import { send_pubhex } from '$lib/stores/settings';

export function load(): import('./$types').LayoutServerLoad {
	//send_pubhex.set(SEND_PUBHEX);
	return { send_pubhex: SEND_PUBHEX };
}
