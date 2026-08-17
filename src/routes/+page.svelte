<script lang="ts">
    import * as Chart from '$lib/components/ui/chart';
    import * as Card from '$lib/components/ui/card';
    import { BarChart } from 'layerchart';
    import { scaleBand } from 'd3-scale';
    import VerbrauchsTacho from '$lib/components/verbrauchs-tacho.svelte';

    let { data } = $props();

    const chartConfig = {
        value: { label: 'Verbrauch', color: 'var(--chart-1)' }
    } satisfies Chart.ChartConfig;

    // Nutzen direkt den Index (0–23) als Achsen-Schlüssel
    const verbrauchData = $derived(
        (data.verbrauch ?? []).map((d, index) => ({
            time: index.toString(),
            value: typeof d.value === 'number' ? d.value : 0
        }))
    );

    const datumLabel = $derived(
        data.verbrauch && data.verbrauch.length > 0
            ? new Date(data.verbrauch[0].time).toLocaleDateString('de-DE', {
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

<div class="flex h-screen w-screen flex-col overflow-hidden bg-background p-6">
    <header class="mb-4 shrink-0">
        <h1 class="text-2xl font-semibold text-foreground">Stromzähler – Verbrauchsanzeige</h1>
        <p class="text-sm text-muted-foreground">{datumLabel}</p>
    </header>

    <main class="flex min-h-0 flex-1 flex-row items-stretch gap-6">
        <section class="flex min-w-0 flex-8 flex-col h-full">
            <Card.Root class="flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
                <Card.Header class="pb-2">
                    <Card.Title>Stündlicher Verbrauch</Card.Title>
                    <Card.Description>Übersicht der Energie-Arbeit in Kilowattstunden</Card.Description>
                </Card.Header>

                <Card.Content class="flex-1 min-h-0 p-4">
                    <Chart.Container config={chartConfig} class="aspect-auto! h-full w-full">
                        <BarChart
                            data={verbrauchData}
                            x="time"
                            xScale={scaleBand().padding(0.2)}
                            axis={true}
                            padding={{ left: 55, bottom: 30, right: 10, top: 10 }}
                            series={[{ key: 'value', label: chartConfig.value.label, color: 'var(--chart-1)' }]}
                            props={{
                                xAxis: { 
                                    format: (v: string) => v // Zeigt strikt 0, 1, 2 ... 23 an
                                },
                                yAxis: { 
                                    format: (v: number) => `${(v ?? 0).toFixed(1)} kWh`
                                }
                            }}
                        >
                            {#snippet tooltip()}
                                <Chart.Tooltip />
                            {/snippet}
                        </BarChart>
                    </Chart.Container>
                </Card.Content>

                <Card.Footer class="pt-2 text-xs text-muted-foreground border-t border-border/20">
                    Jeder Balken zeigt die tatsächlich verbrauchte Energiemenge (kWh) innerhalb der jeweiligen Stunde (0–23 Uhr).
                </Card.Footer>
            </Card.Root>
        </section>

        <aside class="flex min-w-380px flex-3 flex-col h-full">
            <VerbrauchsTacho />
        </aside>
    </main>
</div>