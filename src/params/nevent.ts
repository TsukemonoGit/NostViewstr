import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return /^nevent[a-z0-9]{6,}$/i.test(param);
}) satisfies ParamMatcher;
