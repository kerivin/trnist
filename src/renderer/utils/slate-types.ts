import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean
};

export type ParagraphElement = {
  type: 'paragraph'
  children: CustomText[]
};

export type HeadingElement = {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: CustomText[]
};

export type CustomElement = ParagraphElement | HeadingElement;

export type CustomText = FormattedText;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
};