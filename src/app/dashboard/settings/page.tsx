'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, BrandColors } from '@/types';
import { Button, Input, Label, Textarea, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, useToast, LoadingScreen } from '@/components/ui';
import { TONE_OPTIONS } from '@/types';
import { Save, Upload } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const supabase = createClient();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    brandColors: { primary: '#3B82F6', secondary: '#1E40AF' } as BrandColors,
    toneOfVoice: 'Professional',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setProfile(data);
        setFormData({
          companyName: data.company_name || '',
          description: data.description || '',
          brandColors: data.brand_colors || { primary: '#3B82F6', secondary: '#1E40AF' },
          toneOfVoice: data.tone_of_voice || 'Professional',
        });
        setLogoPreview(data.logo_url);
      } catch (error) {
        console.error('Error fetching profile:', error);
        addToast('error', 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, addToast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast('error', 'You must be logged in');
        return;
      }

      let logoUrl = profile?.logo_url;

      // Upload new logo if provided
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

      if (updateError) throw updateError;

      addToast('success', 'Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      addToast('error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading settings..." />;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Settings</h1>
        <p className="text-[#64748B] mt-1">
          Manage your company profile and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              This information is used to personalize your marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName" required>Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              Customize your brand appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div>
              <Label>Company Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E2E8F0]">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-[#CBD5E1] flex items-center justify-center">
                    <Upload className="w-8 h-8 text-[#94A3B8]" />
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
                    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-[#CBD5E1] bg-white shadow-sm hover:bg-[#F8FAFC] hover:text-[#1E293B] h-9 px-4 py-2 cursor-pointer">
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={formData.brandColors.primary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandColors: { ...formData.brandColors, primary: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded cursor-pointer border border-[#E2E8F0]"
                  />
                  <Input
                    value={formData.brandColors.primary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandColors: { ...formData.brandColors, primary: e.target.value },
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
                      setFormData({
                        ...formData,
                        brandColors: { ...formData.brandColors, secondary: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded cursor-pointer border border-[#E2E8F0]"
                  />
                  <Input
                    value={formData.brandColors.secondary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandColors: { ...formData.brandColors, secondary: e.target.value },
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tone of Voice */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Style</CardTitle>
            <CardDescription>
              Define how AI should write your marketing content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="toneOfVoice">Tone of Voice</Label>
              <Select
                id="toneOfVoice"
                value={formData.toneOfVoice}
                onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value })}
                options={TONE_OPTIONS.map((tone) => ({ value: tone, label: tone }))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button type="submit" isLoading={isSaving} className="w-full gradient-ai text-white border-0 shadow-md shadow-blue-500/25">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </form>
    </div>
  );
}
