import { useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { withReact, Slate, Editable } from 'slate-react';
import '../../lib/slate-types';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Viewer with some read-only text' }],
  },
];

export const TextViewer = () => {
  const [editor] = useState(() => withReact(createEditor()));
  return (<Slate editor={editor} initialValue={initialValue}>
            <Editable readOnly={true} spellCheck={false} />
          </Slate>);
};