import { InfluxDB } from '@influxdata/influxdb-client';
import { env } from '$env/dynamic/private';

const client = new InfluxDB({ url: env.INFLUX_URL, token: env.INFLUX_TOKEN });
const queryApi = client.getQueryApi(env.INFLUX_ORG);

type DatenPunkt = { time: string; value: number };

export async function getLeistungsverlauf(hours = 24): Promise<DatenPunkt[]> {
	if (env.USE_MOCK_DATA === 'true') {
		return getMockLeistungsverlauf(hours);
	}

	const flux = `
		from(bucket: "${env.INFLUX_BUCKET}")
			|> range(start: -${hours}h)
			|> filter(fn: (r) => r._measurement == "stromzaehler")
			|> derivative(unit: 1h, nonNegative: true)
	`;

	const rows: DatenPunkt[] = [];
	for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
		const o = tableMeta.toObject(values);
		rows.push({ time: o._time, value: o._value });
	}
	return rows;
}

export async function getVerbrauchProStunde(): Promise<DatenPunkt[]> {
	if (env.USE_MOCK_DATA === 'true') {
		return getMockVerbrauchProStunde();
	}

	const flux = `
		import "date"

		from(bucket: "${env.INFLUX_BUCKET}")
			|> range(start: date.truncate(t: now(), unit: 1d))
			|> filter(fn: (r) => r._measurement == "stromzaehler")
			|> difference(nonNegative: true)
			|> aggregateWindow(every: 1h, fn: sum, createEmpty: false, location: "Europe/Berlin")
	`;

	const rows: DatenPunkt[] = [];
	for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
		const o = tableMeta.toObject(values);
		rows.push({ time: o._time, value: o._value });
	}
	return rows;
}

function getMockLeistungsverlauf(hours: number): DatenPunkt[] {
	const now = Date.now();
	const points: DatenPunkt[] = [];

	for (let i = hours * 4; i >= 0; i--) {
		const time = new Date(now - i * 15 * 60 * 1000).toISOString();
		const hourOfDay = new Date(time).getHours();
		const base = hourOfDay >= 6 && hourOfDay <= 22 ? 0.8 : 0.2;
		const peak = [7, 12, 19].includes(hourOfDay) ? 1.5 : 0;
		const noise = Math.random() * 0.4;
		points.push({ time, value: Number((base + peak + noise).toFixed(2)) });
	}

	return points;
}

function getMockVerbrauchProStunde(): DatenPunkt[] {
	const now = new Date();
	const mitternacht = new Date(now);
	mitternacht.setHours(0, 0, 0, 0);

	// Nur so viele Stunden simulieren, wie seit Mitternacht bereits vergangen sind
	const vergangeneStunden = now.getHours() + 1;
	const points: DatenPunkt[] = [];

	for (let i = 0; i < vergangeneStunden; i++) {
		const time = new Date(mitternacht.getTime() + i * 60 * 60 * 1000).toISOString();
		const hourOfDay = i;
		const base = hourOfDay >= 6 && hourOfDay <= 22 ? 0.6 : 0.15;
		const peak = [7, 12, 19].includes(hourOfDay) ? 1.2 : 0;
		const noise = Math.random() * 0.3;
		points.push({ time, value: Number((base + peak + noise).toFixed(2)) });
	}

	return points;
}