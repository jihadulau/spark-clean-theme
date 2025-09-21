import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  bookingId: string;
  type: 'before' | 'after';
  onUploadSuccess?: () => void;
}

interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  type: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ bookingId, type, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const { toast } = useToast();

  const uploadPhoto = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${bookingId}/${type}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('booking-photos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('booking-photos')
        .getPublicUrl(fileName);

      const newPhoto: UploadedPhoto = {
        id: fileName,
        url: publicUrl,
        name: file.name,
        type
      };

      setPhotos(prev => [...prev, newPhoto]);
      
      toast({
        title: "Photo uploaded successfully",
        description: `${type} photo has been uploaded.`,
      });

      onUploadSuccess?.();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      uploadPhoto(file);
    }
  };

  const removePhoto = async (photo: UploadedPhoto) => {
    try {
      const { error } = await supabase.storage
        .from('booking-photos')
        .remove([photo.id]);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      
      toast({
        title: "Photo removed",
        description: "Photo has been successfully removed.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove photo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium capitalize">
          {type} Photos
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`photo-upload-${type}-${bookingId}`}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById(`photo-upload-${type}-${bookingId}`)?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <CardContent className="p-0 relative">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-32 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removePhoto(photo)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                  {photo.name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center mb-2">
              No {type} photos uploaded yet
            </p>
            <p className="text-xs text-muted-foreground/75 text-center">
              Upload photos to document the cleaning progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotoUpload;