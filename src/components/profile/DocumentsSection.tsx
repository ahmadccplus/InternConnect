import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Plus, Download, Trash2, Loader2, UploadCloud } from 'lucide-react';

interface DocumentMetadata {
  id: string;
  name: string;
  storagePath: string;
  fileType: string;
  uploadedAt: string;
}

const STORAGE_BUCKET = 'profile-documents';

const DocumentsSection = () => {
  const { profile, updateProfile, loading: loadingProfile } = useProfile();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [documentList, setDocumentList] = useState<DocumentMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('resume');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDocumentList(profile?.documents || []);
  }, [profile]);

  const resetForm = () => {
    setDocumentName('');
    setDocumentType('resume');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.split('.').slice(0, -1).join('.'));
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleAddDocument = async () => {
    if (!selectedFile || !documentName || !profile?.id) return;

    setIsUploading(true);
    const fileExt = selectedFile.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${profile.id}/${uniqueFileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const newDocument: DocumentMetadata = {
        id: uniqueFileName,
        name: documentName,
        storagePath: filePath,
        fileType: documentType,
        uploadedAt: new Date().toISOString(),
      };

      const updatedDocuments = [...documentList, newDocument];
      const { error: updateError } = await updateProfile({ documents: updatedDocuments });

      if (updateError) {
        console.error("Failed to update profile, attempting to delete orphaned file...");
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        throw updateError; 
      }

      setDocumentList(updatedDocuments);
      toast({ title: "Document Uploaded", description: `'${documentName}' uploaded successfully.` });
      resetForm();
      setIsAddDialogOpen(false);

    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docToDelete: DocumentMetadata) => {
    if (!profile?.id) return;
    setIsDeleting(docToDelete.id);
    
    try {
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([docToDelete.storagePath]);

      if (deleteError) {
          console.error("Error deleting file from storage:", deleteError);
      } 
      
      const updatedDocuments = documentList.filter(doc => doc.id !== docToDelete.id);
      const { error: updateError } = await updateProfile({ documents: updatedDocuments });
      
      if (updateError) throw updateError;
      
      setDocumentList(updatedDocuments);
      toast({ title: "Document Deleted", description: `'${docToDelete.name}' deleted.` });

    } catch (error: any) {
       console.error("Error deleting document:", error);
       toast({ title: "Deletion Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownloadDocument = async (docToDownload: DocumentMetadata) => {
    setIsDownloading(docToDownload.id);
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(docToDownload.storagePath);

      if (error) throw error;
      if (!data) throw new Error("No data received for download.");

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      const originalFileName = docToDownload.storagePath.split('/').pop() || docToDownload.name;
      link.setAttribute('download', originalFileName);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "Download Started", description: `Downloading '${docToDownload.name}'...` });

    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({ title: "Download Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDownloading(null);
    }
  };

  const formatDateForDisplay = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    // Explicitly format as dd/mm/yyyy
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case 'resume': return 'Resume';
      case 'cover_letter': return 'Cover Letter';
      case 'transcript': return 'Transcript';
      case 'portfolio': return 'Portfolio';
      case 'other': return 'Other Document';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Documents</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsAddDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button className="bg-intern-medium hover:bg-intern-dark" disabled={loadingProfile || isUploading}>
              <Plus className="mr-2 h-4 w-4" /> Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload your resume, cover letter, or other relevant documents.</DialogDescription>
            </DialogHeader>
            <fieldset disabled={isUploading} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="document-name">Document Name *</Label>
                <Input 
                  id="document-name" 
                  value={documentName}
                  onChange={e => setDocumentName(e.target.value)}
                  placeholder="e.g. My Resume (Spring 2024)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <select 
                  id="document-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value)}
                >
                  <option value="resume">Resume</option>
                  <option value="cover_letter">Cover Letter</option>
                  <option value="transcript">Transcript</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-file">Upload File *</Label>
                <Input 
                  id="document-file" 
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  required
                />
                <p className="text-sm text-muted-foreground">Max file size: 5MB. Accepted: PDF, DOC(X), TXT, JPG, PNG.</p>
              </div>
            </fieldset>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddDocument}
                disabled={!documentName || !selectedFile || isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />} 
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loadingProfile ? (
          <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-intern-dark" /></div>
        ) : documentList.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentList.map(doc => (
              <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50/50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileText className="h-5 w-5 text-intern-dark flex-shrink-0" />
                  <div className="overflow-hidden">
                    <h4 className="font-medium text-sm truncate" title={doc.name}>{doc.name}</h4>
                    <p className="text-xs text-gray-500">
                      {getDocumentLabel(doc.fileType)} • Uploaded {formatDateForDisplay(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDownloadDocument(doc)} 
                    disabled={isDownloading === doc.id || !!isDeleting}
                    title="Download"
                  >
                    {isDownloading === doc.id ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> : 
                      <Download className="h-4 w-4" />
                    }
                    <span className="sr-only">Download {doc.name}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteDocument(doc)} 
                    disabled={isDeleting === doc.id || !!isDownloading} 
                    title="Delete"
                  >
                    {isDeleting === doc.id ? 
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : 
                      <Trash2 className="h-4 w-4 text-red-500" />
                    }
                    <span className="sr-only">Delete {doc.name}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsSection;
