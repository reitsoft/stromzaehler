import { getLeistungsverlauf, getVerbrauchProStunde } from '$lib/server/influx';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		leistung: await getLeistungsverlauf(24),
		verbrauch: await getVerbrauchProStunde()
	};
};