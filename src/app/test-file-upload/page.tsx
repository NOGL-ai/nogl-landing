"use client";

import React, { useState } from 'react';
import { FileUpload } from '@/components/application/file-upload';
import { UploadCloud02 } from '@untitledui/icons';

export default function TestFileUploadPage() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    console.log('Files changed:', newFiles);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-foreground">FileUpload Component Test</h1>
        
        {/* Test 1: Catalog Variant with Default Content */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Test 1: Catalog Variant (Default Content)</h2>
          <FileUpload onFilesChange={handleFilesChange}>
            <FileUpload.DropZone variant="catalog">
              <FileUpload.Input accept="image/*" />
              <FileUpload.Content />
            </FileUpload.DropZone>
          </FileUpload>
        </div>

        {/* Test 2: Catalog Variant with Custom Content */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Test 2: Catalog Variant (Custom Content)</h2>
          <FileUpload onFilesChange={handleFilesChange}>
            <FileUpload.DropZone variant="catalog">
              <FileUpload.Input accept="image/*" />
              <FileUpload.Content>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-secondary bg-background shadow-sm">
                    <UploadCloud02 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col items-center gap-1 self-stretch">
                    <div className="flex items-start justify-center gap-1 self-stretch text-center">
                      <FileUpload.Button
                        className="text-sm font-semibold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring/40 rounded"
                        aria-label="Click to upload files"
                      >
                        Click to upload
                      </FileUpload.Button>
                      <span className="text-sm font-normal text-muted-foreground">or drag and drop</span>
                    </div>
                    <p className="self-stretch text-center text-xs font-normal leading-[18px] text-muted-foreground">
                      SVG, PNG, JPG or GIF (max. 800x400px)
                    </p>
                  </div>
                </div>
              </FileUpload.Content>
            </FileUpload.DropZone>
          </FileUpload>
        </div>

        {/* Test 3: Dashboard Variant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Test 3: Dashboard Variant</h2>
          <FileUpload onFilesChange={handleFilesChange}>
            <FileUpload.DropZone variant="dashboard" size="sm">
              <FileUpload.Input accept="image/*" />
              <FileUpload.Content />
            </FileUpload.DropZone>
          </FileUpload>
        </div>

        {/* Test 4: Modal Variant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Test 4: Modal Variant</h2>
          <FileUpload onFilesChange={handleFilesChange}>
            <FileUpload.DropZone variant="modal" size="lg">
              <FileUpload.Input accept="image/*" />
              <FileUpload.Content />
            </FileUpload.DropZone>
          </FileUpload>
        </div>

        {/* Test 5: Custom Variant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Test 5: Custom Variant</h2>
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
                  <FileUpload.Button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Choose Files
                  </FileUpload.Button>
                  <p className="text-blue-600">or drag and drop files here</p>
                </div>
              </FileUpload.Content>
            </FileUpload.DropZone>
          </FileUpload>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Uploaded Files ({files.length})</h2>
            <FileUpload>
              <FileUpload.List>
                {files.map((file, index) => (
                  <FileUpload.Item key={index} file={file} index={index} />
                ))}
              </FileUpload.List>
            </FileUpload>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <pre className="text-sm text-muted-foreground">
            {JSON.stringify(files.map(f => ({ name: f.name, size: f.size, type: f.type })), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}