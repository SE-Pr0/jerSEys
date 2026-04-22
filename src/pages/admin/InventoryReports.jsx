import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  FormField,
  PageHeader,
  PageShell,
} from '../../components/ui';
import './InventoryReports.css';

const HEALTH_RING_RADIUS = 44;
const HEALTH_RING_CIRCUMFERENCE = 2 * Math.PI * HEALTH_RING_RADIUS;

const periodOptions = [
  { value: '7d', label: 'Last 7 Days', shortLabel: '7D' },
  { value: '30d', label: 'Last 30 Days', shortLabel: '30D' },
  { value: '90d', label: 'Last 90 Days', shortLabel: '90D' },
];

const reportSnapshots = {
  '7d': {
    summary: [
      {
        label: 'Total Products',
        value: '486',
        trend: '+3 SKUs',
        comparison: 'new jerseys checked into stock this week',
        tone: 'royal',
        trendTone: 'positive',
      },
      {
        label: 'Units In Stock',
        value: '17.9K',
        trend: '+2.8%',
        comparison: 'vs the previous 7 days',
        tone: 'orange',
        trendTone: 'positive',
      },
      {
        label: 'Low Stock Items',
        value: '21',
        trend: '7 urgent',
        comparison: 'requires replenishment review',
        tone: 'crimson',
        trendTone: 'warning',
      },
      {
        label: 'Inventory Value',
        value: '$421K',
        trend: '+1.9%',
        comparison: 'based on landed inventory cost',
        tone: 'green',
        trendTone: 'positive',
      },
    ],
    chart: {
      headline: '17.9K units',
      subline: 'Available stock tracked across the last 7 days.',
      delta: '+2.8% compared with the previous week',
      meta: [
        { label: 'Sell-through', value: '23%' },
        { label: 'Fill rate', value: '96.2%' },
        { label: 'Inbound this week', value: '1.4K' },
      ],
      series: [
        { label: 'Mon', available: 15.4, threshold: 12.4 },
        { label: 'Tue', available: 15.9, threshold: 12.4 },
        { label: 'Wed', available: 16.3, threshold: 12.5 },
        { label: 'Thu', available: 16.8, threshold: 12.5 },
        { label: 'Fri', available: 17.1, threshold: 12.6 },
        { label: 'Sat', available: 17.5, threshold: 12.7 },
        { label: 'Sun', available: 17.9, threshold: 12.8 },
      ],
    },
    health: {
      score: 88,
      status: 'Stable',
      target: 'Target 92 inventory health score',
      note: 'Two football kit replenishments recovered coverage after a sharp weekend demand spike.',
      highlights: [
        { label: 'Coverage', value: '27 days' },
        { label: 'Backorders', value: '12' },
      ],
      breakdown: [
        { label: 'Healthy', count: 409, share: 84, tone: 'green' },
        { label: 'Low Stock', count: 57, share: 12, tone: 'orange' },
        { label: 'Critical', count: 14, share: 3, tone: 'crimson' },
        { label: 'Out of Stock', count: 6, share: 1, tone: 'royal' },
      ],
    },
    categories: [
      { name: 'Football Kits', amount: '8.4K units', share: 47, tone: 'royal' },
      { name: 'Basketball Jerseys', amount: '4.4K units', share: 25, tone: 'orange' },
      { name: 'Custom Orders', amount: '3.0K units', share: 17, tone: 'crimson' },
      { name: 'Training Wear', amount: '2.1K units', share: 11, tone: 'green' },
    ],
    insights: [
      {
        value: 'Football Kits',
        label: 'Most Stocked Category',
        note: 'Core football inventory still anchors nearly half of the units on hand.',
      },
      {
        value: 'Custom Arsenal Home',
        label: 'Fastest Moving SKU',
        note: 'Personalized kits are consuming blank stock faster than weekly forecast.',
      },
      {
        value: '18%',
        label: 'Reorder Rate',
        note: 'A focused restock wave this week kept replenishment requests under control.',
      },
    ],
    attention: [
      {
        product: 'Barcelona 24/25 Home Jersey',
        sku: 'FB-2418',
        category: 'Football Kits',
        currentStock: '12 units',
        reorderLevel: '24 units',
        status: 'Low Stock',
      },
      {
        product: 'Lakers City Edition Swingman',
        sku: 'BB-1934',
        category: 'Basketball Jerseys',
        currentStock: '6 units',
        reorderLevel: '18 units',
        status: 'Critical',
      },
      {
        product: 'Custom Arsenal Home Kit',
        sku: 'CS-8821',
        category: 'Custom Orders',
        currentStock: '4 units',
        reorderLevel: '10 units',
        status: 'Critical',
      },
      {
        product: 'PSG Training Top Navy',
        sku: 'TR-1140',
        category: 'Training Wear',
        currentStock: '0 units',
        reorderLevel: '16 units',
        status: 'Out of Stock',
      },
      {
        product: 'Retro Brazil 2002 Shirt',
        sku: 'FB-2172',
        category: 'Football Kits',
        currentStock: '9 units',
        reorderLevel: '20 units',
        status: 'Low Stock',
      },
    ],
    activity: [
      {
        product: 'Barcelona 24/25 Home Jersey',
        date: 'April 21, 2026',
        action: 'Restocked',
        quantityChange: '+240 units',
        quantityTone: 'positive',
        updatedBy: 'Dana Nader',
        status: 'Completed',
      },
      {
        product: 'PSG Training Top Navy',
        date: 'April 20, 2026',
        action: 'Manual Adjustment',
        quantityChange: '-8 units',
        quantityTone: 'negative',
        updatedBy: 'Marc Elias',
        status: 'Verified',
      },
      {
        product: 'Lakers City Edition Swingman',
        date: 'April 20, 2026',
        action: 'Store Transfer',
        quantityChange: '-12 units',
        quantityTone: 'negative',
        updatedBy: 'Rana Saab',
        status: 'Logged',
      },
      {
        product: 'Custom Arsenal Home Kit',
        date: 'April 19, 2026',
        action: 'Supplier PO Created',
        quantityChange: '+60 units',
        quantityTone: 'positive',
        updatedBy: 'Omar Khalil',
        status: 'Pending',
      },
      {
        product: 'Retro Brazil 2002 Shirt',
        date: 'April 18, 2026',
        action: 'Cycle Count',
        quantityChange: '-3 units',
        quantityTone: 'negative',
        updatedBy: 'Lynn Nader',
        status: 'Review',
      },
      {
        product: 'Celtics Statement Edition',
        date: 'April 18, 2026',
        action: 'Restocked',
        quantityChange: '+120 units',
        quantityTone: 'positive',
        updatedBy: 'Hadi Tohme',
        status: 'Completed',
      },
    ],
  },
  '30d': {
    summary: [
      {
        label: 'Total Products',
        value: '486',
        trend: '+8 SKUs',
        comparison: 'new arrivals added this month',
        tone: 'royal',
        trendTone: 'positive',
      },
      {
        label: 'Units In Stock',
        value: '18.7K',
        trend: '+6.4%',
        comparison: 'vs the previous month',
        tone: 'orange',
        trendTone: 'positive',
      },
      {
        label: 'Low Stock Items',
        value: '19',
        trend: '6 urgent',
        comparison: 'requires replenishment review',
        tone: 'crimson',
        trendTone: 'warning',
      },
      {
        label: 'Inventory Value',
        value: '$428K',
        trend: '+4.1%',
        comparison: 'based on landed inventory cost',
        tone: 'green',
        trendTone: 'positive',
      },
    ],
    chart: {
      headline: '18.7K units',
      subline: 'Available stock tracked across the last 30 days.',
      delta: '+6.4% compared with the previous month',
      meta: [
        { label: 'Sell-through', value: '26%' },
        { label: 'Fill rate', value: '96.8%' },
        { label: 'Inbound this month', value: '4.3K' },
      ],
      series: [
        { label: 'Wk 1', available: 14.8, threshold: 12.2 },
        { label: 'Wk 2', available: 15.6, threshold: 12.3 },
        { label: 'Wk 3', available: 16.2, threshold: 12.4 },
        { label: 'Wk 4', available: 17.1, threshold: 12.6 },
        { label: 'Wk 5', available: 18.0, threshold: 12.7 },
        { label: 'Wk 6', available: 18.7, threshold: 12.9 },
      ],
    },
    health: {
      score: 91,
      status: 'Healthy',
      target: 'Target 95 inventory health score',
      note: 'Restocks landed on time, and low-stock exposure dropped after the latest supplier batch closed priority gaps.',
      highlights: [
        { label: 'Coverage', value: '32 days' },
        { label: 'Backorders', value: '14' },
      ],
      breakdown: [
        { label: 'Healthy', count: 403, share: 83, tone: 'green' },
        { label: 'Low Stock', count: 58, share: 12, tone: 'orange' },
        { label: 'Critical', count: 17, share: 3, tone: 'crimson' },
        { label: 'Out of Stock', count: 8, share: 2, tone: 'royal' },
      ],
    },
    categories: [
      { name: 'Football Kits', amount: '8.9K units', share: 48, tone: 'royal' },
      { name: 'Basketball Jerseys', amount: '4.7K units', share: 25, tone: 'orange' },
      { name: 'Custom Orders', amount: '3.1K units', share: 17, tone: 'crimson' },
      { name: 'Training Wear', amount: '2.0K units', share: 10, tone: 'green' },
    ],
    insights: [
      {
        value: 'Football Kits',
        label: 'Most Stocked Category',
        note: 'Core football inventory continues to drive the broadest size and team coverage.',
      },
      {
        value: 'Custom Liverpool Home',
        label: 'Fastest Moving SKU',
        note: 'Name-set demand is drawing down blank stock ahead of the next print cycle.',
      },
      {
        value: '18%',
        label: 'Reorder Rate',
        note: 'Only a tight slice of the catalog now needs replenishment this cycle.',
      },
    ],
    attention: [
      {
        product: 'Barcelona 24/25 Home Jersey',
        sku: 'FB-2418',
        category: 'Football Kits',
        currentStock: '12 units',
        reorderLevel: '24 units',
        status: 'Low Stock',
      },
      {
        product: 'Lakers City Edition Swingman',
        sku: 'BB-1934',
        category: 'Basketball Jerseys',
        currentStock: '6 units',
        reorderLevel: '18 units',
        status: 'Critical',
      },
      {
        product: 'Custom Arsenal Home Kit',
        sku: 'CS-8821',
        category: 'Custom Orders',
        currentStock: '4 units',
        reorderLevel: '10 units',
        status: 'Critical',
      },
      {
        product: 'PSG Training Top Navy',
        sku: 'TR-1140',
        category: 'Training Wear',
        currentStock: '0 units',
        reorderLevel: '16 units',
        status: 'Out of Stock',
      },
      {
        product: 'Retro Brazil 2002 Shirt',
        sku: 'FB-2172',
        category: 'Football Kits',
        currentStock: '9 units',
        reorderLevel: '20 units',
        status: 'Low Stock',
      },
      {
        product: 'Heat Vice Nights Swingman',
        sku: 'BB-2074',
        category: 'Basketball Jerseys',
        currentStock: '8 units',
        reorderLevel: '18 units',
        status: 'Low Stock',
      },
    ],
    activity: [
      {
        product: 'Barcelona 24/25 Home Jersey',
        date: 'April 21, 2026',
        action: 'Restocked',
        quantityChange: '+240 units',
        quantityTone: 'positive',
        updatedBy: 'Dana Nader',
        status: 'Completed',
      },
      {
        product: 'PSG Training Top Navy',
        date: 'April 20, 2026',
        action: 'Manual Adjustment',
        quantityChange: '-8 units',
        quantityTone: 'negative',
        updatedBy: 'Marc Elias',
        status: 'Verified',
      },
      {
        product: 'Lakers City Edition Swingman',
        date: 'April 20, 2026',
        action: 'Store Transfer',
        quantityChange: '-12 units',
        quantityTone: 'negative',
        updatedBy: 'Rana Saab',
        status: 'Logged',
      },
      {
        product: 'Custom Arsenal Home Kit',
        date: 'April 19, 2026',
        action: 'Supplier PO Created',
        quantityChange: '+60 units',
        quantityTone: 'positive',
        updatedBy: 'Omar Khalil',
        status: 'Pending',
      },
      {
        product: 'Retro Brazil 2002 Shirt',
        date: 'April 18, 2026',
        action: 'Cycle Count',
        quantityChange: '-3 units',
        quantityTone: 'negative',
        updatedBy: 'Lynn Nader',
        status: 'Review',
      },
      {
        product: 'Celtics Statement Edition',
        date: 'April 18, 2026',
        action: 'Restocked',
        quantityChange: '+120 units',
        quantityTone: 'positive',
        updatedBy: 'Hadi Tohme',
        status: 'Completed',
      },
    ],
  },
  '90d': {
    summary: [
      {
        label: 'Total Products',
        value: '486',
        trend: '+19 SKUs',
        comparison: 'catalog expanded this quarter',
        tone: 'royal',
        trendTone: 'positive',
      },
      {
        label: 'Units In Stock',
        value: '19.8K',
        trend: '+12.7%',
        comparison: 'vs the previous quarter',
        tone: 'orange',
        trendTone: 'positive',
      },
      {
        label: 'Low Stock Items',
        value: '24',
        trend: '9 urgent',
        comparison: 'peak demand is stressing key SKUs',
        tone: 'crimson',
        trendTone: 'warning',
      },
      {
        label: 'Inventory Value',
        value: '$446K',
        trend: '+8.6%',
        comparison: 'based on landed inventory cost',
        tone: 'green',
        trendTone: 'positive',
      },
    ],
    chart: {
      headline: '19.8K units',
      subline: 'Available stock tracked across the last 90 days.',
      delta: '+12.7% compared with the previous quarter',
      meta: [
        { label: 'Sell-through', value: '29%' },
        { label: 'Fill rate', value: '97.1%' },
        { label: 'Inbound this quarter', value: '12.8K' },
      ],
      series: [
        { label: 'Jan', available: 12.6, threshold: 10.4 },
        { label: 'Feb', available: 13.9, threshold: 10.8 },
        { label: 'Mar', available: 15.1, threshold: 11.1 },
        { label: 'Apr', available: 16.7, threshold: 11.4 },
        { label: 'May', available: 18.4, threshold: 11.8 },
        { label: 'Jun', available: 19.8, threshold: 12.1 },
      ],
    },
    health: {
      score: 93,
      status: 'Strong',
      target: 'Target 95 inventory health score',
      note: 'Quarterly coverage improved, but custom and retro lines are now the first areas to feel sales pressure after campaign drops.',
      highlights: [
        { label: 'Coverage', value: '38 days' },
        { label: 'Backorders', value: '9' },
      ],
      breakdown: [
        { label: 'Healthy', count: 417, share: 86, tone: 'green' },
        { label: 'Low Stock', count: 46, share: 9, tone: 'orange' },
        { label: 'Critical', count: 15, share: 3, tone: 'crimson' },
        { label: 'Out of Stock', count: 8, share: 2, tone: 'royal' },
      ],
    },
    categories: [
      { name: 'Football Kits', amount: '9.2K units', share: 46, tone: 'royal' },
      { name: 'Basketball Jerseys', amount: '5.1K units', share: 26, tone: 'orange' },
      { name: 'Custom Orders', amount: '3.5K units', share: 18, tone: 'crimson' },
      { name: 'Training Wear', amount: '2.0K units', share: 10, tone: 'green' },
    ],
    insights: [
      {
        value: 'Football Kits',
        label: 'Most Stocked Category',
        note: 'Depth improved across football kits after broader team and size intake this quarter.',
      },
      {
        value: 'Retro Brazil 2002',
        label: 'Fastest Moving SKU',
        note: 'Retro demand continues to outperform forecast immediately after each restock.',
      },
      {
        value: '16%',
        label: 'Reorder Rate',
        note: 'Inventory pressure eased as higher-volume suppliers shortened replenishment lead times.',
      },
    ],
    attention: [
      {
        product: 'Barcelona 24/25 Home Jersey',
        sku: 'FB-2418',
        category: 'Football Kits',
        currentStock: '10 units',
        reorderLevel: '24 units',
        status: 'Low Stock',
      },
      {
        product: 'Lakers City Edition Swingman',
        sku: 'BB-1934',
        category: 'Basketball Jerseys',
        currentStock: '5 units',
        reorderLevel: '18 units',
        status: 'Critical',
      },
      {
        product: 'Custom Arsenal Home Kit',
        sku: 'CS-8821',
        category: 'Custom Orders',
        currentStock: '3 units',
        reorderLevel: '10 units',
        status: 'Critical',
      },
      {
        product: 'PSG Training Top Navy',
        sku: 'TR-1140',
        category: 'Training Wear',
        currentStock: '0 units',
        reorderLevel: '16 units',
        status: 'Out of Stock',
      },
      {
        product: 'Retro Brazil 2002 Shirt',
        sku: 'FB-2172',
        category: 'Football Kits',
        currentStock: '7 units',
        reorderLevel: '20 units',
        status: 'Low Stock',
      },
      {
        product: 'Inter Miami Pink Home Jersey',
        sku: 'FB-2580',
        category: 'Football Kits',
        currentStock: '8 units',
        reorderLevel: '22 units',
        status: 'Low Stock',
      },
    ],
    activity: [
      {
        product: 'Barcelona 24/25 Home Jersey',
        date: 'April 21, 2026',
        action: 'Restocked',
        quantityChange: '+320 units',
        quantityTone: 'positive',
        updatedBy: 'Dana Nader',
        status: 'Completed',
      },
      {
        product: 'PSG Training Top Navy',
        date: 'April 20, 2026',
        action: 'Manual Adjustment',
        quantityChange: '-10 units',
        quantityTone: 'negative',
        updatedBy: 'Marc Elias',
        status: 'Verified',
      },
      {
        product: 'Lakers City Edition Swingman',
        date: 'April 20, 2026',
        action: 'Showroom Transfer',
        quantityChange: '-18 units',
        quantityTone: 'negative',
        updatedBy: 'Rana Saab',
        status: 'Logged',
      },
      {
        product: 'Custom Arsenal Home Kit',
        date: 'April 19, 2026',
        action: 'Supplier PO Created',
        quantityChange: '+90 units',
        quantityTone: 'positive',
        updatedBy: 'Omar Khalil',
        status: 'Pending',
      },
      {
        product: 'Retro Brazil 2002 Shirt',
        date: 'April 18, 2026',
        action: 'Cycle Count',
        quantityChange: '-5 units',
        quantityTone: 'negative',
        updatedBy: 'Lynn Nader',
        status: 'Review',
      },
      {
        product: 'Heat Vice Nights Swingman',
        date: 'April 17, 2026',
        action: 'Restocked',
        quantityChange: '+180 units',
        quantityTone: 'positive',
        updatedBy: 'Hadi Tohme',
        status: 'Completed',
      },
    ],
  },
};

