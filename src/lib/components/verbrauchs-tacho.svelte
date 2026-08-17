<script lang="ts">
    // Feste Demo-Werte
    const aktuelleLeistungKw = 0.65;
    const maxLeistungKw = 3;
    const zaehlerstand = '12.345,6 kWh';
    const verbrauchHeute = '8,7 kWh';
    const prognose = '14,5 kWh';
    const kostenHeute = '€ 2,61';

    const radius = 80;
    const strokeWidth = 20;
    const circumference = 2 * Math.PI * radius;

    // Gauge als 270°-Bogen (unten offen), Start bei 135°
    const arcFraction = 270 / 360;
    const arcLength = circumference * arcFraction;

    const percentage = Math.min(aktuelleLeistungKw / maxLeistungKw, 1);
    const valueDashoffset = arcLength - percentage * arcLength;

    import * as Card from '$lib/components/ui/card';
</script>

<Card.Root
    class="flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm"
>
    <Card.Header class="pb-2 shrink-0">
        <Card.Title>Momentan- & Gesamtübersicht</Card.Title>
        <Card.Description>Verbrauchs-Tacho</Card.Description>
    </Card.Header>

    <Card.Content class="flex min-h-0 flex-1 flex-col items-center justify-between p-4 sm:p-6 gap-4">
        <!-- Tacho-Container: Passt sich der verfügbaren Höhe/Breite an -->
        <div class="relative flex min-h-0 flex-1 w-full max-w-[360px] aspect-square items-center justify-center my-auto">
            <svg viewBox="0 0 200 200" class="h-full w-full">
                <!-- Rotierter Bogen im SVG -->
                <g transform="rotate(-225 100 100)">
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="var(--border)"
                        stroke-width={strokeWidth}
                        stroke-linecap="round"
                        stroke-dasharray="{arcLength} {circumference}"
                    />
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="var(--chart-1)"
                        stroke-width={strokeWidth}
                        stroke-linecap="round"
                        stroke-dasharray="{arcLength} {circumference}"
                        stroke-dashoffset={valueDashoffset}
                    />
                </g>

                <!-- SVG-Texte skalierten absolut synchron zum ViewBox-System mit -->
                <text
                    x="100"
                    y="88"
                    text-anchor="middle"
                    class="fill-muted-foreground text-[10px] font-medium"
                >
                    Aktuelle Leistung
                </text>

                <text
                    x="100"
                    y="118"
                    text-anchor="middle"
                    class="fill-foreground text-[22px] font-bold tracking-tight"
                >
                    {aktuelleLeistungKw.toFixed(2)} kW
                </text>
            </svg>
        </div>

        <!-- KPI-Raster unten -->
        <div class="w-full shrink-0 grid grid-cols-2 gap-3 sm:gap-4 border-t border-border/40 pt-4 text-center">
            <div>
                <div class="text-xs text-muted-foreground">Zählerstand</div>
                <div class="text-base sm:text-lg font-semibold text-foreground">{zaehlerstand}</div>
            </div>
            <div>
                <div class="text-xs text-muted-foreground">Verbrauch heute</div>
                <div class="text-base sm:text-lg font-semibold text-foreground">{verbrauchHeute}</div>
            </div>
            <div>
                <div class="text-xs text-muted-foreground">Prognose</div>
                <div class="text-base sm:text-lg font-semibold text-foreground">{prognose}</div>
            </div>
            <div>
                <div class="text-xs text-muted-foreground">Kosten heute</div>
                <div class="text-base sm:text-lg font-semibold text-foreground">{kostenHeute}</div>
            </div>
        </div>
    </Card.Content>
</Card.Root>