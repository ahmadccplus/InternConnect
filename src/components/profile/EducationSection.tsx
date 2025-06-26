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
import { Plus, Pencil, Trash2, GraduationCap, Loader2 } from 'lucide-react';

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  description?: string | null;
  gpa?: string | null;
}

const EducationSection = () => {
  const { profile, updateProfile, loading: loadingProfile } = useProfile();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    setEducationList(profile?.education || []);
  }, [profile]);

  const [formData, setFormData] = useState<Omit<Education, 'id'>>({
    school: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    description: '',
    gpa: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setFormData({
      school: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      description: '',
      gpa: '',
    });
    setCurrentEducation(null);
  };
  
  const handleEditClick = (education: Education) => {
    setCurrentEducation(education);
    setFormData({
      school: education.school,
      degree: education.degree,
      field: education.field,
      startYear: education.startYear,
      endYear: education.endYear,
      description: education.description || '',
      gpa: education.gpa || '',
    });
    setIsEditDialogOpen(true);
  };

  const saveEducationUpdate = async (updatedList: Education[]) => {
    setIsUpdating(true);
    const { error } = await updateProfile({ education: updatedList });
    setIsUpdating(false);
    if (error) {
      toast({ title: "Error Saving Education", description: error.message, variant: "destructive" });
      setEducationList(profile?.education || []);
      return false;
    }
    return true;
  };
  
  const handleAddEducation = async () => {
    if (!formData.school || !formData.degree || !formData.field || !formData.startYear || !formData.endYear) {
        toast({ title: "Missing Fields", description: "Please fill in all required education fields.", variant: "destructive" });
        return;
    }
    const newEducation: Education = {
      id: Date.now().toString(),
      ...formData,
      description: formData.description || null,
      gpa: formData.gpa || null,
    };
    
    const updatedEducationList = [...educationList, newEducation];
    const success = await saveEducationUpdate(updatedEducationList);
    
    if (success) {
      setEducationList(updatedEducationList);
      toast({ title: "Education Added" });
      resetForm();
      setIsAddDialogOpen(false);
    }
  };
  
  const handleUpdateEducation = async () => {
    if (!currentEducation) return;
    if (!formData.school || !formData.degree || !formData.field || !formData.startYear || !formData.endYear) {
        toast({ title: "Missing Fields", description: "Please fill in all required education fields.", variant: "destructive" });
        return;
    }
    
    const updatedEducationList = educationList.map(edu => 
      edu.id === currentEducation.id ? { 
        ...edu,
        ...formData,
        description: formData.description || null,
        gpa: formData.gpa || null,
       } : edu
    );
    
    const success = await saveEducationUpdate(updatedEducationList);

    if (success) {
      setEducationList(updatedEducationList);
      toast({ title: "Education Updated" });
      resetForm();
      setIsEditDialogOpen(false);
    }
  };
  
  const handleDeleteEducation = async (id: string) => {
    const updatedEducationList = educationList.filter(edu => edu.id !== id);
    const success = await saveEducationUpdate(updatedEducationList);

    if (success) {
      setEducationList(updatedEducationList);
      toast({ title: "Education Deleted" });
      if (currentEducation?.id === id) {
         setIsEditDialogOpen(false);
         resetForm();
      }
    }
  };

  const renderEducationItem = (edu: Education) => (
    <div key={edu.id} className="border-l-4 border-intern-medium pl-4 py-2">
      <div className="flex justify-between">
        <div>
          <div className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-intern-dark" />
            <h4 className="text-lg font-semibold">{edu.school}</h4>
          </div>
          <p className="text-intern-dark">{edu.degree} in {edu.field}</p>
          <p className="text-gray-500">{edu.startYear} - {edu.endYear}</p>
          {edu.gpa && <p className="text-gray-500">GPA: {edu.gpa}</p>}
          {edu.description && <p className="mt-2 text-gray-700">{edu.description}</p>}
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleEditClick(edu)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteEducation(edu.id)}>
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
        <h3 className="text-xl font-semibold">Education</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsAddDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button className="bg-intern-medium hover:bg-intern-dark">
              <Plus className="mr-2 h-4 w-4" /> Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add Education</DialogTitle>
              <DialogDescription>Fill in the details of your education history.</DialogDescription>
            </DialogHeader>
            <fieldset disabled={isUpdating} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="school">School/University *</Label>
                <Input id="school" name="school" value={formData.school} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree *</Label>
                  <Input id="degree" name="degree" placeholder="Bachelor's, Master's" value={formData.degree} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field">Field of Study *</Label>
                  <Input id="field" name="field" placeholder="Computer Science" value={formData.field} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="startYear">Start Year *</Label>
                  <Input id="startYear" name="startYear" type="number" placeholder="YYYY" value={formData.startYear} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="endYear">End Year *</Label>
                  <Input id="endYear" name="endYear" type="number" placeholder="YYYY or Present" value={formData.endYear} onChange={handleInputChange} required />
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <Input id="gpa" name="gpa" placeholder="e.g., 3.8 / 4.0" value={formData.gpa || ''} onChange={handleInputChange} />
                </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Describe relevant coursework, honors, activities..."
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </fieldset>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddEducation} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Education
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {loadingProfile ? (
        <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-intern-dark" /></div>
      ) : educationList.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No education history added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {educationList.map(renderEducationItem)}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsEditDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
             <DialogDescription>Update the details of this education entry.</DialogDescription>
          </DialogHeader>
           <fieldset disabled={isUpdating} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-school">School/University *</Label>
                <Input id="edit-school" name="school" value={formData.school} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-degree">Degree *</Label>
                  <Input id="edit-degree" name="degree" value={formData.degree} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-field">Field of Study *</Label>
                  <Input id="edit-field" name="field" value={formData.field} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="edit-startYear">Start Year *</Label>
                  <Input id="edit-startYear" name="startYear" type="number" value={formData.startYear} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="edit-endYear">End Year *</Label>
                  <Input id="edit-endYear" name="endYear" type="number" value={formData.endYear} onChange={handleInputChange} required />
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="edit-gpa">GPA (Optional)</Label>
                  <Input id="edit-gpa" name="gpa" value={formData.gpa || ''} onChange={handleInputChange} />
                </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea id="edit-description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="resize-none" />
              </div>
            </fieldset>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateEducation} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Update Education
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default EducationSection;
