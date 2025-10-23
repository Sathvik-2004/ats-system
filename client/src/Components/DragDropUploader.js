import React, { useState, useRef, useEffect } from 'react';

const DragDropUploader = ({ 
  onFilesSelected, 
  acceptedTypes = ['.pdf', '.doc', '.docx'], 
  maxFileSize = 5, // MB
  maxFiles = 10,
  allowMultiple = true,
  existingFiles = []
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState(existingFiles);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFiles(existingFiles);
  }, [existingFiles]);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      errors.push(`${file.name}: File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      errors.push(`${file.name}: File size (${fileSizeMB.toFixed(1)}MB) exceeds limit of ${maxFileSize}MB`);
    }
    
    return errors;
  };

  const processFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const allErrors = [];
    const validFiles = [];

    // Check total file count
    if (!allowMultiple && newFiles.length > 1) {
      allErrors.push('Only one file is allowed');
      setErrors(allErrors);
      return;
    }

    if (files.length + newFiles.length > maxFiles) {
      allErrors.push(`Maximum ${maxFiles} files allowed. Currently have ${files.length} files.`);
    }

    newFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push({
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0
        });
      } else {
        allErrors.push(...fileErrors);
      }
    });

    setErrors(allErrors);

    if (validFiles.length > 0) {
      const updatedFiles = allowMultiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      
      if (onFilesSelected) {
        onFilesSelected(updatedFiles);
      }

      // Simulate upload progress
      validFiles.forEach(fileObj => {
        simulateUpload(fileObj.id);
      });
    }
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
        ));
      }
      
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress, status: progress === 100 ? 'completed' : 'uploading' } : f
      ));
    }, 200);
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    
    if (onFilesSelected) {
      onFilesSelected(updatedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    processFiles(selectedFiles);
    e.target.value = ''; // Reset input
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      zip: '📦',
      rar: '📦',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️'
    };
    return icons[extension] || '📁';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#6b7280',
      uploading: '#3b82f6',
      completed: '#10b981',
      error: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragOver ? '#eff6ff' : '#f9fafb',
          transition: 'all 0.2s ease',
          marginBottom: '20px'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {isDragOver ? '📂' : '📁'}
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '8px'
        }}>
          {isDragOver ? 'Drop files here' : 'Drop files or click to browse'}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '16px'
        }}>
          Supported formats: {acceptedTypes.join(', ')}
          <br />
          Maximum file size: {maxFileSize}MB
          {allowMultiple && ` • Maximum ${maxFiles} files`}
        </div>
        
        <button style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          📎 Select Files
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={allowMultiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Error Messages */}
      {errors.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            ⚠️ Upload Errors:
          </div>
          {errors.map((error, index) => (
            <div key={index} style={{
              color: '#7f1d1d',
              fontSize: '13px',
              marginBottom: '4px'
            }}>
              • {error}
            </div>
          ))}
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            📎 Uploaded Files ({files.length})
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {files.map((fileObj) => (
              <div key={fileObj.id} style={{
                padding: '16px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {/* File Icon */}
                <div style={{ fontSize: '24px' }}>
                  {getFileIcon(fileObj.name)}
                </div>
                
                {/* File Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {fileObj.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{formatFileSize(fileObj.size)}</span>
                    <span>•</span>
                    <span style={{ color: getStatusColor(fileObj.status) }}>
                      {fileObj.status === 'uploading' && `${Math.round(fileObj.progress)}% uploaded`}
                      {fileObj.status === 'completed' && '✅ Uploaded'}
                      {fileObj.status === 'pending' && '⏳ Pending'}
                      {fileObj.status === 'error' && '❌ Error'}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  {fileObj.status === 'uploading' && (
                    <div style={{
                      marginTop: '8px',
                      height: '4px',
                      background: '#e5e7eb',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                        width: `${fileObj.progress}%`,
                        transition: 'width 0.2s ease'
                      }} />
                    </div>
                  )}
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileObj.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fee2e2';
                    e.target.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropUploader;