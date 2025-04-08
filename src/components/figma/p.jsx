import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import io from 'socket.io-client';

const Canvass = () => {
  const [socket, setSocket] = useState(null);
  const rectRef = useRef(null);
  const transformerRef = useRef(null);
  const [isSelected, setIsSelected] = useState(false);

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [rectProps, setRectProps] = useState({
    id: 'shape1',
    x: 100,
    y: 100,
    width: 120,
    height: 100,
    fill: '#00aaff',
  });

  useEffect(() => {
    const socketIo = io('http://localhost:3000');
    setSocket(socketIo);

    socketIo.on('updateShape', (data) => {
      if (data.id === rectProps.id) {
        setRectProps(data);
      }
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isSelected && transformerRef.current && rectRef.current) {
      transformerRef.current.nodes([rectRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const emitUpdate = (updatedProps) => {
    const newShape = { ...rectProps, ...updatedProps };
    setRectProps(newShape);
    if (socket) socket.emit('moveShape', newShape);
  };

  const handleDragMove = (e) => {
    const { x, y } = e.target.position();
    emitUpdate({ x, y });
  };

  const handleTransformEnd = () => {
    const node = rectRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    emitUpdate({
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    });
  };

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
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '6px',
            zIndex: 10,
          }}
        >
          <label style={{ fontSize: '12px' }}>Cambiar color:</label>
          <input
            type="color"
            value={rectProps.fill}
            onChange={handleColorChange}
            style={{ marginLeft: '5px' }}
          />
        </div>
      )}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) handleClickOutside();
        }}
      >
        <Layer>
          <Rect
            ref={rectRef}
            {...rectProps}
            draggable
            onClick={() => setIsSelected(true)}
            onContextMenu={handleContextMenu}
            onDragMove={handleDragMove}
            onTransformEnd={handleTransformEnd}
          />
          {isSelected && (
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvass;