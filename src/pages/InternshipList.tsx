import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BriefcaseIcon, SearchIcon, MapPinIcon, ClockIcon, Filter, BuildingIcon } from 'lucide-react';
import { useInternships } from '../contexts/InternshipContext';

// Simple date formatting utility (consider using a library like date-fns for more complex needs)
export const timeAgo = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) {
    return parseInt(String(secondsPast)) + 's ago';
  }
  if (secondsPast < 3600) {
    return parseInt(String(secondsPast / 60)) + 'm ago';
  }
  if (secondsPast <= 86400) {
    return parseInt(String(secondsPast / 3600)) + 'h ago';
  }
  if (secondsPast <= 2628000) { // approx 30 days
    const days = parseInt(String(secondsPast / 86400));
    return days + (days === 1 ? ' day ago' : ' days ago');
  }
  if (secondsPast <= 31536000) { // approx 1 year
    const months = parseInt(String(secondsPast / 2628000));
    return months + (months === 1 ? ' month ago' : ' months ago');
  }
  const years = parseInt(String(secondsPast / 31536000));
  return years + (years === 1 ? ' year ago' : ' years ago');
};

const InternshipList = () => {
  const { internships, loading } = useInternships();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all-locations');
  const [categoryFilter, setCategoryFilter] = useState('all-categories');
  const [typeFilter, setTypeFilter] = useState('all-types');

  // Filter internships based on search and filters
  const filteredInternships = internships.filter(internship => {
    // Ensure checks handle potentially undefined fields gracefully
    const titleMatch = internship.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const companyMatch = internship.company?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const descriptionMatch = internship.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSearch = titleMatch || companyMatch || descriptionMatch;
    
    const matchesLocation = locationFilter === 'all-locations' ? true : internship.location?.includes(locationFilter);
    // Use optional chaining for category as it might be null/undefined
    const matchesCategory = categoryFilter === 'all-categories' ? true : internship.category === categoryFilter;
    const matchesType = typeFilter === 'all-types' ? true : internship.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesCategory && matchesType;
  });

  // Get unique values for filters (handle potential undefined)
  const locations = [...new Set(internships.map(internship => internship.location).filter(Boolean) as string[])];
  const categories = [...new Set(internships.map(internship => internship.category).filter(Boolean) as string[])];
  const types = [...new Set(internships.map(internship => internship.type).filter(Boolean) as string[])];

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-intern-dark"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Find Your Internship</h1>
          <p className="text-gray-600 mt-1">Browse through hundreds of opportunities</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-intern-medium hover:bg-intern-dark">
          <BriefcaseIcon className="mr-2 h-4 w-4" />
          Save Search
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search job titles, companies, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <MapPinIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">All Locations</SelectItem>
              {locations.map((loc, idx) => (
                <SelectItem key={idx} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categories.map((cat, idx) => (
                <SelectItem key={idx} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <ClockIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              {types.map((type, idx) => (
                <SelectItem key={idx} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredInternships.length}</span> results
        </p>
        <Select defaultValue="newest">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="relevant">Most relevant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results list */}
      <div className="space-y-4">
        {filteredInternships.length > 0 ? (
          filteredInternships.map((internship) => (
            <Card key={internship.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-grow">
                    <Link to={`/internships/${internship.id}`} className="text-xl font-semibold hover:text-intern-dark transition-colors">
                      {internship.title}
                    </Link>
                    <div className="flex items-center mt-1 text-gray-600">
                      <BuildingIcon className="h-4 w-4 mr-1" />
                      {internship.company || 'N/A'}
                    </div>
                    <div className="flex items-center mt-1 text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {internship.location}
                      <span className="mx-2">•</span>
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {internship.type}
                      <span className="mx-2">•</span>
                      <span className="text-gray-500 text-sm">Posted {timeAgo(internship.created_at)}</span>
                    </div>
                    <p className="mt-3 text-gray-600 line-clamp-2">{internship.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {internship.skills?.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-intern-light text-intern-dark border-intern">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                    <Button className="bg-intern-medium hover:bg-intern-dark" asChild>
                      <Link to={`/internships/${internship.id}`}>View Details</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="mt-2 text-gray-500">
                      Save for later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">No internships found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination - simple version for now */}
      {filteredInternships.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button variant="outline">Previous</Button>
            <Button variant="outline" className="bg-intern-light text-intern-dark">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipList;
