import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Eye, Download, Trash2 } from "lucide-react";

interface Document {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: Date | string;
}

interface JobDocumentsTabProps {
  documents: Document[];
  canEdit: boolean;
  canDelete: boolean;
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (documentId: number) => void;
  onPreviewDocument: (doc: { url: string; name: string; type: string }) => void;
}

export function JobDocumentsTab({
  documents,
  canEdit,
  canDelete,
  isUploading,
  onFileUpload,
  onDeleteDocument,
  onPreviewDocument,
}: JobDocumentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Documents ({documents.length})</h2>
        {canEdit && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-[#00D4FF] hover:bg-[#00B8E6] text-black"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        )}
      </div>
      
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card 
              key={doc.id} 
              className="bg-slate-800 border-slate-700 hover:border-[#00D4FF] transition-colors cursor-pointer group"
              onClick={() => onPreviewDocument({ url: doc.fileUrl, name: doc.fileName, type: doc.fileType || '' })}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D4FF]/20 transition-colors">
                    <FileText className="w-5 h-5 text-blue-400 group-hover:text-[#00D4FF] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate group-hover:text-[#00D4FF] transition-colors">{doc.fileName}</p>
                    <p className="text-sm text-slate-400">
                      {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "Unknown size"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-[#00D4FF] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view
                    </p>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-white hover:bg-slate-700"
                      onClick={() => onPreviewDocument({ url: doc.fileUrl, name: doc.fileName, type: doc.fileType || '' })}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                    {canDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => onDeleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-500" />
            <p className="text-slate-400">No documents uploaded yet</p>
            {canEdit && (
              <Button 
                variant="link" 
                className="mt-2 text-[#00D4FF]"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload your first document
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
