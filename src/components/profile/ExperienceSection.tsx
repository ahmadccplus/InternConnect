import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, Briefcase, Loader2 } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  description?: string | null;
}

const ExperienceSection = () => {
  const { profile, updateProfile, loading: loadingProfile } = useProfile();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(null);
  const [experienceList, setExperienceList] = useState<Experience[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setExperienceList(profile?.experience || []);
  }, [profile]);

  const [formData, setFormData] = useState<Omit<Experience, 'id'>>({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setCurrentExperience(null);
  };
  
  const handleEditClick = (experience: Experience) => {
    setCurrentExperience(experience);
    setFormData({
      title: experience.title,
      company: experience.company,
      location: experience.location || '',
      startDate: experience.startDate,
      endDate: experience.endDate,
      description: experience.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const saveExperienceUpdate = async (updatedList: Experience[]) => {
    setIsUpdating(true);
    const { error } = await updateProfile({ experience: updatedList });
    setIsUpdating(false);
    if (error) {
      toast({ title: "Error Saving Experience", description: error.message, variant: "destructive" });
      setExperienceList(profile?.experience || []);
      return false;
    }
    return true;
  };
  
  const handleAddExperience = async () => {
    if (!formData.title || !formData.company || !formData.startDate || !formData.endDate) {
        toast({ title: "Missing Fields", description: "Please fill in title, company, start date, and end date.", variant: "destructive" });
        return;
    }

    const newExperience: Experience = {
      id: Date.now().toString(),
      ...formData,
      location: formData.location || null,
      description: formData.description || null,
    };
    
    const updatedExperienceList = [...experienceList, newExperience];
    const success = await saveExperienceUpdate(updatedExperienceList);
    
    if (success) {
      setExperienceList(updatedExperienceList);
      toast({ title: "Experience Added" });
      resetForm();
      setIsAddDialogOpen(false);
    }
  };
  
  const handleUpdateExperience = async () => {
    if (!currentExperience) return;
    if (!formData.title || !formData.company || !formData.startDate || !formData.endDate) {
        toast({ title: "Missing Fields", description: "Please fill in title, company, start date, and end date.", variant: "destructive" });
        return;
    }
    
    const updatedExperienceList = experienceList.map(exp => 
      exp.id === currentExperience.id ? { 
        ...exp,
        ...formData,
        location: formData.location || null,
        description: formData.description || null,
       } : exp
    );
    
    const success = await saveExperienceUpdate(updatedExperienceList);

    if (success) {
      setExperienceList(updatedExperienceList);
      toast({ title: "Experience Updated" });
      resetForm();
      setIsEditDialogOpen(false);
    }
  };
  
  const handleDeleteExperience = async (id: string) => {
    const updatedExperienceList = experienceList.filter(exp => exp.id !== id);
    const success = await saveExperienceUpdate(updatedExperienceList);

    if (success) {
      setExperienceList(updatedExperienceList);
      toast({ title: "Experience Deleted" });
      if (currentExperience?.id === id) {
         setIsEditDialogOpen(false);
         resetForm();
      }
    }
  };

  const renderExperienceItem = (exp: Experience) => (
    <div key={exp.id} className="border-l-4 border-intern-medium pl-4 py-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
             <Briefcase className="h-5 w-5 mr-2 text-intern-dark flex-shrink-0" />
            <h4 className="text-lg font-semibold">{exp.title}</h4>
          </div>
          <p className="text-intern-dark">{exp.company}{exp.location ? ` - ${exp.location}` : ''}</p>
          <p className="text-gray-500">{exp.startDate} - {exp.endDate}</p> 
          {exp.description && <p className="mt-2 text-gray-700 whitespace-pre-wrap">{exp.description}</p>}
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => handleEditClick(exp)} disabled={isUpdating}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteExperience(exp.id)} disabled={isUpdating}>
            <Trash2 className="h-4 w-4 text-red-500" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Experience</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsAddDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button className="bg-intern-medium hover:bg-intern-dark" disabled={loadingProfile}>
              <Plus className="mr-2 h-4 w-4" /> Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add Experience</DialogTitle>
              <DialogDescription>Fill in the details of your work experience.</DialogDescription>
            </DialogHeader>
            <fieldset disabled={isUpdating} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input id="company" name="company" value={formData.company} onChange={handleInputChange} required />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input id="location" name="location" placeholder="e.g. Remote, New York, NY" value={formData.location || ''} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input id="startDate" name="startDate" type="month" value={formData.startDate} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input id="endDate" name="endDate" type="month" placeholder="YYYY-MM or Present" value={formData.endDate} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Describe your responsibilities and achievements..."
                  value={formData.description || ''} 
                  onChange={handleInputChange}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </fieldset>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddExperience} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Experience
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {loadingProfile ? (
        <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-intern-dark" /></div>
      ) : experienceList.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No work experience added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experienceList.map(renderExperienceItem)}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsEditDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
            <DialogDescription>Update the details of this work experience.</DialogDescription>
          </DialogHeader>
           <fieldset disabled={isUpdating} className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Job Title *</Label>
                  <Input id="edit-title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company *</Label>
                  <Input id="edit-company" name="company" value={formData.company} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location (Optional)</Label>
                <Input id="edit-location" name="location" value={formData.location || ''} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">Start Date *</Label>
                  <Input id="edit-startDate" name="startDate" type="month" value={formData.startDate} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">End Date *</Label>
                  <Input id="edit-endDate" name="endDate" type="month" value={formData.endDate} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea 
                    id="edit-description" 
                    name="description" 
                    value={formData.description || ''} 
                    onChange={handleInputChange} 
                    rows={4} 
                    className="resize-none" 
                 />
              </div>
            </fieldset>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateExperience} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Update Experience
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExperienceSection;
