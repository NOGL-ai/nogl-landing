"use client";

import React, { useState } from 'react';
import { FileUpload } from './file-upload';

// Test component to verify everything works
export const FileUploadTest: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    console.log('Files changed:', newFiles);
  };

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">FileUpload Component Test</h2>
      
      {/* Catalog Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Catalog Variant</h3>
        <FileUpload onFilesChange={handleFilesChange}>
          <FileUpload.DropZone variant="catalog">
            <FileUpload.Input accept="image/*" />
            <FileUpload.Content />
          </FileUpload.DropZone>
        </FileUpload>
      </div>

      {/* Dashboard Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dashboard Variant</h3>
        <FileUpload onFilesChange={handleFilesChange}>
          <FileUpload.DropZone variant="dashboard" size="sm">
            <FileUpload.Input accept="image/*" />
            <FileUpload.Content />
          </FileUpload.DropZone>
        </FileUpload>
      </div>

      {/* Modal Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Modal Variant</h3>
        <FileUpload onFilesChange={handleFilesChange}>
          <FileUpload.DropZone variant="modal" size="lg">
            <FileUpload.Input accept="image/*" />
            <FileUpload.Content />
          </FileUpload.DropZone>
        </FileUpload>
      </div>

      {/* Custom Variant */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Variant</h3>
        <FileUpload onFilesChange={handleFilesChange}>
          <FileUpload.DropZone 
            variant="custom" 
            className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center hover:border-blue-400"
          >
            <FileUpload.Input accept="image/*" />
            <FileUpload.Content>
              <div className="space-y-4">
                <div className="text-4xl">📁</div>
                <h4 className="text-lg font-semibold text-blue-700">Custom Upload Area</h4>
                <p className="text-blue-600">Click or drag files here</p>
              </div>
            </FileUpload.Content>
          </FileUpload.DropZone>
        </FileUpload>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Uploaded Files ({files.length})</h3>
          <FileUpload>
            <FileUpload.List>
              {files.map((file, index) => (
                <FileUpload.Item key={index} file={file} index={index} />
              ))}
            </FileUpload.List>
          </FileUpload>
        </div>
      )}
    </div>
  );
};