import TextEditor from './text-editor';
import TextViewer from './text-viewer';
import PdfViewer from './pdf-viewer';
import MachineTranslation from './machine-translation';
import 'flexlayout-react/style/combined.css';
import * as FlexLayout from 'flexlayout-react';

const model_json: FlexLayout.IJsonModel = {
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
            component: "TextEditor",
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
            component: "TextEditor",
            id: "TextEditor",
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
            component: "TextViewer",
            id: "TextViewer",
            enableClose: false,
          },
          {
            type: "tab",
            name: "PDF VIEWER",
            component: "PdfViewer",
            id: "PdfViewer",
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

const model = FlexLayout.Model.fromJson(model_json);

export const MainWindow = () => {

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case "TextEditor":
        return <TextEditor style={{
          height: '100%', outline: 'none', boxShadow: 'none', overflow: 'auto',
          boxSizing: 'border-box', lineHeight: '1.5rem'
        }} />;
      case "TextViewer":
        return <TextViewer style={{
          height: '100%', outline: 'none', boxShadow: 'none', overflow: 'auto',
          boxSizing: 'border-box', lineHeight: '1.5rem'
        }} />;
      case "PdfViewer":
        return <PdfViewer url={""} scale={ 1 }/>;
      case "MachineTranslation":
        return <MachineTranslation />;
      default:
        return <div>{"unknown component " + component}</div>
    }
  };

  return (<div className='layout_theme'><FlexLayout.Layout model={model} factory={factory} realtimeResize={false} /></div>);
};