const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;

const formatTickValue = (value) => `${value}k`;

const getStatusClassName = (status) => status.toLowerCase().replace(/\s+/g, '-');

const buildInventoryChartGeometry = (series) => {
  const width = 640;
  const height = 280;
  const padding = {
    top: 16,
    right: 12,
    bottom: 18,
    left: 44,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxSeriesValue = Math.max(...series.map((point) => Math.max(point.available, point.threshold)));
  const stepBase = maxSeriesValue <= 12 ? 2 : 5;
  const stepValue = Math.ceil((maxSeriesValue / 4) / stepBase) * stepBase;
  const maxValue = stepValue * 4;
  const tickSteps = 4;
  const baselineY = padding.top + chartHeight;

  const getX = (index) => (
    padding.left + (chartWidth * index) / Math.max(series.length - 1, 1)
  );

  const getY = (value) => baselineY - (value / maxValue) * chartHeight;

  const points = series.map((point, index) => ({
    ...point,
    x: getX(index),
    availableY: getY(point.available),
    thresholdY: getY(point.threshold),
  }));

  const availablePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.availableY}`)
    .join(' ');

  const thresholdPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.thresholdY}`)
    .join(' ');

  const areaPath = `${availablePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

  const ticks = Array.from({ length: tickSteps + 1 }, (_, index) => {
    const value = maxValue - (maxValue / tickSteps) * index;
    const y = padding.top + (chartHeight / tickSteps) * index;

    return {
      value,
      y,
    };
  });

  return {
    width,
    height,
    padding,
    availablePath,
    thresholdPath,
    areaPath,
    ticks,
    points,
  };
};

const InventoryReportPage = () => {
  const [activePeriod, setActivePeriod] = useState('30d');

  const activeReport = useMemo(() => reportSnapshots[activePeriod], [activePeriod]);
  const selectedPeriod = useMemo(
    () => periodOptions.find((option) => option.value === activePeriod) ?? periodOptions[1],
    [activePeriod]
  );
  const chartGeometry = useMemo(
    () => buildInventoryChartGeometry(activeReport.chart.series),
    [activeReport]
  );

  const handleExport = () => {
    const rows = [
      ['Inventory Report', selectedPeriod.label],
      [],
      ['Attention Items'],
      ['Product', 'SKU', 'Category', 'Current Stock', 'Reorder Level', 'Status'],
      ...activeReport.attention.map((item) => ([
        item.product,
        item.sku,
        item.category,
        item.currentStock,
        item.reorderLevel,
        item.status,
      ])),
      [],
      ['Recent Activity'],
      ['Product', 'Date', 'Action', 'Quantity Change', 'Updated By', 'Status'],
      ...activeReport.activity.map((item) => ([
        item.product,
        item.date,
        item.action,
        item.quantityChange,
        item.updatedBy,
        item.status,
      ])),
    ];

    const csv = rows
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `inventory-report-${activePeriod}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell className="inventory-report-page">
      <section className="inventory-report-hero">
        <div className="inventory-report-hero-inner">
          <PageHeader
            eyebrow="Admin Analytics"
            title="Inventory Report"
            description="Track stock health, restock pressure, category balance, and recent inventory movement from one clean reporting view."
            actions={(
              <div className="inventory-report-toolbar">
                <FormField label="Date range" htmlFor="inventory-report-range">
                  <select
                    id="inventory-report-range"
                    className="ui-select"
                    value={activePeriod}
                    onChange={(event) => setActivePeriod(event.target.value)}
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <Button variant="secondary" onClick={handleExport}>
                  Export Report
                </Button>
                <Button>Restock Queue</Button>
              </div>
            )}
          />

          <div className="inventory-report-kpi-grid">
            {activeReport.summary.map((item) => (
              <Card key={item.label} className={`inventory-report-kpi-card tone-${item.tone}`}>
                <div className="inventory-report-kpi-top">
                  <span className="inventory-report-kpi-label">{item.label}</span>
                </div>

                <strong className="inventory-report-kpi-value">{item.value}</strong>

                <div className="inventory-report-kpi-footer">
                  <span className={`inventory-report-trend is-${item.trendTone}`}>{item.trend}</span>
                  <span className="inventory-report-kpi-comparison">{item.comparison}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="inventory-report-grid">
        <Card className="inventory-report-chart-card">
          <div className="inventory-report-section-heading">
            <div>
              <p className="inventory-report-kicker">Inventory overview</p>
              <h2>Stock Movement</h2>
            </div>

            <div className="inventory-report-segment" role="tablist" aria-label="Inventory report period">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={activePeriod === option.value ? 'is-active' : ''}
                  onClick={() => setActivePeriod(option.value)}
                >
                  {option.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="inventory-report-chart-summary">
            <div className="inventory-report-chart-spotlight">
              <strong>{activeReport.chart.headline}</strong>
              <span>{activeReport.chart.subline}</span>
              <p>{activeReport.chart.delta}</p>
            </div>

            {activeReport.chart.meta.map((item) => (
              <div key={item.label} className="inventory-report-chart-meta-item">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="inventory-report-legend" aria-hidden="true">
            <span className="inventory-report-legend-item">
              <span className="inventory-report-legend-swatch is-available" />
              On-hand stock
            </span>
            <span className="inventory-report-legend-item">
              <span className="inventory-report-legend-swatch is-threshold" />
              Safety threshold
            </span>
          </div>

          <div className="inventory-report-chart-shell">
            <svg
              className="inventory-report-chart-svg"
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
              role="img"
              aria-label={`Inventory on-hand stock and threshold chart for ${selectedPeriod.label}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="inventory-report-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(27, 59, 138)" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="rgb(27, 59, 138)" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {chartGeometry.ticks.map((tick) => (
                <g key={tick.value}>
                  <line
                    x1={chartGeometry.padding.left}
                    x2={chartGeometry.width - chartGeometry.padding.right}
                    y1={tick.y}
                    y2={tick.y}
                    className="inventory-report-grid-line"
                  />
                  <text x="2" y={tick.y + 4} className="inventory-report-grid-label">
                    {formatTickValue(tick.value)}
                  </text>
                </g>
              ))}

              <path d={chartGeometry.areaPath} fill="url(#inventory-report-area-gradient)" />
              <path d={chartGeometry.thresholdPath} className="inventory-report-threshold-line" />
              <path d={chartGeometry.availablePath} className="inventory-report-available-line" />

              {chartGeometry.points.map((point) => (
                <circle
                  key={point.label}
                  cx={point.x}
                  cy={point.availableY}
                  r="5"
                  className="inventory-report-point"
                />
              ))}
            </svg>

            <div className="inventory-report-axis" aria-hidden="true">
              {activeReport.chart.series.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>
        </Card>

        <div className="inventory-report-side-column">
          <Card className="inventory-report-health-card">
            <div className="inventory-report-section-heading is-compact">
              <div>
                <p className="inventory-report-kicker">Stock status breakdown</p>
                <h2>Inventory Health</h2>
              </div>

              <span className="inventory-report-chip">{activeReport.health.status}</span>
            </div>

            <div className="inventory-report-health-hero">
              <div className="inventory-report-ring">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle
                    className="inventory-report-ring-track"
                    cx="60"
                    cy="60"
                    r={HEALTH_RING_RADIUS}
                  />
                  <circle
                    className="inventory-report-ring-progress"
                    cx="60"
                    cy="60"
                    r={HEALTH_RING_RADIUS}
                    strokeDasharray={`${HEALTH_RING_CIRCUMFERENCE} ${HEALTH_RING_CIRCUMFERENCE}`}
                    strokeDashoffset={
                      HEALTH_RING_CIRCUMFERENCE - (HEALTH_RING_CIRCUMFERENCE * activeReport.health.score) / 100
                    }
                  />
                </svg>

                <div className="inventory-report-ring-copy">
                  <strong>{activeReport.health.score}%</strong>
                  <span>Health</span>
                </div>
              </div>

              <div className="inventory-report-health-copy">
                <strong>{activeReport.health.status}</strong>
                <p>{activeReport.health.target}</p>
              </div>
            </div>

            <p className="inventory-report-health-note">{activeReport.health.note}</p>

            <div className="inventory-report-breakdown-bar">
              {activeReport.health.breakdown.map((item) => (
                <span
                  key={item.label}
                  className={`inventory-report-breakdown-segment tone-${item.tone}`}
                  style={{ '--segment-width': `${item.share}%` }}
                />
              ))}
            </div>

            <div className="inventory-report-breakdown-grid">
              {activeReport.health.breakdown.map((item) => (
                <div key={item.label} className="inventory-report-breakdown-item">
                  <strong>{item.count}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="inventory-report-mini-grid">
              {activeReport.health.highlights.map((item) => (
                <div key={item.label} className="inventory-report-mini-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="inventory-report-categories-card">
            <div className="inventory-report-section-heading is-compact">
              <div>
                <p className="inventory-report-kicker">Category distribution</p>
                <h2>Units By Category</h2>
              </div>
            </div>

            <div className="inventory-report-category-list">
              {activeReport.categories.map((category) => (
                <div key={category.name} className="inventory-report-category-row">
                  <div className="inventory-report-category-head">
                    <div>
                      <strong>{category.name}</strong>
                      <span>{category.amount}</span>
                    </div>
                    <span className="inventory-report-category-share">{category.share}%</span>
                  </div>

                  <div className="inventory-report-category-bar">
                    <span
                      className={`inventory-report-category-fill tone-${category.tone}`}
                      style={{ '--category-fill': `${category.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="inventory-report-insights-card">
        <div className="inventory-report-section-heading is-compact">
          <div>
            <p className="inventory-report-kicker">Quick insights</p>
            <h2>Inventory Signals</h2>
          </div>
        </div>

        <div className="inventory-report-insights-grid">
          {activeReport.insights.map((item) => (
            <div key={item.label} className="inventory-report-insight-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <p>{item.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="inventory-report-attention-card" padded={false}>
        <div className="inventory-report-table-header">
          <div>
            <p className="inventory-report-kicker">Needs attention</p>
            <h2>Low Stock Watchlist</h2>
          </div>

          <span className="inventory-report-table-note">
            {activeReport.attention.length} items below reorder threshold
          </span>
        </div>

        <div className="inventory-report-table-wrap">
          <table className="inventory-report-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {activeReport.attention.map((item) => (
                <tr key={item.sku}>
                  <td data-label="Product">
                    <div className="inventory-report-product-cell">
                      <strong>{item.product}</strong>
                    </div>
                  </td>
                  <td data-label="SKU">
                    <span className="inventory-report-table-text">{item.sku}</span>
                  </td>
                  <td data-label="Category">
                    <span className="inventory-report-table-text">{item.category}</span>
                  </td>
                  <td data-label="Current Stock">
                    <span className="inventory-report-table-text">{item.currentStock}</span>
                  </td>
                  <td data-label="Reorder Level">
                    <span className="inventory-report-table-text">{item.reorderLevel}</span>
                  </td>
                  <td data-label="Status">
                    <span className={`inventory-report-status status-${getStatusClassName(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="inventory-report-activity-card" padded={false}>
        <div className="inventory-report-table-header">
          <div>
            <p className="inventory-report-kicker">Recent inventory activity</p>
            <h2>Stock Updates</h2>
          </div>

          <span className="inventory-report-table-note">
            {activeReport.activity.length} logged updates in {selectedPeriod.label.toLowerCase()}
          </span>
        </div>

        <div className="inventory-report-table-wrap">
          <table className="inventory-report-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Date</th>
                <th>Action</th>
                <th>Quantity Change</th>
                <th>Updated By</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {activeReport.activity.map((item) => (
                <tr key={`${item.product}-${item.date}-${item.action}`}>
                  <td data-label="Product">
                    <div className="inventory-report-product-cell">
                      <strong>{item.product}</strong>
                    </div>
                  </td>
                  <td data-label="Date">
                    <span className="inventory-report-table-text">{item.date}</span>
                  </td>
                  <td data-label="Action">
                    <span className="inventory-report-table-text">{item.action}</span>
                  </td>
                  <td data-label="Quantity Change">
                    <span className={`inventory-report-quantity is-${item.quantityTone}`}>
                      {item.quantityChange}
                    </span>
                  </td>
                  <td data-label="Updated By">
                    <span className="inventory-report-table-text">{item.updatedBy}</span>
                  </td>
                  <td data-label="Status">
                    <span className={`inventory-report-status status-${getStatusClassName(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
};

export default InventoryReportPage;
