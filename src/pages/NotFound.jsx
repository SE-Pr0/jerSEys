import React from 'react';
import { Button, PageHeader, PageShell, StateBlock } from '../components/ui';

const NotFound = () => {
  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="404"
        title="Page Not Found"
        description="The shared foundation is ready, but this route does not exist yet."
      />
      <StateBlock
        centered
        icon="?"
        title="This route is still off the pitch"
        description="Use the shared page shell, page header, buttons, cards, and form patterns when new pages are added so the app stays visually consistent."
        actions={[
          <Button key="home" to="/">
            Back Home
          </Button>,
        ]}
      />
    </PageShell>
  );
};

export default NotFound;
