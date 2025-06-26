
import { useInternships } from "../contexts/InternshipContext";
import { useToast } from "./use-toast";

export const useInternshipActions = () => {
  const { internships, addInternship, updateInternship, deleteInternship } = useInternships();
  const { toast } = useToast();

  // Enhanced deleteInternship function with toast feedback
  const deleteInternshipWithFeedback = (id: number) => {
    try {
      const success = deleteInternship(id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Internship successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete internship. Please try again.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting internship:', error);
      toast({
        title: "Error",
        description: "Failed to delete internship. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    internships,
    addInternship,
    updateInternship,
    deleteInternship: deleteInternshipWithFeedback
  };
};
