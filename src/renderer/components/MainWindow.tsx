import { useState, useRef } from 'react';
import { TextEditor } from './TextEditor';
import { TextViewer } from './TextViewer';
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelGroupHandle } from 'react-resizable-panels';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';

export const MainWindow = () => {
  const defaultSizes = [15, 35, 35, 15];
  const sticky_threshold = 2;
  const center_x = 50;

  const [isLeftCollapsed, isRightCollapsed] = useState(false);
  const [isInStickyZone, setInStickyZone] = useState(false);
  const [getActiveHandleIndex, setActiveHandleIndex] = useState<number | undefined>();
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const handleLayoutReset = () => {
    panelGroupRef.current?.setLayout(defaultSizes);
  };

  const handleLayout = (sizes: number[]) => {
    const handleIndex = getActiveHandleIndex;
    if (handleIndex === undefined) return;

    const handlePosition = sizes.slice(0, handleIndex + 1).reduce((a, b) => a + b, 0);
    const distance = handlePosition - center_x;
    setInStickyZone(Math.abs(distance) < sticky_threshold);

    if (isInStickyZone) {
      sizes[handleIndex] -= distance;
      sizes[handleIndex + 1] += distance;
      panelGroupRef.current?.setLayout(sizes);
    }
  };

  const handleDragging = (isDragging: boolean, handleIndex: number) => {
    setActiveHandleIndex(isDragging ? handleIndex : undefined);
  };

  return (
    // <TextEditor />
    <div style={{ width: '100vw', height: '100vh' }}>
      <PanelGroup autoSaveId="layout" direction="horizontal" ref={panelGroupRef} onLayout={handleLayout}>
        <Panel id="left-left" collapsible={true} minSize={5} defaultSize={defaultSizes[0]} collapsedSize={2}>
          <span>Left Left</span>
          <button onClick={handleLayoutReset}>Reset Layout</button>
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel id="left-middle" collapsible={false} minSize={20} defaultSize={defaultSizes[1]}>
          <TextEditor />
        </Panel>
        <PanelResizeHandle className={`resize-handle ${getActiveHandleIndex === 1 && isInStickyZone ? 'sticky' : ''}`} onDragging={(dragging) => handleDragging(dragging, 1)} />
        <Panel id="right-middle" collapsible={false} minSize={20} defaultSize={defaultSizes[2]}>
          <TextViewer />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel id="right-right" collapsible={true} minSize={5} defaultSize={defaultSizes[3]} collapsedSize={2}>
          <span>Right Right</span>
        </Panel>
      </PanelGroup>
    </div>
  );
};