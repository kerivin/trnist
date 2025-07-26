import React, { useState } from 'react';
import { createEditor, BaseEditor, Descendant } from 'slate';
import { withReact, Slate, Editable, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type ParagraphElement = {
  type: 'paragraph'
  children: CustomText[]
};

export type HeadingElement = {
  type: 'heading'
  level: number
  children: CustomText[]
};

export type CustomElement = ParagraphElement | HeadingElement;

export type FormattedText = { text: string; bold?: true };

export type CustomText = FormattedText;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
};

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

export const Editor = () => {
  const [editor] = useState(() => withReact(withHistory(createEditor())));
  return (<Slate editor={editor} initialValue={initialValue}>
            <Editable />
          </Slate>);
};