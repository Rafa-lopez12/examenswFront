import React, { useEffect, useRef } from 'react';
import { Rect, Transformer } from 'react-konva';

const Shape = ({ rectProps, isSelected, setIsSelected, onContextMenu, emitUpdate }) => {
  const rectRef = useRef(null);
  const transformerRef = useRef(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && rectRef.current) {
      transformerRef.current.nodes([rectRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

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

  return (
    <>
      <Rect
        ref={rectRef}
        {...rectProps}
        draggable
        onClick={() => setIsSelected(true)}
        onContextMenu={onContextMenu}
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
    </>
  );
};

export default Shape;