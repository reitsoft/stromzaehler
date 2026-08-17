import { InfluxDB } from '@influxdata/influxdb-client';
import { env } from '$env/dynamic/private';

const client = new InfluxDB({ url: env.INFLUX_URL, token: env.INFLUX_TOKEN });
const queryApi = client.getQueryApi(env.INFLUX_ORG);

type DatenPunkt = { time: string; value: number | null };

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

    const rawRows: Record<number, number> = {};

    for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
        const o = tableMeta.toObject(values);
        // Da Influx mit location: "Europe/Berlin" aggregiert, 
        // entspricht getHours() der lokalen Stunde (0-23)
        const hour = new Date(o._time).getHours();
        rawRows[hour] = o._value;
    }

    return fill24Hours(rawRows);
}

function getMockVerbrauchProStunde(): DatenPunkt[] {
    const aktuelleStunde = new Date().getHours();
    const rawRows: Record<number, number> = {};

    for (let i = 0; i <= aktuelleStunde; i++) {
        const base = i >= 6 && i <= 22 ? 0.6 : 0.15;
        const peak = [7, 12, 19].includes(i) ? 1.2 : 0;
        const noise = Math.random() * 0.3;
        rawRows[i] = Number((base + peak + noise).toFixed(2));
    }

    return fill24Hours(rawRows);
}

function fill24Hours(dataMap: Record<number, number>): DatenPunkt[] {
    const heute = new Date();
    
    return Array.from({ length: 24 }, (_, hour) => ({
        time: new Date(heute.setHours(hour, 0, 0, 0)).toISOString(),
        value: dataMap[hour] ?? null // 0 statt null verhindert den Tooltip-Crash
    }));
}