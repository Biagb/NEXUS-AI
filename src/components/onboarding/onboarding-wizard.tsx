'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label, Textarea, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, useToast } from '@/components/ui';
import { Building2, FileText, Palette, Mic, Upload, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { TONE_OPTIONS, OnboardingData } from '@/types';
import Image from 'next/image';

const STEPS = [
  { id: 1, title: 'Company Info', icon: Building2, description: 'Tell us about your business' },
  { id: 2, title: 'Description', icon: FileText, description: 'What does your company do?' },
  { id: 3, title: 'Branding', icon: Palette, description: 'Upload logo and set colors' },
  { id: 4, title: 'Tone of Voice', icon: Mic, description: 'How should we communicate?' },
];

export function OnboardingWizard() {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<OnboardingData>({
    companyName: '',
    description: '',
    brandColors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
    },
    toneOfVoice: 'Professional',
  });

  const updateFormData = (field: keyof OnboardingData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast('error', 'You must be logged in');
        return;
      }

      let logoUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('branding')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          addToast('error', 'Failed to upload logo');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('branding')
            .getPublicUrl(fileName);
          logoUrl = publicUrl;
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          company_name: formData.companyName,
          description: formData.description,
          logo_url: logoUrl,
          brand_colors: formData.brandColors,
          tone_of_voice: formData.toneOfVoice,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        addToast('error', 'Failed to save profile');
        return;
      }

      addToast('success', 'Profile saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      addToast('error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName.trim().length > 0;
      case 2:
        return formData.description.trim().length > 0;
      case 3:
        return true; // Logo is optional
      case 4:
        return formData.toneOfVoice.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    style={{ width: '60px' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <span
                key={step.id}
                className={`text-xs ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName" required>
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Acme Corporation"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Description */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" required>
                    Company Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Describe what your company does, your products/services, and target audience..."
                    className="mt-1"
                    rows={5}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This helps our AI generate more relevant marketing content.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Branding */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label>Company Logo (optional)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {logoPreview ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        id="logo"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <label htmlFor="logo">
                        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900 h-9 px-4 py-2 cursor-pointer">
                          {logoPreview ? 'Change Logo' : 'Upload Logo'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={formData.brandColors.primary}
                        onChange={(e) =>
                          updateFormData('brandColors', {
                            ...formData.brandColors,
                            primary: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                      />
                      <Input
                        value={formData.brandColors.primary}
                        onChange={(e) =>
                          updateFormData('brandColors', {
                            ...formData.brandColors,
                            primary: e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={formData.brandColors.secondary}
                        onChange={(e) =>
                          updateFormData('brandColors', {
                            ...formData.brandColors,
                            secondary: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                      />
                      <Input
                        value={formData.brandColors.secondary}
                        onChange={(e) =>
                          updateFormData('brandColors', {
                            ...formData.brandColors,
                            secondary: e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <Label>Color Preview</Label>
                  <div className="mt-2 flex gap-2">
                    <div
                      className="w-full h-12 rounded-lg"
                      style={{ backgroundColor: formData.brandColors.primary }}
                    />
                    <div
                      className="w-full h-12 rounded-lg"
                      style={{ backgroundColor: formData.brandColors.secondary }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Tone of Voice */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="toneOfVoice" required>
                    Tone of Voice
                  </Label>
                  <Select
                    id="toneOfVoice"
                    value={formData.toneOfVoice}
                    onChange={(e) => updateFormData('toneOfVoice', e.target.value)}
                    options={TONE_OPTIONS.map((tone) => ({ value: tone, label: tone }))}
                    className="mt-1"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This defines how the AI will write your marketing content.
                  </p>
                </div>

                {/* Tone examples */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Example with &quot;{formData.toneOfVoice}&quot; tone:
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    {getToneExample(formData.toneOfVoice)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isLoading} disabled={!isStepValid()}>
                Complete Setup
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function getToneExample(tone: string): string {
  const examples: Record<string, string> = {
    Professional: 'We are pleased to announce our latest product launch, designed to meet your business needs.',
    Friendly: 'Hey there! We\'ve got something exciting to share with you – check out our newest launch!',
    Casual: 'So we\'ve been working on something cool and figured you\'d want to know about it.',
    Formal: 'It is with great pleasure that we announce the introduction of our latest offering.',
    Playful: '🎉 Guess what? We\'ve cooked up something amazing just for you!',
    Authoritative: 'As industry leaders, we\'re setting the standard with our new product launch.',
    Inspirational: 'Transform your possibilities – discover what\'s waiting for you with our new release.',
    Conversational: 'You know how we\'re always looking for ways to help you out? Well, we\'ve got news!',
  };
  return examples[tone] || examples.Professional;
}
