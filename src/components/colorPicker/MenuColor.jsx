import React from 'react';

const ContextMenuColor = ({ x, y, fill, onChange }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
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
        value={fill}
        onChange={onChange}
        style={{ marginLeft: '5px' }}
      />
    </div>
  );
};

export default ContextMenuColor;