import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Input from '@/shared/Input';
import FormItem from '@/app/(site)/[lang]/add-session/FormItem';
import ButtonPrimary from '@/shared/ButtonPrimary';
import toast from 'react-hot-toast';
import { CompanyType, PayoutMethod } from '@prisma/client';
import { 
  FaUser, FaBriefcase, FaFileInvoiceDollar, FaLink, FaIdCard, 
  FaUpload, FaTimes /* , FaImages */ 
} from 'react-icons/fa';
import { /* slugifyUsername, */ generateUniqueUsername } from '@/utils/slugify';
import debounce from 'lodash/debounce';

const VALIDATION_MESSAGES = {
  name: {
    required: 'Display name is required'
  },
  username: {
    required: 'Username is required',
    format: 'Username can only contain letters, numbers, and hyphens',
    length: 'Username must be between 3 and 30 characters',
    available: 'This username is not available',
    invalid: 'Invalid username format'
  },
  bio: {
    required: 'Bio is required',
    maxLength: 'Bio cannot exceed 500 characters'
  }
};

export default function ExpertVerificationForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  console.log("Session data:", session);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(session?.user?.image || "");
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    // Basic Information
    profileImage: null as File | null,
    name: session?.user?.name || '',
    username: session?.user?.username || '',
    bio: session?.user?.bio || '',

    // Professional / Business Information
    expertise: [] as string[],
    yearsOfExperience: '',
    languages: [] as string[],
    expertCategories: [] as string[],
    hourlyRate: '',
    cancellationPolicy: '',

    companyType: '' as CompanyType | '',
    companyName: '',
    registrationNumber: '',
    businessAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Germany',
    },

    // Tax Information
    vatId: '',
    taxId: '',
    ustIdNr: '',
    steuernummer: '',

    // Payment Information
    payoutMethod: PayoutMethod.SEPA as PayoutMethod,
    bankAccountHolder: '',
    iban: '',
    bic: '',

    // Social & Documents
    socialLinks: {
      linkedin: '',
      portfolio: '',
      website: ''
    },
    businessDocuments: {
      identityProof: '',
      qualificationCertificates: [] as string[],
      businessRegistration: '',
      taxRegistration: ''
    }
  });

  console.log("Component rendered with session:", session?.user);

  useEffect(() => {
    console.log("Session data:", session?.user);
    if (session?.user) {
      const username = session.user.username || '';
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        username: username,
        bio: session.user.bio || '',
      }));
      if (!username && session.user.name) {
        // Generate username if not present
        handleNameChange(session.user.name);
      }
      setProfilePhoto(session.user.image || "");
    }
  }, [session]);

  console.log("Form data:", formData);

  useEffect(() => {
    console.log("Session changed:", {
      sessionUser: session?.user,
      bio: session?.user?.bio
    });
  }, [session]);

  useEffect(() => {
    if (session?.user?.name && !formData.username) {
      handleNameChange(session.user.name);
    }
  }, [session?.user?.name]);

  const totalSteps = 5;
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for step 1
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error(VALIDATION_MESSAGES.name.required);
        return;
      }
      if (!formData.username.trim()) {
        toast.error(VALIDATION_MESSAGES.username.required);
        return;
      }
      if (!formData.bio.trim()) {
        toast.error(VALIDATION_MESSAGES.bio.required);
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    // Submit on the final step
    setLoading(true);

    try {
      const res = await fetch('/api/user/verify-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // const data = await res.json();
        await update({
          ...session,
          user: {
            ...session?.user,
            role: 'EXPERT'
          }
        });
        toast.success('Successfully verified as an expert!');
        router.push('/add-session/1');
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error(VALIDATION_MESSAGES.name.required);
        return;
      }
      if (!formData.username.trim()) {
        toast.error(VALIDATION_MESSAGES.username.required);
        return;
      }
      if (!formData.bio.trim()) {
        toast.error(VALIDATION_MESSAGES.bio.required);
        return;
      }
    }

    // Move to next step if not on final step
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const steps = [
    { id: 1, title: 'Professional Info', icon: FaUser },
    { id: 2, title: 'Business Details', icon: FaBriefcase },
    { id: 3, title: 'Payment Info', icon: FaFileInvoiceDollar },
    { id: 4, title: 'Social & Documents', icon: FaLink },
    { id: 5, title: 'Verification', icon: FaIdCard }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0];
    if (selectedFile) {
      setProfilePhoto(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
      setFormData({ ...formData, profileImage: selectedFile });
    }
  };

  const renderProfessionalInfo = () => {
    console.log("Rendering form with bio:", formData.bio);
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Profile Image - 3 columns */}
          <div className="col-span-3">
            <FormItem
              label="Profile Image"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32">
                  {profilePhoto || session?.user?.image ? (
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <img
                        src={profilePhoto ? 
                          (profilePhoto.startsWith("http") ? profilePhoto : URL.createObjectURL(file!))
                          : session?.user?.image!
                        }
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setProfilePhoto("");
                          setFile(null);
                          setFormData({ ...formData, profileImage: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                      <FaUser className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                  />
                  <span className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                    <FaUpload className="mr-2" /> {file ? "Change Photo" : "Upload Photo"}
                  </span>
                </label>
              </div>
            </FormItem>
          </div>

          {/* Name and Username - 4 columns */}
          <div className="col-span-4 space-y-4">
            <FormItem
              label={
                <div className="flex items-center">
                  Display Name<span className="text-red-500 ml-1">*</span>
                </div>
              }
              desc="Your public display name"
              error={!formData.name.trim() ? VALIDATION_MESSAGES.name.required : ''}
            >
              <Input
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full p-3"
              />
            </FormItem>

            <FormItem
              label="Username"
              desc="Your unique profile URL"
              error={errors.username}
            >
              <div className="flex items-center">
                <span className="text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-2.5 rounded-l-lg border border-r-0 border-neutral-200 dark:border-neutral-700">
                  expert/
                </span>
                <Input
                  className="rounded-l-none"
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setFormData(prev => ({ ...prev, username: value }));
                    handleUsernameChange(value);
                  }}
                  onBlur={() => {
                    if (!formData.username) {
                      setErrors(prev => ({ 
                        ...prev, 
                        username: VALIDATION_MESSAGES.username.required 
                      }));
                    }
                  }}
                />
              </div>
            </FormItem>
          </div>

          {/* Bio - 5 columns */}
          <div className="col-span-5">
            <FormItem
              label="Professional Bio"
              desc="Tell others about your expertise (max 500 chars)"
            >
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your expertise and experience..."
                className="w-full h-[130px] px-4 py-3 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-neutral-900 transition-all duration-200 resize-none"
                maxLength={500}
              />
              <div className="text-right text-sm text-neutral-500 mt-1">
                {formData.bio.length}/500
              </div>
            </FormItem>
          </div>
        </div>
      </div>
    );
  };

  const renderBusinessDetails = () => {
    return (
      <div className="space-y-8">
        <FormItem label="Expertise (comma separated)">
          <Input
            placeholder="e.g., Web Development, Design"
            value={formData.expertise.join(', ')}
            onChange={(e) =>
              setFormData({ 
                ...formData, 
                expertise: e.target.value.split(',').map(item => item.trim()) 
              })
            }
          />
        </FormItem>
        
        <FormItem label="Years of Experience">
          <Input
            type="number"
            placeholder="e.g., 5"
            value={formData.yearsOfExperience}
            onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
          />
        </FormItem>

        <FormItem label="Languages (comma separated)">
          <Input
            placeholder="e.g., English, German"
            value={formData.languages.join(', ')}
            onChange={(e) =>
              setFormData({ 
                ...formData, 
                languages: e.target.value.split(',').map(item => item.trim()) 
              })
            }
          />
        </FormItem>

        <FormItem label="Expert Categories (comma separated)">
          <Input
            placeholder="e.g., Design, Business"
            value={formData.expertCategories.join(', ')}
            onChange={(e) =>
              setFormData({ 
                ...formData, 
                expertCategories: e.target.value.split(',').map(item => item.trim()) 
              })
            }
          />
        </FormItem>

        <FormItem label="Hourly Rate (€)">
          <Input
            type="number"
            placeholder="e.g., 50"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
          />
        </FormItem>

        <FormItem label="Cancellation Policy">
          <Input
            placeholder="Describe your cancellation terms"
            value={formData.cancellationPolicy}
            onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
          />
        </FormItem>

        <FormItem label="Company Type">
          <Input
            placeholder="e.g., EINZELUNTERNEHMEN"
            value={formData.companyType}
            onChange={(e) => setFormData({ ...formData, companyType: e.target.value as CompanyType })}
          />
        </FormItem>

        <FormItem label="Company Name">
          <Input
            placeholder="Your Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </FormItem>

        <FormItem label="Registration Number">
          <Input
            placeholder="e.g., HRB123456"
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
          />
        </FormItem>

        <FormItem label="Business Address">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Street"
              value={formData.businessAddress.street}
              onChange={(e) => 
                setFormData({ 
                  ...formData, 
                  businessAddress: { 
                    ...formData.businessAddress, 
                    street: e.target.value 
                  } 
                })
              }
            />
            <Input
              placeholder="City"
              value={formData.businessAddress.city}
              onChange={(e) => 
                setFormData({ 
                  ...formData, 
                  businessAddress: { 
                    ...formData.businessAddress, 
                    city: e.target.value 
                  } 
                })
              }
            />
            <Input
              placeholder="Postal Code"
              value={formData.businessAddress.postalCode}
              onChange={(e) => 
                setFormData({ 
                  ...formData, 
                  businessAddress: { 
                    ...formData.businessAddress, 
                    postalCode: e.target.value 
                  } 
                })
              }
            />
            <Input
              placeholder="Country"
              value={formData.businessAddress.country}
              onChange={(e) => 
                setFormData({ 
                  ...formData, 
                  businessAddress: { 
                    ...formData.businessAddress, 
                    country: e.target.value 
                  } 
                })
              }
            />
          </div>
        </FormItem>
      </div>
    );
  };

  const renderPaymentInfo = () => {
    return (
      <div className="space-y-6">
        <FormItem label="Payout Method">
          <select
            className="w-full p-3 border rounded-lg"
            value={formData.payoutMethod}
            onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value as PayoutMethod })}
          >
            <option value={PayoutMethod.SEPA}>SEPA</option>
            <option value={PayoutMethod.PAYPAL}>PayPal</option>
            <option value={PayoutMethod.WISE}>Wise</option>
            <option value={PayoutMethod.OTHER}>Other</option>
          </select>
        </FormItem>

        <FormItem label="Bank Account Holder">
          <Input
            value={formData.bankAccountHolder}
            onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
          />
        </FormItem>

        <FormItem label="IBAN">
          <Input
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
          />
        </FormItem>

        <FormItem label="BIC">
          <Input
            value={formData.bic}
            onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
          />
        </FormItem>
      </div>
    );
  };

  const renderSocialAndDocuments = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LinkedIn */}
          <FormItem
            label="LinkedIn Profile"
            desc="Your professional LinkedIn URL"
          >
            <div className="flex items-center">
              <span className="text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-2.5 rounded-l-lg border border-r-0 border-neutral-200 dark:border-neutral-700">
                linkedin.com/in/
              </span>
              <Input
                className="rounded-l-none"
                placeholder="username"
                value={formData.socialLinks.linkedin}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                })}
              />
            </div>
          </FormItem>

          {/* Portfolio */}
          <FormItem
            label="Portfolio"
            desc="Your work portfolio URL"
          >
            <Input
              placeholder="https://"
              value={formData.socialLinks.portfolio}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, portfolio: e.target.value }
              })}
            />
          </FormItem>

          {/* Website */}
          <FormItem
            label="Personal Website"
            desc="Your personal or business website"
          >
            <Input
              placeholder="https://"
              value={formData.socialLinks.website}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, website: e.target.value }
              })}
            />
          </FormItem>
        </div>

        <FormItem label="Business Documents">
          <div className="space-y-4">
            <Input
              placeholder="Identity Proof (URL or Path)"
              value={formData.businessDocuments.identityProof}
              onChange={(e) => setFormData({
                ...formData,
                businessDocuments: { ...formData.businessDocuments, identityProof: e.target.value }
              })}
            />
            <Input
              placeholder="Business Registration (URL or Path)"
              value={formData.businessDocuments.businessRegistration}
              onChange={(e) => setFormData({
                ...formData,
                businessDocuments: { ...formData.businessDocuments, businessRegistration: e.target.value }
              })}
            />
            <Input
              placeholder="Tax Registration (URL or Path)"
              value={formData.businessDocuments.taxRegistration}
              onChange={(e) => setFormData({
                ...formData,
                businessDocuments: { ...formData.businessDocuments, taxRegistration: e.target.value }
              })}
            />
            {/* For Qualification Certificates (array) you can implement file uploads or similar */}
          </div>
        </FormItem>
      </div>
    );
  };

  const renderVerification = () => {
    // This step could display a summary or final confirmation before submission
    return (
      <div className="space-y-4">
        <p className="text-neutral-700 dark:text-neutral-300">
          Please review your information before completing verification.
        </p>
        {/* Add any summary fields or additional instructions here */}
      </div>
    );
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  };

  const handleNameChange = async (newName: string) => {
    console.log("Handling name change:", newName);
    setFormData(prev => ({ ...prev, name: newName }));
    
    if (newName.trim()) {
      try {
        const uniqueUsername = await generateUniqueUsername(newName, checkUsernameAvailability);
        console.log("Generated username:", uniqueUsername);
        setFormData(prev => ({ ...prev, username: uniqueUsername }));
      } catch (error) {
        console.error("Error generating username:", error);
      }
    }
  };

  // const debouncedHandleNameChange = debounce(async (newName: string) => {
  //   await handleNameChange(newName);
  // }, 500);

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9-]+$/;
    return (
      username.length >= 3 &&
      username.length <= 30 &&
      usernameRegex.test(username)
    );
  };

  const handleUsernameChange = debounce(async (username: string) => {
    if (!validateUsername(username)) {
      setErrors(prev => ({ 
        ...prev, 
        username: VALIDATION_MESSAGES.username.format 
      }));
      return;
    }

    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) {
      setErrors(prev => ({ 
        ...prev, 
        username: VALIDATION_MESSAGES.username.available 
      }));
    } else {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  }, 500);

  const [errors, setErrors] = useState({
    name: '',
    username: '',
    bio: '',
    // ... other fields
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Build Your Expert Profile
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 mt-1">
          Complete your profile to start hosting sessions and earning
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary-600">{currentStep}</span>
            <span className="text-xl text-neutral-500">/ {totalSteps}</span>
          </div>
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Navigation - Add containment styles */}
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <nav className="flex justify-between relative">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center z-10">
              <button
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                className={`
                  group flex flex-col items-center gap-3 transition-all duration-300
                  ${currentStep > step.id ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${currentStep >= step.id 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-lg' 
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'}
                  ${currentStep > step.id ? 'hover:scale-110' : ''}
                `}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className={`
                  text-sm font-medium hidden md:block transition-colors duration-300
                  ${currentStep >= step.id 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-neutral-500'}
                `}>
                  {step.title}
                </span>
              </button>
            </div>
          ))}

          <div className="absolute top-6 left-0 w-full h-[2px] -z-0">
            <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700" />
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </nav>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {currentStep === 1 && renderProfessionalInfo()}
          {currentStep === 2 && renderBusinessDetails()}
          {currentStep === 3 && renderPaymentInfo()}
          {currentStep === 4 && renderSocialAndDocuments()}
          {currentStep === 5 && renderVerification()}
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <>
              <ButtonPrimary
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 bg-gray-600 hover:bg-gray-700"
              >
                First
              </ButtonPrimary>
              <ButtonPrimary
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 bg-gray-600 hover:bg-gray-700"
              >
                Back To Previous
              </ButtonPrimary>
            </>
          )}
        </div>
        <div className="flex gap-3">
          {currentStep < totalSteps && (
            <ButtonPrimary
              onClick={handleNextStep}
              type="button"
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              Next Step
            </ButtonPrimary>
          )}
          {currentStep === totalSteps && (
            <ButtonPrimary
              type="submit"
              loading={loading}
              className="px-8 bg-navy-600 hover:bg-navy-700"
            >
              Complete Verification
            </ButtonPrimary>
          )}
        </div>
      </div>
    </div>
  );
}
