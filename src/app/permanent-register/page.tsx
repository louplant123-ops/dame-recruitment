'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Upload, Plus, Trash2, MapPin, Briefcase, GraduationCap, Target, Clock, Home } from 'lucide-react';

interface EmploymentHistory {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
  achievements: string;
  salary: string;
  reasonForLeaving: string;
  referenceContact: string;
  referencePhone: string;
  referenceEmail: string;
}

interface Education {
  id: string;
  institution: string;
  qualification: string;
  subject: string;
  grade: string;
  startDate: string;
  endDate: string;
}

interface ProfessionalQualification {
  id: string;
  name: string;
  issuingBody: string;
  dateObtained: string;
  expiryDate: string;
  certificateNumber: string;
}

export default function PermanentCandidateRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    postcode: '',
    linkedinProfile: '',
    
    // Career Objectives
    careerObjective: '',
    currentSalary: '',
    expectedSalary: '',
    salaryNegotiable: false,
    careerGoals: '',
    motivations: '',
    
    // Job Preferences
    preferredJobTypes: [] as string[],
    preferredIndustries: [] as string[],
    preferredLocations: [] as string[],
    willingToRelocate: false,
    maxCommuteDistance: '',
    remoteWorkPreference: '',
    
    // Availability
    noticePeriod: '',
    availableStartDate: '',
    interviewAvailability: '',
    
    // Employment History
    employmentHistory: [] as EmploymentHistory[],
    
    // Education
    education: [] as Education[],
    
    // Professional Qualifications
    professionalQualifications: [] as ProfessionalQualification[],
    
    // Additional Information
    keySkills: [] as string[],
    languages: [] as string[],
    drivingLicense: false,
    ownVehicle: false,
    additionalInfo: ''
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobTypes = [
    'Full-time Permanent', 'Part-time Permanent', 'Contract (6+ months)',
    'Senior Management', 'Middle Management', 'Specialist/Technical',
    'Graduate/Entry Level', 'Consultant', 'Director Level'
  ];

  const industries = [
    'Manufacturing', 'Engineering', 'Construction', 'Logistics',
    'Healthcare', 'Finance', 'Technology', 'Education', 'Retail',
    'Hospitality', 'Automotive', 'Aerospace', 'Pharmaceuticals'
  ];

  const remoteOptions = [
    'Office-based only', 'Hybrid (2-3 days office)', 'Hybrid (1-2 days office)',
    'Mostly remote', 'Fully remote', 'Flexible arrangement'
  ];

  const noticePeriods = [
    'Immediately available', '1 week', '2 weeks', '1 month',
    '2 months', '3 months', '6 months', 'Other'
  ];

  const addEmploymentHistory = () => {
    const newEntry: EmploymentHistory = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      responsibilities: '',
      achievements: '',
      salary: '',
      reasonForLeaving: '',
      referenceContact: '',
      referencePhone: '',
      referenceEmail: ''
    };
    setFormData(prev => ({
      ...prev,
      employmentHistory: [...prev.employmentHistory, newEntry]
    }));
  };

  const updateEmploymentHistory = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      employmentHistory: prev.employmentHistory.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeEmploymentHistory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      employmentHistory: prev.employmentHistory.filter(entry => entry.id !== id)
    }));
  };

  const addEducation = () => {
    const newEntry: Education = {
      id: Date.now().toString(),
      institution: '',
      qualification: '',
      subject: '',
      grade: '',
      startDate: '',
      endDate: ''
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEntry]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(entry => entry.id !== id)
    }));
  };

  const addProfessionalQualification = () => {
    const newEntry: ProfessionalQualification = {
      id: Date.now().toString(),
      name: '',
      issuingBody: '',
      dateObtained: '',
      expiryDate: '',
      certificateNumber: ''
    };
    setFormData(prev => ({
      ...prev,
      professionalQualifications: [...prev.professionalQualifications, newEntry]
    }));
  };

  const updateProfessionalQualification = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      professionalQualifications: prev.professionalQualifications.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeProfessionalQualification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      professionalQualifications: prev.professionalQualifications.filter(entry => entry.id !== id)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value.toString());
        }
      });
      
      // Add CV file if uploaded
      if (cvFile) {
        submitData.append('cv', cvFile);
      }
      
      submitData.append('registrationType', 'permanent');
      
      const response = await fetch('/api/candidates/apply', {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_DAMEDESK_API_KEY || 'dame-api-key-2024'
        },
        body: submitData
      });
      
      if (response.ok) {
        alert('Registration submitted successfully! We will be in touch within 24 hours.');
        // Reset form or redirect
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={formData.linkedinProfile}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Postcode *
        </label>
        <input
          type="text"
          required
          value={formData.postcode}
          onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Career Objectives</h2>
        <p className="text-gray-600">Tell us about your career goals and expectations</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Career Objective *
        </label>
        <textarea
          required
          rows={4}
          value={formData.careerObjective}
          onChange={(e) => setFormData(prev => ({ ...prev, careerObjective: e.target.value }))}
          placeholder="Describe your career objectives and what you're looking for in your next role..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Salary (£)
          </label>
          <input
            type="number"
            value={formData.currentSalary}
            onChange={(e) => setFormData(prev => ({ ...prev, currentSalary: e.target.value }))}
            placeholder="45000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Salary (£) *
          </label>
          <input
            type="number"
            required
            value={formData.expectedSalary}
            onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: e.target.value }))}
            placeholder="50000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="salaryNegotiable"
          checked={formData.salaryNegotiable}
          onChange={(e) => setFormData(prev => ({ ...prev, salaryNegotiable: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="salaryNegotiable" className="ml-2 text-sm text-gray-700">
          Salary is negotiable
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Long-term Career Goals
        </label>
        <textarea
          rows={3}
          value={formData.careerGoals}
          onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
          placeholder="Where do you see yourself in 3-5 years?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What motivates you in your career?
        </label>
        <textarea
          rows={3}
          value={formData.motivations}
          onChange={(e) => setFormData(prev => ({ ...prev, motivations: e.target.value }))}
          placeholder="Professional development, challenging projects, team leadership, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Preferences</h2>
        <p className="text-gray-600">What type of roles are you looking for?</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Job Types *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferredJobTypes.includes(type)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      preferredJobTypes: [...prev.preferredJobTypes, type]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      preferredJobTypes: prev.preferredJobTypes.filter(t => t !== type)
                    }));
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Industries *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {industries.map((industry) => (
            <label key={industry} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferredIndustries.includes(industry)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      preferredIndustries: [...prev.preferredIndustries, industry]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      preferredIndustries: prev.preferredIndustries.filter(i => i !== industry)
                    }));
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{industry}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Remote Work Preference
        </label>
        <select
          value={formData.remoteWorkPreference}
          onChange={(e) => setFormData(prev => ({ ...prev, remoteWorkPreference: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select preference</option>
          {remoteOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Commute Distance (miles)
          </label>
          <input
            type="number"
            value={formData.maxCommuteDistance}
            onChange={(e) => setFormData(prev => ({ ...prev, maxCommuteDistance: e.target.value }))}
            placeholder="25"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center pt-8">
          <input
            type="checkbox"
            id="willingToRelocate"
            checked={formData.willingToRelocate}
            onChange={(e) => setFormData(prev => ({ ...prev, willingToRelocate: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="willingToRelocate" className="ml-2 text-sm text-gray-700">
            Willing to relocate for the right opportunity
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Clock className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Availability</h2>
        <p className="text-gray-600">When can you start and interview?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notice Period *
          </label>
          <select
            required
            value={formData.noticePeriod}
            onChange={(e) => setFormData(prev => ({ ...prev, noticePeriod: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select notice period</option>
            {noticePeriods.map((period) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Start Date
          </label>
          <input
            type="date"
            value={formData.availableStartDate}
            onChange={(e) => setFormData(prev => ({ ...prev, availableStartDate: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Availability
        </label>
        <textarea
          rows={3}
          value={formData.interviewAvailability}
          onChange={(e) => setFormData(prev => ({ ...prev, interviewAvailability: e.target.value }))}
          placeholder="e.g., Weekdays after 5pm, weekends, flexible during notice period..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Employment History</h2>
        <p className="text-gray-600">Tell us about your work experience and references</p>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        <button
          type="button"
          onClick={addEmploymentHistory}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Position
        </button>
      </div>
      
      {formData.employmentHistory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No employment history added yet. Click "Add Position" to get started.</p>
        </div>
      )}
      
      {formData.employmentHistory.map((job, index) => (
        <div key={job.id} className="border border-gray-300 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Position {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeEmploymentHistory(job.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
              <input
                type="text"
                required
                value={job.company}
                onChange={(e) => updateEmploymentHistory(job.id, 'company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
              <input
                type="text"
                required
                value={job.position}
                onChange={(e) => updateEmploymentHistory(job.id, 'position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                required
                value={job.startDate}
                onChange={(e) => updateEmploymentHistory(job.id, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={job.endDate}
                onChange={(e) => updateEmploymentHistory(job.id, 'endDate', e.target.value)}
                disabled={job.current}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`current-${job.id}`}
              checked={job.current}
              onChange={(e) => updateEmploymentHistory(job.id, 'current', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`current-${job.id}`} className="ml-2 text-sm text-gray-700">
              This is my current position
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Responsibilities</label>
            <textarea
              rows={3}
              value={job.responsibilities}
              onChange={(e) => updateEmploymentHistory(job.id, 'responsibilities', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Achievements</label>
            <textarea
              rows={2}
              value={job.achievements}
              onChange={(e) => updateEmploymentHistory(job.id, 'achievements', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary (£)</label>
              <input
                type="text"
                value={job.salary}
                onChange={(e) => updateEmploymentHistory(job.id, 'salary', e.target.value)}
                placeholder="45000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leaving</label>
              <input
                type="text"
                value={job.reasonForLeaving}
                onChange={(e) => updateEmploymentHistory(job.id, 'reasonForLeaving', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-900 mb-3">Reference Contact</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                <input
                  type="text"
                  value={job.referenceContact}
                  onChange={(e) => updateEmploymentHistory(job.id, 'referenceContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={job.referencePhone}
                  onChange={(e) => updateEmploymentHistory(job.id, 'referencePhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={job.referenceEmail}
                  onChange={(e) => updateEmploymentHistory(job.id, 'referenceEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GraduationCap className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Education & Qualifications</h2>
        <p className="text-gray-600">Tell us about your educational background and certifications</p>
      </div>
      
      {/* Education Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </button>
        </div>
        
        {formData.education.map((edu, index) => (
          <div key={edu.id} className="border border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeEducation(edu.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                <input
                  type="text"
                  value={edu.qualification}
                  onChange={(e) => updateEducation(edu.id, 'qualification', e.target.value)}
                  placeholder="e.g., Bachelor's Degree, A-Levels"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={edu.subject}
                  onChange={(e) => updateEducation(edu.id, 'subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <input
                  type="text"
                  value={edu.grade}
                  onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                  placeholder="e.g., 2:1, A*AA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Professional Qualifications Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Professional Qualifications</h3>
          <button
            type="button"
            onClick={addProfessionalQualification}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Qualification
          </button>
        </div>
        
        {formData.professionalQualifications.map((qual, index) => (
          <div key={qual.id} className="border border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Qualification {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeProfessionalQualification(qual.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification Name</label>
                <input
                  type="text"
                  value={qual.name}
                  onChange={(e) => updateProfessionalQualification(qual.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Body</label>
                <input
                  type="text"
                  value={qual.issuingBody}
                  onChange={(e) => updateProfessionalQualification(qual.id, 'issuingBody', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Obtained</label>
                <input
                  type="date"
                  value={qual.dateObtained}
                  onChange={(e) => updateProfessionalQualification(qual.id, 'dateObtained', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (if applicable)</label>
                <input
                  type="date"
                  value={qual.expiryDate}
                  onChange={(e) => updateProfessionalQualification(qual.id, 'expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Number</label>
                <input
                  type="text"
                  value={qual.certificateNumber}
                  onChange={(e) => updateProfessionalQualification(qual.id, 'certificateNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* CV Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CV (PDF, DOC, DOCX)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            className="hidden"
            id="cv-upload"
          />
          <label
            htmlFor="cv-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
          >
            Click to upload your CV
          </label>
          {cvFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {cvFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Home className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600">Please review your information before submitting</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{formData.firstName} {formData.lastName}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Email:</span>
            <span className="ml-2 text-gray-900">{formData.email}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Phone:</span>
            <span className="ml-2 text-gray-900">{formData.phone}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Expected Salary:</span>
            <span className="ml-2 text-gray-900">£{formData.expectedSalary}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Notice Period:</span>
            <span className="ml-2 text-gray-900">{formData.noticePeriod}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Employment History:</span>
            <span className="ml-2 text-gray-900">{formData.employmentHistory.length} positions</span>
          </div>
        </div>
        
        {formData.preferredJobTypes.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Preferred Job Types:</span>
            <span className="ml-2 text-gray-900">{formData.preferredJobTypes.join(', ')}</span>
          </div>
        )}
        
        {formData.preferredIndustries.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Preferred Industries:</span>
            <span className="ml-2 text-gray-900">{formData.preferredIndustries.join(', ')}</span>
          </div>
        )}
        
        {cvFile && (
          <div>
            <span className="font-semibold text-gray-700">CV:</span>
            <span className="ml-2 text-gray-900">{cvFile.name}</span>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• We'll review your application within 24 hours</li>
          <li>• A consultant will contact you to discuss opportunities</li>
          <li>• We'll match you with suitable permanent positions</li>
          <li>• Interview preparation and career guidance provided</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Permanent Position Registration
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Join our network of professional candidates
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 px-8 py-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 7 && (
                    <div className={`w-12 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Personal</span>
              <span>Career</span>
              <span>Preferences</span>
              <span>Availability</span>
              <span>Experience</span>
              <span>Education</span>
              <span>Review</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
            {currentStep === 7 && renderStep7()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
              
              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
