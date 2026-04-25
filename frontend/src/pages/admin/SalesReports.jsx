import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  FormField,
  PageHeader,
  PageShell,
} from '../../components/ui';
import './SalesReports.css';

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const periodOptions = [
  { value: '7d', label: 'Last 7 Days', shortLabel: '7D' },
  { value: '30d', label: 'Last 30 Days', shortLabel: '30D' },
  { value: '90d', label: 'Last 90 Days', shortLabel: '90D' },
];

const reportSnapshots = {
  '7d': {
    summary: [
      {
        label: 'Total Sales',
        value: '$42.8K',
        trend: '+12.4%',
        comparison: 'vs the previous 7 days',
        tone: 'royal',
      },
      {
        label: 'Total Orders',
        value: '318',
        trend: '+8.1%',
        comparison: 'basket count is steadily rising',
        tone: 'orange',
      },
      {
        label: 'Products Sold',
        value: '574',
        trend: '+10.3%',
        comparison: '58 bundle add-ons cleared this week',
        tone: 'crimson',
      },
      {
        label: 'Conversion Rate',
        value: '4.2%',
        trend: '+0.6 pts',
        comparison: 'from 7.6K sessions',
        tone: 'green',
      },
    ],
    chart: {
      headline: '$42.8K',
      subline: 'Revenue booked across the last 7 days.',
      delta: '+12.4% compared with the previous week',
      meta: [
        { label: 'Gross margin', value: '36.8%' },
        { label: 'AOV', value: '$134' },
        { label: 'Returning buyers', value: '34%' },
      ],
      series: [
        { label: 'Mon', revenue: 4.8, target: 4.2 },
        { label: 'Tue', revenue: 5.3, target: 4.4 },
        { label: 'Wed', revenue: 5.9, target: 4.9 },
        { label: 'Thu', revenue: 7.2, target: 5.4 },
        { label: 'Fri', revenue: 6.8, target: 5.9 },
        { label: 'Sat', revenue: 6.1, target: 5.5 },
        { label: 'Sun', revenue: 6.7, target: 5.8 },
      ],
    },
    target: {
      progress: 82,
      value: '$42.8K',
      goal: '$52K weekly target',
      deadline: 'Week 16',
      note: 'Thursday delivered the sharpest lift after a same-day flash discount and restock push.',
      highlights: [
        { label: 'New customers', value: '+82' },
        { label: 'Refund rate', value: '1.1%' },
      ],
    },
    categories: [
      { name: 'Football Kits', amount: '$18.4K', share: 50, tone: 'royal' },
      { name: 'Basketball', amount: '$10.5K', share: 28, tone: 'orange' },
      { name: 'Custom Orders', amount: '$8.1K', share: 22, tone: 'crimson' },
    ],
    insights: [
      {
        value: '$134',
        label: 'Average Order Value',
        note: 'Premium custom names are lifting basket value this week.',
      },
      {
        value: '34%',
        label: 'Repeat Customer Mix',
        note: 'Loyal buyers are contributing more than a third of weekly orders.',
      },
      {
        value: '2.1 hrs',
        label: 'Fastest Fulfillment Window',
        note: 'Local courier dispatch improved after noon-cutoff batching.',
      },
    ],
    orders: [
      {
        product: 'Barcelona 24/25 Home Jersey',
        orderId: 'SR-4182',
        date: 'April 21, 2026',
        customer: 'Lina Karam',
        status: 'Completed',
        amount: '$138.00',
        channel: 'Online Store',
      },
      {
        product: 'Celtics Statement Edition',
        orderId: 'SR-4175',
        date: 'April 20, 2026',
        customer: 'Omar Yassin',
        status: 'Packed',
        amount: '$124.00',
        channel: 'Instagram Shop',
      },
      {
        product: 'Custom Liverpool Home Kit',
        orderId: 'SR-4168',
        date: 'April 19, 2026',
        customer: 'Maya Khoury',
        status: 'Processing',
        amount: '$152.00',
        channel: 'Online Store',
      },
      {
        product: 'Arsenal Third Jersey',
        orderId: 'SR-4162',
        date: 'April 18, 2026',
        customer: 'Karim Farah',
        status: 'Completed',
        amount: '$97.00',
        channel: 'Walk-in Order',
      },
      {
        product: 'PSG Training Top',
        orderId: 'SR-4159',
        date: 'April 18, 2026',
        customer: 'Rana Saab',
        status: 'Refunded',
        amount: '$64.00',
        channel: 'Online Store',
      },
    ],
  },
  '30d': {
    summary: [
      {
        label: 'Total Sales',
        value: '$184.6K',
        trend: '+18.6%',
        comparison: 'vs last month',
        tone: 'royal',
      },
      {
        label: 'Total Orders',
        value: '1,286',
        trend: '+11.2%',
        comparison: 'higher order flow across all channels',
        tone: 'orange',
      },
      {
        label: 'Products Sold',
        value: '2,944',
        trend: '+14.7%',
        comparison: 'custom bundles led unit growth',
        tone: 'crimson',
      },
      {
        label: 'Conversion Rate',
        value: '5.1%',
        trend: '+0.9 pts',
        comparison: 'from 36.8K visitors',
        tone: 'green',
      },
    ],
    chart: {
      headline: '$184.6K',
      subline: 'Revenue generated over the last 30 days.',
      delta: '+18.6% compared with the previous month',
      meta: [
        { label: 'Gross margin', value: '38.1%' },
        { label: 'AOV', value: '$143' },
        { label: 'Returning buyers', value: '38%' },
      ],
      series: [
        { label: 'Wk 1', revenue: 28, target: 24 },
        { label: 'Wk 2', revenue: 31, target: 27 },
        { label: 'Wk 3', revenue: 34, target: 29 },
        { label: 'Wk 4', revenue: 37, target: 31 },
        { label: 'Wk 5', revenue: 42, target: 34 },
        { label: 'Wk 6', revenue: 45, target: 37 },
      ],
    },
    target: {
      progress: 78,
      value: '$184.6K',
      goal: '$236K monthly target',
      deadline: 'April target',
      note: 'Football kits remain the strongest driver, while customization has become the fastest-growing revenue stream.',
      highlights: [
        { label: 'New customers', value: '+412' },
        { label: 'Refund rate', value: '1.4%' },
      ],
    },
    categories: [
      { name: 'Football Kits', amount: '$88.3K', share: 53, tone: 'royal' },
      { name: 'Basketball', amount: '$47.8K', share: 29, tone: 'orange' },
      { name: 'Custom Orders', amount: '$30.4K', share: 18, tone: 'crimson' },
    ],
    insights: [
      {
        value: '$143',
        label: 'Average Order Value',
        note: 'Premium name-set and patch add-ons are keeping baskets elevated.',
      },
      {
        value: '38%',
        label: 'Returning Customer Mix',
        note: 'Retention climbed after the early-access drop for repeat buyers.',
      },
      {
        value: '91%',
        label: 'On-Time Fulfillment',
        note: 'Warehouse handoff stays healthy despite higher custom-order volume.',
      },
    ],
    orders: [
      {
        product: 'Real Madrid Away Jersey',
        orderId: 'SR-4021',
        date: 'April 20, 2026',
        customer: 'Nour Haddad',
        status: 'Completed',
        amount: '$142.00',
        channel: 'Online Store',
      },
      {
        product: 'Inter Miami Custom Home Kit',
        orderId: 'SR-4014',
        date: 'April 19, 2026',
        customer: 'Youssef Daher',
        status: 'Processing',
        amount: '$169.00',
        channel: 'Online Store',
      },
      {
        product: 'Golden State Warriors Swingman',
        orderId: 'SR-4007',
        date: 'April 18, 2026',
        customer: 'Tala Sayegh',
        status: 'Packed',
        amount: '$118.00',
        channel: 'Instagram Shop',
      },
      {
        product: 'AC Milan Retro Shirt',
        orderId: 'SR-3999',
        date: 'April 17, 2026',
        customer: 'Fares Hallak',
        status: 'Completed',
        amount: '$104.00',
        channel: 'Walk-in Order',
      },
      {
        product: 'Manchester United Training Set',
        orderId: 'SR-3994',
        date: 'April 16, 2026',
        customer: 'Jad Rizk',
        status: 'Refunded',
        amount: '$86.00',
        channel: 'Online Store',
      },
      {
        product: 'Custom Lakers City Edition',
        orderId: 'SR-3986',
        date: 'April 15, 2026',
        customer: 'Lynn Nader',
        status: 'Completed',
        amount: '$156.00',
        channel: 'Online Store',
      },
    ],
  },
  '90d': {
    summary: [
      {
        label: 'Total Sales',
        value: '$612.4K',
        trend: '+22.1%',
        comparison: 'vs the previous 90 days',
        tone: 'royal',
      },
      {
        label: 'Total Orders',
        value: '4,219',
        trend: '+17.4%',
        comparison: 'consistency across online and in-store',
        tone: 'orange',
      },
      {
        label: 'Products Sold',
        value: '9,873',
        trend: '+19.2%',
        comparison: 'bundled purchases drove unit velocity',
        tone: 'crimson',
      },
      {
        label: 'Conversion Rate',
        value: '5.6%',
        trend: '+1.1 pts',
        comparison: 'from 104K visitors',
        tone: 'green',
      },
    ],
    chart: {
      headline: '$612.4K',
      subline: 'Revenue captured across the last 90 days.',
      delta: '+22.1% compared with the previous quarter',
      meta: [
        { label: 'Gross margin', value: '39.4%' },
        { label: 'AOV', value: '$145' },
        { label: 'Returning buyers', value: '41%' },
      ],
      series: [
        { label: 'Jan', revenue: 54, target: 49 },
        { label: 'Feb', revenue: 61, target: 54 },
        { label: 'Mar', revenue: 68, target: 58 },
        { label: 'Apr', revenue: 74, target: 63 },
        { label: 'May', revenue: 79, target: 68 },
        { label: 'Jun', revenue: 86, target: 72 },
      ],
    },
    target: {
      progress: 84,
      value: '$612.4K',
      goal: '$728K quarterly target',
      deadline: 'Q2 target',
      note: 'Repeat buyers and limited-edition drops are compounding nicely, giving the quarter a strong finish trajectory.',
      highlights: [
        { label: 'New customers', value: '+1.1K' },
        { label: 'Refund rate', value: '1.2%' },
      ],
    },
    categories: [
      { name: 'Football Kits', amount: '$287.4K', share: 52, tone: 'royal' },
      { name: 'Basketball', amount: '$165.3K', share: 30, tone: 'orange' },
      { name: 'Custom Orders', amount: '$104.1K', share: 18, tone: 'crimson' },
    ],
    insights: [
      {
        value: '$145',
        label: 'Average Order Value',
        note: 'AOV remains strong as retro and custom kits continue outperforming basics.',
      },
      {
        value: '41%',
        label: 'Returning Customer Mix',
        note: 'Quarterly retention is up after loyalty bundles and faster reorder flows.',
      },
      {
        value: '94%',
        label: 'On-Time Fulfillment',
        note: 'The operations team cleared demand spikes without eroding delivery SLAs.',
      },
    ],
    orders: [
      {
        product: 'Juventus Third Jersey',
        orderId: 'SR-3782',
        date: 'April 20, 2026',
        customer: 'Rita Ghosn',
        status: 'Completed',
        amount: '$132.00',
        channel: 'Online Store',
      },
      {
        product: 'Custom Bayern Munich Home Kit',
        orderId: 'SR-3769',
        date: 'April 18, 2026',
        customer: 'Ali Chamoun',
        status: 'Processing',
        amount: '$161.00',
        channel: 'Online Store',
      },
      {
        product: 'Phoenix Suns Statement Jersey',
        orderId: 'SR-3758',
        date: 'April 17, 2026',
        customer: 'Jana Mneimneh',
        status: 'Packed',
        amount: '$114.00',
        channel: 'Instagram Shop',
      },
      {
        product: 'Retro Brazil 2002 Shirt',
        orderId: 'SR-3742',
        date: 'April 15, 2026',
        customer: 'Charbel Atallah',
        status: 'Completed',
        amount: '$120.00',
        channel: 'Walk-in Order',
      },
      {
        product: 'Chelsea Training Quarter Zip',
        orderId: 'SR-3728',
        date: 'April 14, 2026',
        customer: 'Mira Khalil',
        status: 'Refunded',
        amount: '$78.00',
        channel: 'Online Store',
      },
      {
        product: 'Custom Nuggets Finals Jersey',
        orderId: 'SR-3719',
        date: 'April 13, 2026',
        customer: 'Hadi Tohme',
        status: 'Completed',
        amount: '$158.00',
        channel: 'Online Store',
      },
    ],
  },
};

