/**
 * FileUpload Component
 * Drag & drop file upload with progress tracking
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete?: (storageId: string, metadata: FileMetadata) => void;
  onUploadError?: (error: string) => void;
  bucket?: string;
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  disabled?: boolean;
}

interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  bucket: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  storageId?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  bucket = 'general',
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `Dosya boyutu ${(maxSize / (1024 * 1024)).toFixed(1)}MB'dan küçük olmalıdır`;
      }
      return null;
    },
    [maxSize]
  );

  const uploadFile = async (file: File) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadingFiles((prev) => [
        ...prev,
        {
          file,
          progress: 0,
          status: 'error',
          error: validationError,
        },
      ]);
      onUploadError?.(validationError);
      return;
    }

    // Add to uploading files
    setUploadingFiles((prev) => [
      ...prev,
      {
        file,
        progress: 0,
        status: 'uploading',
      },
    ]);

    try {
      // Step 1: Get upload URL
      const urlResponse = await fetch('/api/upload', {
        method: 'POST',
      });

      if (!urlResponse.ok) {
        throw new Error('Upload URL alınamadı');
      }

      const { uploadUrl } = await urlResponse.json();

      // Step 2: Upload file to Convex
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Dosya yüklenemedi');
      }

      const { storageId } = await uploadResponse.json();

      // Step 3: Store metadata
      const metadata: FileMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket,
      };

      // Update progress to 100%
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.name ? { ...f, progress: 100, status: 'success', storageId } : f
        )
      );

      onUploadComplete?.(storageId, metadata);

      // Remove from list after 3 seconds
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.file.name !== file.name));
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.name ? { ...f, status: 'error', error: errorMessage } : f
        )
      );

      onUploadError?.(errorMessage);
    }
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const fileArray = Array.from(files);

      if (!multiple && fileArray.length > 1) {
        onUploadError?.('Tek dosya yükleyebilirsiniz');
        return;
      }

      fileArray.forEach((file) => uploadFile(file));
    },
    [disabled, multiple, onUploadError, uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback((fileName: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file.name !== fileName));
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          {multiple
            ? 'Dosyaları buraya sürükleyin veya tıklayın'
            : 'Dosyayı buraya sürükleyin veya tıklayın'}
        </p>
        <p className="text-xs text-gray-500">Maksimum dosya boyutu: {formatFileSize(maxSize)}</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={`${uploadingFile.file.name}-${index}`} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <File className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {uploadingFile.status === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {uploadingFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadingFile.file.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>

                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} className="h-2" />
                  )}

                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                  )}

                  {uploadingFile.status === 'success' && (
                    <p className="text-xs text-green-500 mt-1">Yükleme tamamlandı</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
