import { getVerbrauchProStunde } from '$lib/server/influx';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		verbrauch: await getVerbrauchProStunde()
	};
};