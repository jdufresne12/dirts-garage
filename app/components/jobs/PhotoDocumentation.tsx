import React, { useState, useRef, useEffect } from 'react';
import { Plus, Camera, X, ChevronLeft, ChevronRight, Trash2, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Photo {
    id: string;
    fileName: string;
    contentType: string;
    fileKey: string;
    size?: number;
}

const S3_BASE_URL = 'https://dirts-garage.s3.us-east-1.amazonaws.com';
// Custom loader for S3
const s3Loader = ({ src, width, quality }: any) => {
    return `${S3_BASE_URL}/${src}?w=${width}&q=${quality || 75}`
}

interface PhotoDocumentationProps {
    job_id: string;
}

export default function PhotoDocumentation({ job_id }: PhotoDocumentationProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [longPressedPhoto, setLongPressedPhoto] = useState<string | null>(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load existing media on component mount
    useEffect(() => {
        if (job_id) {
            loadMedia();
        } else {
            console.error('job_id is undefined, cannot load media');
            setLoading(false);
        }
    }, [job_id]);

    // Handle keyboard navigation in lightbox
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (selectedPhotoIndex === null) return;

            switch (event.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    navigatePhoto('prev');
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    navigatePhoto('next');
                    break;
            }
        };

        if (selectedPhotoIndex !== null) {
            document.addEventListener('keydown', handleKeyPress);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'unset';
        };
    }, [selectedPhotoIndex]);

    const loadMedia = async () => {
        try {
            const response = await fetch(`/api/media/${job_id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const formattedPhotos = data.media.map((item: any) => ({
                        id: item.id,
                        fileName: item.fileName,
                        contentType: item.contentType,
                        fileKey: item.fileKey,
                        size: 0 // We don't have size from the API response
                    }));
                    setPhotos(formattedPhotos);
                }
            } else {
                console.error('Failed to load media, response status:', response.status);
            }
        } catch (error) {
            console.error('Failed to load media:', error);
        } finally {
            setLoading(false);
        }
    };

    const uploadToApi = async (file: File): Promise<Photo> => {
        if (!job_id) {
            throw new Error('Job ID is required but not provided');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('job_id', job_id);

        const response = await fetch('/api/media/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Upload failed');
        }

        return {
            id: data.media.id,
            fileName: data.media.fileName,
            contentType: data.media.contentType,
            fileKey: data.media.fileKey,
            size: data.media.size
        };
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const validFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/') || file.type.startsWith('video/')
        );

        if (validFiles.length === 0) {
            alert('Please select valid image or video files.');
            return;
        }

        setUploading(true);

        // Process files concurrently
        const uploadPromises = validFiles.map(async (file) => {
            const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

            // Add to uploading set
            setUploadingFiles(prev => new Set(prev).add(tempId));

            try {
                // Upload to API
                const newPhoto = await uploadToApi(file);

                // Add photo to state
                setPhotos(prev => [...prev, newPhoto]);

                // Remove from uploading set
                setUploadingFiles(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(tempId);
                    return newSet;
                });

                return newPhoto;

            } catch (error) {
                console.error('Upload failed:', error);
                alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);

                // Remove from uploading set on error
                setUploadingFiles(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(tempId);
                    return newSet;
                });

                return null;
            }
        });

        await Promise.all(uploadPromises);
        setUploading(false);

        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const deletePhoto = async (photoId: string) => {
        // Show confirmation dialog
        const confirmDelete = window.confirm('Are you sure you want to delete this media? This action cannot be undone.');

        if (!confirmDelete) {
            return;
        }

        try {
            console.log('Attempting to delete photo with ID:', photoId);

            const response = await fetch('/api/media/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mediaId: photoId }),
            });

            const data = await response.json();
            console.log('Delete response:', data);

            if (response.ok && data.success) {
                // Remove photo from state
                setPhotos(prev => prev.filter(p => p.id !== photoId));

                // Close modal if deleted photo was selected
                if (selectedPhotoIndex !== null && photos[selectedPhotoIndex]?.id === photoId) {
                    setSelectedPhotoIndex(null);
                }

                console.log('Photo deleted successfully');
            } else {
                console.error('Delete failed:', data);
                alert('Failed to delete media: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Delete failed with error:', error);
            alert('Failed to delete media. Please try again.');
        }
    };

    const openLightbox = (index: number) => {
        setSelectedPhotoIndex(index);
    };

    const closeLightbox = () => {
        setSelectedPhotoIndex(null);
    };

    const navigatePhoto = (direction: 'prev' | 'next') => {
        if (selectedPhotoIndex === null) return;

        if (direction === 'prev') {
            setSelectedPhotoIndex(selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1);
        } else {
            setSelectedPhotoIndex(selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1);
        }
    };

    // Long press handlers
    const handleTouchStart = (photoId: string) => {
        longPressTimeoutRef.current = setTimeout(() => {
            setLongPressedPhoto(longPressedPhoto === photoId ? null : photoId);
            // Add haptic feedback if available
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        }, 500); // 500ms for long press
    };

    const handleTouchEnd = () => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    };

    const handleTouchMove = () => {
        // Cancel long press if user moves finger
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isVideo = (type: string) => type.startsWith('video/');

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="size-8 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">Photo & Video Documentation</h2>
                        {photos.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                {photos.length} file{photos.length !== 1 ? 's' : ''} uploaded
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 -mb-4">
                        {/* Toggle delete mode on mobile */}
                        {photos.length > 0 && (
                            <>
                                <button
                                    onClick={() => setDeleteMode(!deleteMode)}
                                    className="sm:hidden flex items-center gap-2 px-3 py-1 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                                >
                                    {deleteMode ? 'Done' : 'Edit'}
                                </button>
                            </>

                        )}

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {uploading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Upload className="size-4" />
                            )}
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>

                {/* Instructions for mobile */}
                {photos.length > 0 && (
                    <div className="sm:hidden mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                            {deleteMode
                                ? 'Tap the X button to delete photos. Tap "Done" when finished.'
                                : 'Tap "Edit" to delete photos, or hold and press on a photo for quick delete.'
                            }
                        </p>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {/* Photos Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {/* Uploaded Photos */}
                    {photos.map((photo, index) => (
                        <div
                            key={photo.id}
                            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                            onClick={() => !deleteMode && openLightbox(index)}
                            onTouchStart={() => !deleteMode && handleTouchStart(photo.id)}
                            onTouchEnd={handleTouchEnd}
                            onTouchMove={handleTouchMove}
                        >
                            {isVideo(photo.contentType) ? (
                                <video
                                    src={`${S3_BASE_URL}/${photo.fileKey}`}
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                    onError={(e) => console.error('Video load error:', e.currentTarget.src)}
                                />
                            ) : (
                                <Image
                                    loader={s3Loader}
                                    src={photo.fileKey}
                                    alt={photo.fileName}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    onError={(e) => {
                                        console.error('Next.js Image error:', e);
                                    }}
                                    onLoad={() => {
                                        console.log('Next.js Image loaded:', photo.fileName);
                                    }}
                                    priority
                                />
                            )}

                            {/* Desktop hover overlay */}
                            <div className="hidden sm:block absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-all duration-200 pointer-events-none"></div>

                            {/* Desktop file info overlay */}
                            <div className="hidden sm:block absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <p className="text-xs truncate font-medium">{photo.fileName}</p>
                                {photo.size && (
                                    <p className="text-xs opacity-75">{formatFileSize(photo.size)}</p>
                                )}
                            </div>

                            {/* Desktop delete button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deletePhoto(photo.id);
                                }}
                                className="hidden sm:block absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                            >
                                <Trash2 className="size-3" />
                            </button>

                            {/* Mobile delete button - show when in delete mode or after long press */}
                            {(deleteMode || longPressedPhoto === photo.id) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletePhoto(photo.id);
                                        setLongPressedPhoto(null);
                                    }}
                                    className="sm:hidden absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg animate-in fade-in-0 zoom-in-75 duration-200"
                                >
                                    <X className="size-4" />
                                </button>
                            )}

                            {/* Mobile file info - always visible */}
                            <div className="sm:hidden absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-xs text-white truncate font-medium">{photo.fileName}</p>
                            </div>

                            {/* Video indicator */}
                            {isVideo(photo.contentType) && (
                                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded text-xs">
                                    Video
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Uploading placeholders */}
                    {Array.from(uploadingFiles).map((id) => (
                        <div key={id} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="size-8 text-gray-400 mx-auto mb-2 animate-spin" />
                                <span className="text-xs text-gray-500">Uploading...</span>
                            </div>
                        </div>
                    ))}

                    {/* Add Photo Button */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                        <div className="text-center">
                            <Plus className="size-6 sm:size-8 text-gray-400 mx-auto mb-1 sm:mb-2" />
                            <span className="text-xs text-gray-500">Add Media</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Improved Lightbox Modal */}
            {selectedPhotoIndex !== null && (
                <div className="fixed inset-0 z-50">
                    {/* Background overlay - separate from content */}
                    <div
                        className="absolute inset-0 bg-black opacity-80"
                        onClick={closeLightbox}
                    />

                    {/* Content container - no opacity inheritance */}
                    <div className="relative z-10 h-full">
                        {/* Top Controls Bar */}
                        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4 sm:p-6">
                            <div className="flex items-center justify-between text-white">
                                {/* Image counter */}
                                <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <span className="text-sm font-medium">
                                        {selectedPhotoIndex + 1} of {photos.length}
                                    </span>
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={closeLightbox}
                                    className="bg-white/30 backdrop-blur-sm p-2 rounded-full hover:bg-black/50 transition-colors"
                                >
                                    <X className="size-6" />
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area with proper padding for controls */}
                        <div className="flex items-center justify-center h-full px-4 pt-20 pb-20 sm:px-6 ">
                            {/* Navigation buttons - positioned outside content area */}
                            {photos.length > 1 && (
                                <>
                                    <button
                                        onClick={() => navigatePhoto('prev')}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-1 text-white rounded-full hover:bg-black/50 transition-colors sm:bg-white/30 sm:backdrop-blur-sm"
                                    >
                                        <ChevronLeft className="size-6" />
                                    </button>
                                    <button
                                        onClick={() => navigatePhoto('next')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-1 text-white rounded-full hover:bg-black/50 transition-colors sm:bg-white/30 sm:backdrop-blur-sm"
                                    >
                                        <ChevronRight className="size-6" />
                                    </button>
                                </>
                            )}

                            {/* Media content with proper sizing constraints */}
                            <div className="w-full h-full flex items-center justify-center">
                                {isVideo(photos[selectedPhotoIndex].contentType) ? (
                                    <video
                                        src={`${S3_BASE_URL}/${photos[selectedPhotoIndex].fileKey}`}
                                        controls
                                        className="max-w-full max-h-full w-auto h-auto rounded-lg shadow-2xl"
                                        style={{
                                            maxWidth: 'calc(100vw - 120px)',
                                            maxHeight: 'calc(100vh - 160px)'
                                        }}
                                        autoPlay
                                    />
                                ) : (
                                    <img
                                        src={`${S3_BASE_URL}/${photos[selectedPhotoIndex].fileKey}`}
                                        alt={photos[selectedPhotoIndex].fileName}
                                        className="max-w-full max-h-full w-auto h-auto rounded-lg shadow-2xl object-contain"
                                        style={{
                                            maxWidth: 'calc(100vw - 120px)',
                                            maxHeight: 'calc(100vh - 160px)'
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Bottom Info Bar */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/50 to-transparent p-4 sm:p-6">
                            <div className="text-center">
                                <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                                    <p className="text-white text-sm font-medium truncate max-w-xs sm:max-w-md">
                                        {photos[selectedPhotoIndex].fileName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}