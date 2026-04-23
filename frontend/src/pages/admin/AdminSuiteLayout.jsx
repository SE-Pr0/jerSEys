import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card, PageHeader, PageShell } from '../../components/ui';
import './AdminSuite.css';

const AdminSuiteLayout = ({
  className = '',
  eyebrow = 'Admin Console',
  title,
  description,
  actions,
  tabs = [],
  metrics = [],
  children,
}) => {
  const shellClassName = `admin-suite-page${className ? ` ${className}` : ''}`;

  return (
    <PageShell className={shellClassName}>
      <section className="admin-suite-hero">
        <div className="admin-suite-hero-inner">
          <PageHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            actions={actions}
          />

          {tabs.length > 0 ? (
            <nav className="admin-suite-tabs" aria-label="Admin sections">
              {tabs.map((tab) => (
                <NavLink
                  className={({ isActive }) => `admin-suite-tab${isActive ? ' is-active' : ''}`}
                  end={tab.end}
                  key={tab.to}
                  to={tab.to}
                >
                  <span>{tab.label}</span>
                </NavLink>
              ))}
            </nav>
          ) : null}

          {metrics.length > 0 ? (
            <div className="admin-suite-metrics" aria-label="Admin overview metrics">
              {metrics.map((metric) => (
                <Card className={`admin-suite-metric-card tone-${metric.tone || 'royal'}`} key={metric.label}>
                  <div className="admin-suite-metric-label">{metric.label}</div>
                  <strong className="admin-suite-metric-value">{metric.value}</strong>
                  {metric.trend ? (
                    <div className={`admin-suite-metric-trend${metric.trendTone ? ` is-${metric.trendTone}` : ''}`}>
                      {metric.trend}
                    </div>
                  ) : null}
                  {metric.note ? <p className="admin-suite-metric-note">{metric.note}</p> : null}
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {children}
    </PageShell>
  );
};

export default AdminSuiteLayout;
