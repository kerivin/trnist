import { useState } from 'react';
import { createEditor, Descendant, Editor } from 'slate';
import { withReact, Slate, Editable } from 'slate-react';
import { withHistory } from 'slate-history';
import './slate-types';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Editor with some editable text' }],
  },
];

const TextEditor = ({ ...props }) => {
  const [editor] = useState(() => withReact(withHistory(createEditor())));
  editor.getChunkSize = node => (Editor.isEditor(node) ? 1000 : null);
  return (<Slate editor={editor} initialValue={initialValue}>
            <Editable {...props} style={{ ...props.style }} />
          </Slate>);
};

export default TextEditor;