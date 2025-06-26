import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { X, Plus, Loader2 } from 'lucide-react';

const SkillsSection = () => {
  const { profile, updateProfile, loading: loadingProfile } = useProfile();
  const { toast } = useToast();
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setSkills(profile?.skills || []);
  }, [profile]);

  const handleAddSkill = async () => {
    const skillToAdd = newSkill.trim();
    if (skillToAdd === '') return;
    
    const skillExists = skills.some(
      skill => skill.toLowerCase() === skillToAdd.toLowerCase()
    );
    
    if (skillExists) {
      toast({
        title: "Skill already exists",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSkills = [...skills, skillToAdd];
    const originalSkills = skills;
    setSkills(updatedSkills);
    setNewSkill('');
    setIsUpdating(true);

    const { error } = await updateProfile({ skills: updatedSkills });

    setIsUpdating(false);
    if (error) {
      toast({ title: "Error Adding Skill", description: error.message, variant: "destructive" });
      setSkills(originalSkills);
    } else {
      toast({ title: "Skill Added", description: `'${skillToAdd}' was added.` });
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const originalSkills = skills;
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    setIsUpdating(true);
    
    const { error } = await updateProfile({ skills: updatedSkills });
    
    setIsUpdating(false);
    if (error) {
      toast({ title: "Error Removing Skill", description: error.message, variant: "destructive" });
      setSkills(originalSkills);
    } else {
      toast({ title: "Skill Removed", description: `'${skillToRemove}' was removed.` });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const displaySkills = profile?.skills || [];

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Skills</h3>
      
      <div className="flex items-center space-x-2 mb-6">
        <Input
          placeholder="Add a skill (e.g. React, Python, Project Management)"
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={isUpdating}
        />
        <Button 
          onClick={handleAddSkill}
          className="bg-intern-medium hover:bg-intern-dark"
          disabled={isUpdating || loadingProfile || !newSkill.trim()}
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />} 
          Add
        </Button>
      </div>
      
      {loadingProfile ? (
        <div className="text-center py-8">
           <Loader2 className="h-6 w-6 animate-spin mx-auto text-intern-dark" />
        </div>
      ) : displaySkills.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No skills added yet. Add skills to highlight your expertise.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displaySkills.map(skill => (
            <div 
              key={skill}
              className="bg-intern-light text-intern-dark px-3 py-1 rounded-full flex items-center"
            >
              <span>{skill}</span>
              <button 
                onClick={() => handleRemoveSkill(skill)}
                className="ml-2 text-intern-dark hover:text-intern-dark/80 focus:outline-none disabled:opacity-50"
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove {skill}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsSection;
