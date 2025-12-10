import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Link2, Image, Clock, MapPin, Maximize2, X, ChevronLeft, ChevronRight, ExternalLink, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Photo {
  id: number;
  fileName: string;
  fileUrl: string;
  createdAt: Date | string;
  photoTakenAt?: Date | string | null;
  latitude?: string | null;
  longitude?: string | null;
  cameraModel?: string | null;
}

interface JobPhotosTabProps {
  photos: Photo[];
  jobId: number;
  canEdit: boolean;
  canDelete: boolean;
  isUploading: boolean;
  isOwner: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto: (photoId: number) => void;
}

export function JobPhotosTab({
  photos,
  jobId,
  canEdit,
  canDelete,
  isUploading,
  isOwner,
  onFileUpload,
  onDeletePhoto,
}: JobPhotosTabProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div>
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Photo Gallery</h2>
          <span className="px-2 py-1 bg-[#00d4aa]/20 text-[#00d4aa] text-sm rounded-full">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button
              variant="outline"
              onClick={() => {
                const uploadUrl = `${window.location.origin}/upload?id=${jobId}`;
                navigator.clipboard.writeText(uploadUrl);
                toast.success("Upload link copied! Share with your field crew.");
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Copy Upload Link
            </Button>
          )}
          {canEdit && (
            <div>
              <input
                type="file"
                ref={photoInputRef}
                onChange={onFileUpload}
                className="hidden"
                accept="image/*"
                multiple
              />
              <Button 
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploading}
                className="bg-[#00d4aa] hover:bg-[#00b894] text-black"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Photos"}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {photos.length > 0 ? (
        <>
          {/* Masonry-style Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="group relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00d4aa]/10"
                onClick={() => setLightboxIndex(index)}
              >
                <div className="aspect-square">
                  <img 
                    src={photo.fileUrl} 
                    alt={photo.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">{photo.fileName}</p>
                    <p className="text-slate-300 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {photo.photoTakenAt 
                        ? new Date(photo.photoTakenAt).toLocaleString() 
                        : new Date(photo.createdAt).toLocaleDateString()}
                    </p>
                    {photo.latitude && photo.longitude && (
                      <p className="text-[#00d4aa] text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        GPS: {parseFloat(photo.latitude).toFixed(4)}°, {parseFloat(photo.longitude).toFixed(4)}°
                      </p>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(index); }}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Modal */}
          {lightboxIndex !== null && photos[lightboxIndex] && (
            <div 
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
              onClick={() => setLightboxIndex(null)}
            >
              <button 
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                onClick={() => setLightboxIndex(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                {lightboxIndex + 1} / {photos.length}
              </div>

              {lightboxIndex > 0 && (
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              {lightboxIndex < photos.length - 1 && (
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}

              <div 
                className="max-w-[90vw] max-h-[85vh] relative"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={photos[lightboxIndex].fileUrl} 
                  alt={photos[lightboxIndex].fileName}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{photos[lightboxIndex].fileName}</p>
                    {photos[lightboxIndex].photoTakenAt ? (
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Taken {new Date(photos[lightboxIndex].photoTakenAt).toLocaleString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        Uploaded {new Date(photos[lightboxIndex].createdAt).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                    {photos[lightboxIndex].latitude && photos[lightboxIndex].longitude && (
                      <a 
                        href={`https://www.google.com/maps?q=${photos[lightboxIndex].latitude},${photos[lightboxIndex].longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00d4aa] text-sm flex items-center gap-2 mt-1 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="w-4 h-4" />
                        View location on Google Maps
                      </a>
                    )}
                    {photos[lightboxIndex].cameraModel && (
                      <p className="text-slate-500 text-xs mt-1">
                        📷 {photos[lightboxIndex].cameraModel}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={photos[lightboxIndex].fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Original
                    </a>
                    <a 
                      href={photos[lightboxIndex].fileUrl} 
                      download={photos[lightboxIndex].fileName}
                      className="px-4 py-2 bg-[#00d4aa] hover:bg-[#00b894] rounded-lg text-black text-sm flex items-center gap-2 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    {canDelete && (
                      <button 
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2 transition-colors"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (confirm('Delete this photo?')) {
                            onDeletePhoto(photos[lightboxIndex].id);
                            setLightboxIndex(null);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
            <Image className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 text-lg mb-2">No photos yet</p>
          <p className="text-slate-500 text-sm mb-4">Upload photos to document this job</p>
          {canEdit && (
            <Button 
              className="bg-[#00d4aa] hover:bg-[#00b894] text-black"
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload First Photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
