import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { TransactionService } from '../../services/transaction.service';
import { EventService } from '../../services/event.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-visualization',
  templateUrl: './data-visualization.component.html',
  styleUrls: ['./data-visualization.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DataVisualizationComponent implements OnInit, AfterViewInit {
  private filterWorker: Worker | undefined;
  private aggregateWorker: Worker | undefined;

  transactions: any[] = [];
  filteredTransactions: any[] = [];
  aggregates: any = {};

  @ViewChild('chart') private chartContainer!: ElementRef;

  constructor(
    private transactionService: TransactionService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.initializeWorkers();

    this.transactionService.getRealTimeTransactions().subscribe((transaction) => {
      this.transactions.push(transaction);
      if (this.transactions.length > 1000) this.transactions.shift();
      this.processData();
    });

    this.eventService.on('dataProcessed').subscribe((result) => {
      if (result.type === 'filtered') {
        this.filteredTransactions = result.data;
      } else if (result.type === 'aggregates') {
        this.aggregates = result.data;
        this.updateChart();
      }
    });
  }

  ngAfterViewInit() {
    this.createChart();
  }

  private initializeWorkers() {
    if (typeof Worker !== 'undefined') {
      this.filterWorker = new Worker(new URL('../../workers/filter-worker.worker', import.meta.url));
      this.aggregateWorker = new Worker(new URL('../../workers/aggregate-worker.worker', import.meta.url));
    }
  }

  private processData() {
    if (this.filterWorker && this.aggregateWorker) {
      this.filterWorker.postMessage({ transactions: this.transactions });
      this.filterWorker.onmessage = ({ data }) => {
        this.eventService.emit({ type: 'dataProcessed', payload: { type: 'filtered', data } });
      };

      this.aggregateWorker.postMessage({ transactions: this.transactions });
      this.aggregateWorker.onmessage = ({ data }) => {
        this.eventService.emit({ type: 'dataProcessed', payload: { type: 'aggregates', data } });
      };
    }
  }

  private createChart() {
    const element = this.chartContainer.nativeElement;
    const svg = d3.select(element)
      .append('svg')
      .attr('width', 800)
      .attr('height', 400);

    svg.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(50, 30)');
  }

  private updateChart() {
    const element = this.chartContainer.nativeElement;
    const svg = d3.select(element).select('svg');
    const chartGroup = svg.select('.chart');

    const width = 700;
    const height = 300;

    const x = d3.scaleBand()
      .domain(Object.keys(this.aggregates))
      .range([0, width])
      .padding(0.2);

      const y = d3.scaleLinear()
      .domain([
        0,
        d3.max(Object.values(this.aggregates).map(value => Number(value))) || 0
      ])
      .range([height, 0]);
    

    chartGroup.selectAll('.bar').remove();
    chartGroup.selectAll('.axis').remove();

    chartGroup.selectAll('.bar')
      .data(Object.entries(this.aggregates))
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', ([region]) => x(region) || 0)
      .attr('y', ([, value]) => y(value as number))
      .attr('width', x.bandwidth())
      .attr('height', ([, value]) => height - y(value as number))
      .attr('fill', 'steelblue');

    chartGroup.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    chartGroup.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(y));
  }
}
