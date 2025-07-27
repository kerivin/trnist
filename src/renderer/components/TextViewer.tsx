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

export const TextViewer = ({ ...props }) => {
  const [editor] = useState(() => withReact(createEditor()));
  return (<Slate editor={editor} initialValue={initialValue}>
            <Editable {...props} style={{ ...props.style }} className="direction-ltr" spellCheck={false} readOnly={true} />
          </Slate>);
};