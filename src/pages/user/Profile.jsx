import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Camera, Mail, Phone, Building2, BadgeInfo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHero from '../../components/PageHero';

const profileImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

const defaultProfile = {
  name: '',
  email: '',
  phone: '',
  company: '',
  bio: '',
  profileImage: ''
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(defaultProfile);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/users/me');
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        bio: data.bio || '',
        profileImage: data.profileImage || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const resizeImage = (dataUrl) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 512;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not process image'));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => reject(new Error('Could not read image'));
    image.src = dataUrl;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please choose an image smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resizedImage = await resizeImage(reader.result);
        setProfile((current) => ({ ...current, profileImage: resizedImage }));
      } catch (error) {
        toast.error('Failed to process image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await api.patch('/users/me', profile);
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          bio: data.bio,
          profileImage: data.profileImage
        }));
      }
      toast.success('Profile updated');
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        bio: data.bio || '',
        profileImage: data.profileImage || ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHero
        eyebrow="Profile Settings"
        title="Manage your account identity, business details, and profile presence."
        description="Keep your profile updated with a photo, company information, and a short bio so the workspace feels personal and professional."
        image={profile.profileImage || profileImage}
        stats={[
          { label: 'account', value: profile.name || 'Profile' },
          { label: 'company', value: profile.company || 'Not set' },
          { label: 'photo', value: profile.profileImage ? 'Uploaded' : 'Pending' }
        ]}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </PageHero>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name || 'Profile'}
                  className="h-40 w-40 rounded-[1.75rem] object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-[1.75rem] bg-[var(--brand-soft)] text-5xl font-semibold text-[var(--brand)]">
                  {(profile.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-[var(--brand)] p-3 text-white shadow-lg">
                <Camera size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <h2 className="mt-5 text-xl font-semibold">{profile.name || 'Your Name'}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{profile.email || 'you@example.com'}</p>
            <p className="mt-4 text-xs text-[var(--text-muted)]">Use the camera button to upload a profile photo.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField icon={BadgeInfo} label="Full Name" name="name" value={profile.name} onChange={handleChange} required />
            <InputField icon={Mail} label="Email" name="email" value={profile.email} onChange={handleChange} disabled />
            <InputField icon={Phone} label="Phone" name="phone" value={profile.phone} onChange={handleChange} />
            <InputField icon={Building2} label="Company" name="company" value={profile.company} onChange={handleChange} />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Bio</label>
            <textarea
              rows="6"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell the admin more about your role, experience, or delivery needs."
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function InputField({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          {...props}
          className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] py-3 pl-11 pr-4 text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
        />
      </div>
    </div>
  );
}
