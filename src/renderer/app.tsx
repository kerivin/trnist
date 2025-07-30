import './index.css';
import { createRoot } from 'react-dom/client';
import { MainWindow } from './components/main-window';

export default function App() {
  return(<MainWindow />);
}

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);
root.render(<App />);