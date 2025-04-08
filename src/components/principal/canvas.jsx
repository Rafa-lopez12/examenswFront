import React, { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import ShapeRect from '../Transformer/Shape';
import ContextMenuColor from '../colorPicker/MenuColor';
import useSocketConnection from '../../hooks/useSocket';

const Canvas = () => {
  const initialRectProps = {
    id: 'shape1',
    x: 100,
    y: 100,
    width: 120,
    height: 100,
    fill: '#00aaff',
  };

  const { shapeProps, emitUpdate } = useSocketConnection(
    'http://localhost:3000',
    initialRectProps.id,
    initialRectProps
  );

  const [isSelected, setIsSelected] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    setIsSelected(true);
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
    setContextMenu({ visible: true, x: mousePos.x, y: mousePos.y });
  };

  const handleColorChange = (e) => {
    emitUpdate({ fill: e.target.value });
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleClickOutside = () => {
    setIsSelected(false);
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <div>
      {contextMenu.visible && (
        <ContextMenuColor 
          x={contextMenu.x} 
          y={contextMenu.y} 
          fill={shapeProps.fill} 
          onChange={handleColorChange} 
        />
      )}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) handleClickOutside();
        }}
      >
        <Layer>
          <ShapeRect
            rectProps={shapeProps}
            isSelected={isSelected}
            setIsSelected={setIsSelected}
            onContextMenu={handleContextMenu}
            emitUpdate={emitUpdate}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;






