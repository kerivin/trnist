import * as React from 'react';
import { createRoot } from 'react-dom/client';

// Type-safe DOM element assertion
const rootElement = document.getElementById('root') as HTMLElement;

// Create root and render with TypeScript support
const root = createRoot(rootElement);
root.render(<h2>Hello from React!</h2>);