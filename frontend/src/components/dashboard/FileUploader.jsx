import React, { useState } from 'react';

const ALLOWED_TYPES = {
  'application/pdf': 'PDF',
  'text/markdown': 'Markdown',
  'text/plain': 'Text',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
};

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function FileUploader({ onFilesChange }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleFiles = (newFiles) => {
    const valid = newFiles.filter((f) => {
      const allowed = ALLOWED_TYPES[f.type] || 
        f.name.endsWith('.md') || 
        f.name.endsWith('.txt') || 
        f.name.endsWith('.zip');
      const smallEnough = f.size <= MAX_SIZE;
      return allowed && smallEnough;
    });

    const updated = [...files, ...valid];
    setFiles(updated);
    onFilesChange(updated);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    onFilesChange(updated);
  };

  const getTypeName = (f) => {
    return ALLOWED_TYPES[f.type] || f.name.split('.').pop().toUpperCase();
  };

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: 'relative' }}
    >
      <input
        type="file"
        multiple
        accept=".pdf,.md,.txt,.png,.jpg,.webp,.zip"
        onChange={handleFileInput}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
      />
      <div className="dropzone-content">
        <span className="dropzone-icon">⬆</span>
        <p>Drag & drop mockup specifications or assets here</p>
        <p className="dropzone-sub">PDF · MD · TXT · PNG · JPG · WebP · ZIP — max 20MB total</p>
        <button className="btn-outline-sm" type="button" style={{ pointerEvents: 'none' }}>
          Browse Files
        </button>
      </div>

      {files.length > 0 && (
        <div className="file-list" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 10 }}>
          {files.map((f, i) => (
            <div key={i} className="file-chip">
              <span className="file-type-badge">{getTypeName(f)}</span>
              <span className="file-name">{f.name}</span>
              <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
              <button 
                onClick={() => removeFile(i)} 
                type="button" 
                className="btn-remove-file"
                aria-label="Remove File"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
