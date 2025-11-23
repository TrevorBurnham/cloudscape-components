import React from 'react';
import AppLayoutToolbar from '@cloudscape-design/components/app-layout/visual-refresh-toolbar';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';

export function App() {
  const [toolsOpen, setToolsOpen] = React.useState(false);

  const breadcrumbItems = [
    { text: 'Home', href: '#' },
    { text: 'Service', href: '#' },
    { text: 'Resource', href: '#' },
    { text: 'Current Page', href: '#' },
  ];

  const toolsContent = (
    <Container header={<Header variant="h2">Help panel</Header>}>
      <SpaceBetween size="l">
        <div>
          This is a help panel that provides additional information and documentation.
        </div>
        <div>
          You can include any content here to assist users with the current page or task.
        </div>
      </SpaceBetween>
    </Container>
  );

  const content = (
    <Container
      header={
        <Header
          variant="h1"
          description="This is a demo page to test AppLayout Toolbar SSR rendering"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>Secondary action</Button>
              <Button variant="primary">Primary action</Button>
            </SpaceBetween>
          }
        >
          AppLayout Toolbar SSR Demo
        </Header>
      }
    >
      <SpaceBetween size="l">
        <div>
          <h2>Testing SSR Rendering</h2>
          <p>
            This page demonstrates the AppLayout component with toolbar rendering in a server-side 
            rendering (SSR) environment. Check the page source to verify that the HTML is being 
            rendered on the server.
          </p>
        </div>
        <div>
          <h3>Key Features Being Tested:</h3>
          <ul>
            <li>Breadcrumb rendering in toolbar</li>
            <li>Navigation panel state</li>
            <li>Tools panel toggle</li>
            <li>Notifications display</li>
            <li>Overall layout structure</li>
          </ul>
        </div>
        <div>
          <h3>Visual Glitch Detection</h3>
          <p>
            Watch for any visual glitches or layout shifts during the initial render and hydration process.
            The toolbar should render correctly without any flickering or misalignment.
          </p>
        </div>
      </SpaceBetween>
    </Container>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <AppLayoutToolbar
        content={content}
        breadcrumbs={<BreadcrumbGroup items={breadcrumbItems} />}
        navigationHide={true}
        tools={toolsContent}
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
        placement={{
          insetBlockStart: 0,
          insetBlockEnd: 0,
        }}
        ariaLabels={{
          tools: 'Help panel',
          toolsClose: 'Close help panel',
          toolsToggle: 'Open help panel',
        }}
      />
    </div>
  );
}