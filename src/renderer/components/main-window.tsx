import Editor from './editor';
import Viewer from './viewer';
import MachineTranslation from './machine-translation';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { Action, Layout, Model, TabNode, IJsonModel, IJsonTabNode, TabSetNode, BorderNode, ITabSetRenderValues, Actions, DockLocation, AddIcon } from 'flexlayout-react';
import 'flexlayout-react/style/combined.css';  

const model_json: IJsonModel = {
  global: {
    enableEdgeDock: true,
    splitterEnableHandle: false,
    splitterSize: 2,
    splitterExtra: 5,
    tabDragSpeed: 0.1,
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
          name: "SPARE LEFT TAB",
          component: "placeholder",
          enableClose: true,
        },
      ]
    },
    {
      type: "border",
      location: "right",
      children: [
        {
          type: "tab",
          name: "SPARE RIGHT TAB",
          component: "placeholder",
          enableClose: true,
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
            name: "NOTES",
            component: "Editor",
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
            name: "EDITOR",
            component: "Editor",
            id: "Editor",
            enableClose: false,
          }
        ]
      },
      {
        type: "tabset",
        weight: 35,
        children: [
          {
            type: "tab",
            name: "VIEWER",
            component: "Viewer",
            id: "Viewer",
            enableClose: false,
          }
        ]
      },
      {
        type: "tabset",
        weight: 15,
        children: [
          {
            type: "tab",
            name: "MACHINE TRANSLATION",
            component: "MachineTranslation",
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
      case "Editor":
        return <Editor style={{
          height: '100%', outline: 'none', boxShadow: 'none', overflow: 'auto',
          boxSizing: 'border-box', lineHeight: '1.5rem'
        }} />;
      case "Viewer":
        return <Viewer style={{
          height: '100%', outline: 'none', boxShadow: 'none', overflow: 'auto',
          boxSizing: 'border-box', lineHeight: '1.5rem'
        }} />;
      case "MachineTranslation":
        return <MachineTranslation />;
      default:
        return <div>{"unknown component " + component}</div>
    }
  };

  return (<div className='layout_theme'><Layout model={model} factory={factory} realtimeResize={false} /></div>);
};