import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	if (/^note/i.test(param)) {
		return /^note\w{59}$/.test(param);
	} else {
		return /^(note|nevent)1[a-z0-9]{6,}$/i.test(param);
	}
}) satisfies ParamMatcher;
