import { Editor } from './components/Editor';

export default function App() {
  return(
    <div style={{ padding: '20px' }}>
      <h1>Slate</h1>
      <div style={{ border: '1px solid #ccc', padding: '10px', minHeight: '200px' }}>
        <Editor />
      </div>
    </div>
  );
}