const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;

const formatTickValue = (value) => `$${value}k`;

const getStatusClassName = (status) => status.toLowerCase().replace(/\s+/g, '-');

const buildChartGeometry = (series) => {
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
  const maxSeriesValue = Math.max(...series.map((point) => Math.max(point.revenue, point.target)));
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
    revenueY: getY(point.revenue),
    targetY: getY(point.target),
  }));

  const revenuePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.revenueY}`)
    .join(' ');

  const targetPath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.targetY}`)
    .join(' ');

  const areaPath = `${revenuePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

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
    baselineY,
    revenuePath,
    targetPath,
    areaPath,
    ticks,
    points,
  };
};

const SalesReportPage = () => {
  const [activePeriod, setActivePeriod] = useState('30d');

  const activeReport = useMemo(() => reportSnapshots[activePeriod], [activePeriod]);
  const selectedPeriod = useMemo(
    () => periodOptions.find((option) => option.value === activePeriod) ?? periodOptions[1],
    [activePeriod]
  );
  const chartGeometry = useMemo(
    () => buildChartGeometry(activeReport.chart.series),
    [activeReport]
  );

  const handleExport = () => {
    const rows = [
      ['Product', 'Order ID', 'Date', 'Customer', 'Status', 'Amount', 'Channel'],
      ...activeReport.orders.map((order) => ([
        order.product,
        order.orderId,
        order.date,
        order.customer,
        order.status,
        order.amount,
        order.channel,
      ])),
    ];

    const csv = rows
      .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `sales-report-${activePeriod}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell className="sales-report-page">
      <section className="sales-report-hero">
        <div className="sales-report-hero-inner">
          <PageHeader
            eyebrow="Admin Analytics"
            title={(
              <>
                <span>Sales</span> Report
              </>
            )}
            description="Monitor revenue momentum, order performance, and category trends from one clean sales dashboard."
            actions={(
              <div className="sales-report-toolbar">
                <FormField label="Date range" htmlFor="sales-report-range">
                  <select
                    id="sales-report-range"
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

                <Button onClick={handleExport}>Export Report</Button>
              </div>
            )}
          />

          <div className="sales-report-kpi-grid">
            {activeReport.summary.map((item) => (
              <Card key={item.label} className={`sales-report-kpi-card tone-${item.tone}`}>
                <div className="sales-report-kpi-top">
                  <span className="sales-report-kpi-label">{item.label}</span>
                </div>

                <strong className="sales-report-kpi-value">{item.value}</strong>

                <div className="sales-report-kpi-footer">
                  <span
                    className={`sales-report-trend${
                      item.trend.startsWith('-') ? ' is-negative' : ' is-positive'
                    }`}
                  >
                    {item.trend}
                  </span>
                  <span className="sales-report-kpi-comparison">{item.comparison}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="sales-report-grid">
        <Card className="sales-report-chart-card sales-report-chart-card--full">
          <div className="sales-report-section-heading">
            <div>
              <p className="sales-report-kicker">Performance overview</p>
              <h2>Sales Overview</h2>
            </div>

            <div className="sales-report-segment" role="tablist" aria-label="Sales report period">
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

          <div className="sales-report-chart-summary">
            <div className="sales-report-chart-spotlight">
              <strong>{activeReport.chart.headline}</strong>
              <span>{activeReport.chart.subline}</span>
              <p>{activeReport.chart.delta}</p>
            </div>

            {activeReport.chart.meta.map((item) => (
              <div key={item.label} className="sales-report-chart-meta-item">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="sales-report-legend" aria-hidden="true">
            <span className="sales-report-legend-item">
              <span className="sales-report-legend-swatch is-revenue" />
              Revenue
            </span>
            <span className="sales-report-legend-item">
              <span className="sales-report-legend-swatch is-target" />
              Target
            </span>
          </div>

          <div className="sales-report-chart-shell">
            <svg
              className="sales-report-chart-svg"
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
              role="img"
              aria-label={`Revenue and target chart for ${selectedPeriod.label}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="sales-report-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(27, 59, 138)" stopOpacity="0.26" />
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
                    className="sales-report-grid-line"
                  />
                  <text x="2" y={tick.y + 4} className="sales-report-grid-label">
                    {formatTickValue(tick.value)}
                  </text>
                </g>
              ))}

              <path d={chartGeometry.areaPath} fill="url(#sales-report-area-gradient)" />
              <path d={chartGeometry.targetPath} className="sales-report-target-line" />
              <path d={chartGeometry.revenuePath} className="sales-report-revenue-line" />

              {chartGeometry.points.map((point) => (
                <circle
                  key={point.label}
                  cx={point.x}
                  cy={point.revenueY}
                  r="5"
                  className="sales-report-point"
                />
              ))}
            </svg>

            <div className="sales-report-axis" aria-hidden="true">
              {activeReport.chart.series.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>
        </Card>

        <div className="sales-report-secondary-grid">
          <Card className="sales-report-target-card sales-report-target-card--compact">
            <div className="sales-report-section-heading is-compact">
              <div>
                <p className="sales-report-kicker">Revenue progress</p>
                <h2>Sales Target</h2>
              </div>

              <span className="sales-report-chip">{activeReport.target.deadline}</span>
            </div>

            <div className="sales-report-target-hero">
              <div className="sales-report-ring">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle
                    className="sales-report-ring-track"
                    cx="60"
                    cy="60"
                    r={RING_RADIUS}
                  />
                  <circle
                    className="sales-report-ring-progress"
                    cx="60"
                    cy="60"
                    r={RING_RADIUS}
                    strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                    strokeDashoffset={
                      RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * activeReport.target.progress) / 100
                    }
                  />
                </svg>

                <div className="sales-report-ring-copy">
                  <strong>{activeReport.target.progress}%</strong>
                  <span>Reached</span>
                </div>
              </div>

              <div className="sales-report-target-copy">
                <strong>{activeReport.target.value}</strong>
                <p>
                  Achieved out of <span>{activeReport.target.goal}</span>
                </p>
              </div>
            </div>

            <p className="sales-report-target-note">{activeReport.target.note}</p>

            <div className="sales-report-mini-grid">
              {activeReport.target.highlights.map((item) => (
                <div key={item.label} className="sales-report-mini-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="sales-report-categories-card">
            <div className="sales-report-section-heading is-compact">
              <div>
                <p className="sales-report-kicker">Product statistics</p>
                <h2>Top Categories</h2>
              </div>
            </div>

            <div className="sales-report-category-list">
              {activeReport.categories.map((category) => (
                <div key={category.name} className="sales-report-category-row">
                  <div className="sales-report-category-head">
                    <div>
                      <strong>{category.name}</strong>
                      <span>{category.amount}</span>
                    </div>
                    <span className="sales-report-category-share">{category.share}%</span>
                  </div>

                  <div className="sales-report-category-bar">
                    <span
                      className={`sales-report-category-fill tone-${category.tone}`}
                      style={{ '--category-fill': `${category.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="sales-report-insights-card">
        <div className="sales-report-section-heading is-compact">
          <div>
            <p className="sales-report-kicker">Quick insights</p>
            <h2>Operational Highlights</h2>
          </div>
        </div>

        <div className="sales-report-insights-grid">
          {activeReport.insights.map((item) => (
            <div key={item.label} className="sales-report-insight-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <p>{item.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="sales-report-table-card" padded={false}>
        <div className="sales-report-table-header">
          <div>
            <p className="sales-report-kicker">Recent sales</p>
            <h2>Transaction History</h2>
          </div>

          <span className="sales-report-table-note">
            {activeReport.orders.length} recent orders in {selectedPeriod.label.toLowerCase()}
          </span>
        </div>

        <div className="sales-report-table-wrap">
          <table className="sales-report-table">
            <thead>
              <tr>
                <th>Product / Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {activeReport.orders.map((order) => (
                <tr key={order.orderId}>
                  <td data-label="Product / Order">
                    <div className="sales-report-order-cell">
                      <strong>{order.product}</strong>
                      <span>
                        {order.orderId} / {order.channel}
                      </span>
                    </div>
                  </td>
                  <td data-label="Date">
                    <span className="sales-report-table-text">{order.date}</span>
                  </td>
                  <td data-label="Customer">
                    <div className="sales-report-customer-cell">
                      <strong>{order.customer}</strong>
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`sales-report-status status-${getStatusClassName(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Amount">
                    <div className="sales-report-amount-cell">
                      <strong>{order.amount}</strong>
                    </div>
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

export default SalesReportPage;
