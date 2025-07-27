import { useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { withReact, Slate, Editable } from 'slate-react';
import { withHistory } from 'slate-history';
import '../../lib/slate-types';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Editor with some editable text' }],
  },
];

export const TextEditor = () => {
  const [editor] = useState(() => withReact(withHistory(createEditor())));
  return (<Slate editor={editor} initialValue={initialValue}>
            <Editable />
          </Slate>);
};