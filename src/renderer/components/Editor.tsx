// import { useState, useMemo } from 'react';
// import { createEditor, Descendant } from 'slate';
// import { Slate, Editable, withReact } from 'slate-react';

// const initialValue: Descendant[] = [
//   {
//     type: 'paragraph',
//     children: [{ text: 'A line of text in a paragraph.' }],
//   },
// ];

// export const Editor = () => {
//   const [editor] = useState(() => withReact(createEditor()));
  
//   return (
//     <Slate editor={editor} initialValue={initialValue}>
//       <Editable />
//     </Slate>
//   );
// };


import React, { useState } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

type CustomElement = { type: 'paragraph'; children: CustomText[] };
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
};

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

export const Editor = () => {
    const [editor] = useState(() => withReact(createEditor()));
    return (<Slate editor={editor} initialValue={initialValue}>
        <Editable />
    </Slate>);
};