import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return /^npub1[a-z0-9]{6,}$/i.test(param);
}) satisfies ParamMatcher;
