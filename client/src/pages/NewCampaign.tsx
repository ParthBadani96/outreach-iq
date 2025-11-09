import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export default function NewCampaign() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    resumeId: '',
    companyName: '',
    jobTitle: '',
    emailTone: {
      formality: 0,
      energy: 0,
      humor: 0,
      preset: 'balanced'
    }
  });

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const res = await fetch('/api/resumes');
      return res.json();
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      return res.json();
    },
    onSuccess: () => {
      setLocation('/campaigns');
    },
  });

  const handleSubmit = () => {
    createCampaign.mutate(formData);
  };

  const tonePresets = {
    casual: { formality: -0.7, energy: 0.5, humor: 0.6, preset: 'casual' },
    professional: { formality: 0.7, energy: 0, humor: -0.5, preset: 'professional' },
    balanced: { formality: 0, energy: 0, humor: 0, preset: 'balanced' },
    energetic: { formality: -0.3, energy: 0.8, humor: 0.7, preset: 'energetic' },
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Campaign</h1>

        <div className="bg-white shadow rounded-lg p-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Select Resume</span>
              <span>Job Details</span>
              <span>Email Tone</span>
            </div>
          </div>

          {/* Step 1: Resume */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Select Your Resume</h2>
              {resumes?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No resumes uploaded yet</p>
                  <a href="/resumes" className="text-blue-600 hover:text-blue-700">Upload a resume first →</a>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes?.map((resume: any) => (
                    <label key={resume.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="resume"
                        value={resume.id}
                        checked={formData.resumeId === resume.id}
                        onChange={(e) => setFormData({ ...formData, resumeId: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{resume.fileName}</div>
                        <div className="text-sm text-gray-500">{resume.skills.length} skills • {resume.experience.length} experiences</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.resumeId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Job Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Anthropic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.companyName || !formData.jobTitle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Tone */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Email Tone</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(tonePresets).map(([key, tone]) => (
                  <button
                    key={key}
                    onClick={() => setFormData({ ...formData, emailTone: tone })}
                    className={`p-4 border-2 rounded-lg text-left hover:border-blue-500 ${
                      formData.emailTone.preset === key ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium capitalize">{key}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {key === 'casual' && 'Friendly and conversational'}
                      {key === 'professional' && 'Formal and polished'}
                      {key === 'balanced' && 'Professional yet approachable'}
                      {key === 'energetic' && 'High energy and enthusiastic'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createCampaign.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
