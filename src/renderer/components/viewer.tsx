import { useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { withReact, Slate, Editable } from 'slate-react';
import './slate-types';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Viewer with some read-only text' }],
  },
];

const TextViewer = ({ ...props }) => {
  const [editor] = useState(() => withReact(createEditor()));
  return (<Slate editor={editor} initialValue={initialValue}>
            <Editable {...props} style={{ ...props.style }} spellCheck={false} readOnly={true} />
          </Slate>);
};

export default TextViewer;