<script lang="ts">
	import * as Chart from '$lib/components/ui/chart';
	import { BarChart } from 'layerchart';
	import { scaleBand } from 'd3-scale';

	let { data } = $props();

	const chartConfig = {
		value: { label: 'Verbrauch', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	const verbrauchData = $derived(
		(data.verbrauch ?? []).map((d) => ({
			time: new Date(d.time).toLocaleTimeString('de-DE', { hour: '2-digit' }),
			value: d.value
		}))
	);

	const chartData = $derived(
		(data.leistung ?? []).map((d) => ({
			time: new Date(d.time),
			value: d.value
		}))
	);

	const datumLabel = $derived(
		chartData.length > 0
			? chartData[0].time.toLocaleDateString('de-DE', {
					weekday: 'long',
					day: '2-digit',
					month: 'long',
					year: 'numeric'
				})
			: new Date().toLocaleDateString('de-DE', {
					weekday: 'long',
					day: '2-digit',
					month: 'long',
					year: 'numeric'
				})
	);
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden bg-background p-[5%]">
	<div class="mb-4 shrink-0">
		<h1 class="text-2xl font-semibold text-foreground">Stromzähler – Verbrauch je Stunde</h1>
		<p class="text-sm text-muted-foreground">{datumLabel}</p>
	</div>

	<Chart.Container config={chartConfig} class="!aspect-auto min-h-0 w-full flex-1">
		<BarChart
			data={verbrauchData}
			x="time"
			xScale={scaleBand().padding(0.2)}
			axis={true}
			series={[{ key: 'value', label: chartConfig.value.label, color: 'var(--chart-1)' }]}
			props={{
				yAxis: { format: (v: number) => `${v.toFixed(1)} kWh` }
			}}
		>
			{#snippet tooltip()}
				<Chart.Tooltip />
			{/snippet}
		</BarChart>
	</Chart.Container>

	<p class="mt-4 shrink-0 text-sm text-muted-foreground">
		Jeder Balken zeigt die tatsächlich verbrauchte Energiemenge (kWh) innerhalb der jeweiligen
		Stunde.
	</p>
</div>