import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
    standalone: true,
    selector: 'app-chart-card',
    imports: [CommonModule, NgChartsModule],
    templateUrl: './chart-card.component.html',
    styleUrls: ['./chart-card.component.scss']
})
export class ChartCardComponent {
    @Input() data!: number[];
    @Input() labels!: string[];
    @Input() title = '';
    // Configuración de ejemplo para un pie chart
    public chartOptions = { responsive: true };
    public chartData: any;
    ngOnChanges(): void {
        this.chartData = {
            labels: this.labels,
            datasets: [{ data: this.data, label: this.title }]
        };
    }
}
