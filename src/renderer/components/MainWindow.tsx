import { useState, useRef } from 'react';
import { TextEditor } from './TextEditor';
import { TextViewer } from './TextViewer';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { Action, Layout, Model, TabNode, IJsonModel, IJsonTabNode, TabSetNode, BorderNode, ITabSetRenderValues, Actions, DockLocation, AddIcon } from 'flexlayout-react';
import 'flexlayout-react/style/rounded.css';  

const model_json: IJsonModel = {
  global: {
    enableEdgeDock: true,
    splitterEnableHandle: false,
    splitterSize: 15,
    splitterExtra: 2,
    tabDragSpeed: 0.05,
    tabEnableRename: false,
    tabEnablePopout: false,
    tabMinWidth: 50,
    tabMinHeight: 50,
    tabEnableDrag: true,
    tabSetEnableDrag: true,
    tabSetEnableDrop: true,
  },
  borders: [
    {
      type: "border",
      location: "left",
      children: [
        {
          type: "tab",
          name: "Spare Left Tab",
          component: "placeholder",
          enableClose: false,
        },
      ]
    },
    {
      type: "border",
      location: "right",
      children: [
        {
          type: "tab",
          name: "Spare Right Tab",
          component: "placeholder",
          enableClose: false,
        },
      ]
    },
  ],
  layout: {
    type: "row",
    id: "Row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 15,
        children: [
          {
            type: "tab",
            name: "Notes",
            component: "placeholder",
            id: "Notes",
          }
        ]
      },
      {
        type: "tabset",
        weight: 35,
        children: [
          {
            type: "tab",
            name: "Editor",
            component: "TextEditor",
            id: "TextEditor"
          }
        ]
      },
      {
        type: "tabset",
        weight: 35,
        children: [
          {
            type: "tab",
            name: "Viewer",
            component: "TextViewer",
            id: "TextViewer"
          }
        ]
      },
      {
        type: "tabset",
        weight: 15,
        children: [
          {
            type: "tab",
            name: "Machine Translation",
            component: "placeholder",
            id: "MachineTranslation",
          }
        ]
      }
    ]
  }
};

const model = Model.fromJson(model_json);

export const MainWindow = () => {

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case "TextEditor":
        return <TextEditor style={{ height: '100%', outline: 'none', boxShadow: 'none', overflow: 'auto', boxSizing: 'border-box', lineHeight: '1.5rem', marginRight: '-0.5rem' }} />;
      case "TextViewer":
        return <TextViewer style={{ height: '100%', outline: 'none', boxShadow: 'none', overflow: 'auto', boxSizing: 'border-box', lineHeight: '1.5rem' }} />;
        default:
          return <div>{"unknown component " + component}</div>
    }
  };

  return(<Layout model={model} factory={factory} realtimeResize={false} />);
};