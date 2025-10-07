"use client";

import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';
import { cn } from '@/utils/cx';

// Context for shared state
interface FileUploadContextType {
  files: File[];
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const FileUploadContext = createContext<FileUploadContextType | null>(null);

const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUpload.Root');
  }
  return context;
};

// Root component - provides context
interface FileUploadRootProps {
  children: ReactNode;
  onFilesChange?: (files: File[]) => void;
}

const FileUploadRoot: React.FC<FileUploadRootProps> = ({ 
  children, 
  onFilesChange 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: File[]) => {
    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      onFilesChange?.(updated);
      return updated;
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesChange?.(updated);
      return updated;
    });
  };

  return (
    <FileUploadContext.Provider 
      value={{ 
        files, 
        addFiles, 
        removeFile, 
        inputRef, 
        isDragging, 
        setIsDragging 
      }}
    >
      {children}
    </FileUploadContext.Provider>
  );
};

// DropZone component with variants
interface FileUploadDropZoneProps {
  variant?: 'catalog' | 'dashboard' | 'modal' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFilesSelected?: (files: FileList) => void;
  onDropFiles?: (files: FileList) => void;
  onDropUnacceptedFiles?: (files: FileList) => void;
  onSizeLimitExceed?: (files: FileList) => void;
}

const FileUploadDropZone: React.FC<FileUploadDropZoneProps> = ({
  variant = 'custom',
  size = 'md',
  className = '',
  children,
  accept = "image/*",
  multiple = true,
  maxSize,
  onFilesSelected,
  onDropFiles,
  onDropUnacceptedFiles,
  onSizeLimitExceed,
  ...props
}) => {
  const { addFiles, isDragging, setIsDragging } = useFileUpload();

  // Variant styles
  const variants = {
    catalog: {
      container: "rounded-xl border-2 border-primary bg-background p-4 md:p-6 transition-colors hover:border-primary/80 focus-within:border-primary",
    },
    dashboard: {
      container: "rounded-lg border border-border-secondary bg-card p-3 transition-colors hover:border-primary/50",
    },
    modal: {
      container: "rounded-lg border-2 border-dashed border-border-primary bg-muted/50 p-6 transition-colors hover:border-primary/50",
    },
    custom: {
      container: "",
    }
  };

  const sizes = {
    sm: "p-2 text-xs",
    md: "p-4 text-sm",
    lg: "p-6 text-base"
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFiles = (files: File[]) => {
    const acceptedFiles: File[] = [];
    const unacceptedFiles: File[] = [];
    const oversizedFiles: File[] = [];

    files.forEach((file) => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        oversizedFiles.push(file);
        return;
      }

      // Check file type
      if (accept && !isFileTypeAccepted(file, accept)) {
        unacceptedFiles.push(file);
        return;
      }

      acceptedFiles.push(file);
    });

    // Handle different file categories
    if (oversizedFiles.length > 0 && onSizeLimitExceed) {
      const dataTransfer = new DataTransfer();
      oversizedFiles.forEach((file) => dataTransfer.items.add(file));
      onSizeLimitExceed(dataTransfer.files);
    }

    if (acceptedFiles.length > 0) {
      addFiles(acceptedFiles);
      if (onDropFiles) {
        const dataTransfer = new DataTransfer();
        acceptedFiles.forEach((file) => dataTransfer.items.add(file));
        onDropFiles(dataTransfer.files);
      }
    }

    if (unacceptedFiles.length > 0 && onDropUnacceptedFiles) {
      const dataTransfer = new DataTransfer();
      unacceptedFiles.forEach((file) => dataTransfer.items.add(file));
      onDropUnacceptedFiles(dataTransfer.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const isFileTypeAccepted = (file: File, accept: string): boolean => {
    if (!accept) return true;
    
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    
    return acceptedTypes.some((acceptedType) => {
      if (acceptedType.startsWith(".")) {
        const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        return extension === acceptedType.toLowerCase();
      }
      
      if (acceptedType.endsWith("/*")) {
        const typePrefix = acceptedType.split("/")[0];
        return file.type.startsWith(`${typePrefix}/`);
      }
      
      return file.type === acceptedType;
    });
  };

  const containerClasses = cn(
    variants[variant].container,
    sizes[size],
    isDragging && "border-primary/60 bg-primary/5",
    className
  );

  return (
    <section
      className={containerClasses}
      onDragOver={handleDragIn}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDrop={handleDrop}
      {...props}
    >
      {children}
    </section>
  );
};

// Input component
interface FileUploadInputProps {
  accept?: string;
  multiple?: boolean;
  className?: string;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({
  accept = "image/*",
  multiple = true,
  className = "sr-only"
}) => {
  const { inputRef, addFiles } = useFileUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  return (
    <input
      ref={inputRef}
      type="file"
      className={className}
      accept={accept}
      multiple={multiple}
      onChange={handleFileChange}
    />
  );
};

// Content component
interface FileUploadContentProps {
  variant?: 'catalog' | 'dashboard' | 'modal' | 'custom';
  className?: string;
  children?: ReactNode;
}

const FileUploadContent: React.FC<FileUploadContentProps> = ({
  variant = 'custom',
  className = '',
  children
}) => {
  const { inputRef } = useFileUpload();

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  if (children) {
    return <div className={className}>{children}</div>;
  }

  // Default content based on variant
  const defaultContent = {
    catalog: (
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-secondary bg-background shadow-sm">
          <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1 self-stretch">
          <div className="flex items-start justify-center gap-1 self-stretch text-center">
            <button
              onClick={handleButtonClick}
              className="text-sm font-semibold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring/40 rounded"
              aria-label="Click to upload files"
            >
              Click to upload
            </button>
            <span className="text-sm font-normal text-muted-foreground">or drag and drop</span>
          </div>
          <p className="self-stretch text-center text-xs font-normal leading-[18px] text-muted-foreground">
            SVG, PNG, JPG or GIF (max. 800x400px)
          </p>
        </div>
      </div>
    ),
    dashboard: (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <button
            onClick={handleButtonClick}
            className="text-xs font-medium text-foreground hover:text-primary"
          >
            Upload Files
          </button>
          <p className="text-xs text-muted-foreground">Drag & drop or click</p>
        </div>
      </div>
    ),
    modal: (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div className="text-center">
          <button
            onClick={handleButtonClick}
            className="text-sm font-semibold text-primary hover:text-primary/80"
          >
            Choose Files
          </button>
          <p className="text-sm text-muted-foreground mt-1">or drag and drop files here</p>
        </div>
      </div>
    ),
    custom: null
  };

  return (
    <div className={className}>
      {defaultContent[variant] || children}
    </div>
  );
};

// List component
interface FileUploadListProps {
  className?: string;
  children: ReactNode;
}

const FileUploadList: React.FC<FileUploadListProps> = ({
  className = "space-y-2",
  children
}) => {
  return <div className={className}>{children}</div>;
};

// Item component
interface FileUploadItemProps {
  file: File;
  index: number;
  className?: string;
  onDelete?: (index: number) => void;
}

const FileUploadItem: React.FC<FileUploadItemProps> = ({
  file,
  index,
  className = "flex items-center justify-between rounded-lg border border-border-secondary bg-background p-3",
  onDelete
}) => {
  const { removeFile } = useFileUpload();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(index);
    } else {
      removeFile(index);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";
    const suffixes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.floor(bytes / Math.pow(1024, i)) + " " + suffixes[i];
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Remove
      </button>
    </div>
  );
};

// Button component that automatically connects to file input
interface FileUploadButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  children,
  className = "",
  onClick,
  ...props
}) => {
  const { inputRef } = useFileUpload();

  const handleClick = () => {
    inputRef.current?.click();
    onClick?.();
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Export compound component
export const FileUpload = {
  Root: FileUploadRoot,
  DropZone: FileUploadDropZone,
  Input: FileUploadInput,
  Content: FileUploadContent,
  List: FileUploadList,
  Item: FileUploadItem,
  Button: FileUploadButton,
};

// Export hook for advanced usage
export { useFileUpload };