import React from 'react';
import { Button, PageHeader, PageShell } from '../components/ui';
import squintingGuy from '../../assets/images/black-guy-squinting-guy-squinting.png';
import '../styles/not-found.css';

const NotFound = () => {
  return (
    <PageShell narrow className="not-found-shell">
      <PageHeader
        eyebrow="404"
        title="Page Not Found"
      />
      <div className="not-found-panel">
        <h2>This route is still off the pitch</h2>
        <img
          src={squintingGuy}
          alt="Confused reaction"
        />
        <div className="not-found-actions">
          <Button to="/">Back Home</Button>
        </div>
      </div>
    </PageShell>
  );
};

export default NotFound;
