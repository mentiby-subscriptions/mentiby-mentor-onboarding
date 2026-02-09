import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const degreeOptions = ['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'M.Tech', 'MCA', 'Other'];
const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'];
const accountTypeOptions = ['Savings', 'Current'];
const hoursOptions = ['1-2 hours', '2-4 hours', '4-6 hours', '6+ hours'];

interface FormData {
  name: string;
  mobileNumber: string;
  emailAddress: string;
  mentorAccessPassword: string;
  dateOfBirth: string;
  gender: string;
  currentState: string;
  currentCity: string;
  collegeName: string;
  degree: string;
  currentYear: string;
  expertise: string;
  projects: string;
  currentCompany: string;
  linkedin: string;
  github: string;
  fullStackInterest: string;
  hoursPerDay: string;
  aadharNumber: string;
  panCardNumber: string;
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountType: string;
  ifscCode: string;
  bankAccountNumber: string;
  upiId: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  agreeConfidentiality: boolean;
  agreeDiscipline: boolean;
  authorizeDataUse: boolean;
  digitalSignature: string;
  agreeTerms: boolean;
}

export default function MentorOnboardingForm() {
  const [form, setForm] = useState<FormData>({
    name: '',
    mobileNumber: '',
    emailAddress: '',
    mentorAccessPassword: '',
    dateOfBirth: '',
    gender: '',
    currentState: '',
    currentCity: '',
    collegeName: '',
    degree: '',
    currentYear: '',
    expertise: '',
    projects: '',
    currentCompany: '',
    linkedin: '',
    github: '',
    fullStackInterest: '',
    hoursPerDay: '',
    aadharNumber: '',
    panCardNumber: '',
    bankName: '',
    branchName: '',
    accountHolderName: '',
    accountType: '',
    ifscCode: '',
    bankAccountNumber: '',
    upiId: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    agreeConfidentiality: false,
    agreeDiscipline: false,
    authorizeDataUse: false,
    digitalSignature: '',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);

  // Check for existing submission token on component mount
  useEffect(() => {
    const checkSubmissionStatus = () => {
      if (typeof window !== 'undefined') {
        const submissionToken = localStorage.getItem('mentiby_mentor_submission_token');
        if (submissionToken) {
          setHasSubmitted(true);
          setSuccess(true);
          // Also retrieve stored mentor ID
          const storedMentorId = localStorage.getItem('mentiby_mentor_id');
          if (storedMentorId) {
            setMentorId(storedMentorId);
          }
        }
      }
    };

    checkSubmissionStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Verify mentor access password via backend (password is NEVER exposed in frontend code)
      const passwordResponse = await fetch('/api/verify-mentor-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: form.mentorAccessPassword,
        }),
      });

      if (!passwordResponse.ok) {
        const data = await passwordResponse.json().catch(() => null);
        const msg =
          (data && (data.error as string)) ||
          'Invalid mentor access password. Please contact MentiBY.';
        throw new Error(msg);
      }

      // Validate all required agreements
      if (!form.agreeConfidentiality || !form.agreeDiscipline || !form.authorizeDataUse || !form.agreeTerms) {
        throw new Error('Please accept all required agreements before submitting.');
      }

      if (!form.digitalSignature.trim()) {
        throw new Error('Please provide your digital signature (full name).');
      }

      // Check if email already exists
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('Mentor Details')
        .select('"Email address"')
        .eq('Email address', form.emailAddress)
        .limit(1);

      if (emailCheckError) {
        console.error('Error checking email:', emailCheckError);
        throw new Error('Unable to verify email. Please try again.');
      }

      if (existingUser && existingUser.length > 0) {
        setError('duplicate');
        setSuccess(true);
        setHasSubmitted(true);
        
        const submissionToken = `mentiby_mentor_duplicate_${form.emailAddress}_${Date.now()}`;
        if (typeof window !== 'undefined') {
          localStorage.setItem('mentiby_mentor_submission_token', submissionToken);
        }
        return;
      }

      // Prepare data for Supabase matching the schema
      const submissionData = {
        'Name': form.name,
        'Mobile number': form.mobileNumber ? parseInt(form.mobileNumber) : null,
        'Email address': form.emailAddress,
        'Date of Birth (DOB)': form.dateOfBirth,
        'Gender': form.gender,
        'Current state': form.currentState,
        'Current city': form.currentCity,
        'College name:': form.collegeName,
        'Degree': form.degree,
        'Current Year': form.currentYear,
        'Expertise': form.expertise,
        'Projects?': form.projects,
        'Current Company': form.currentCompany || null,
        'LinkedIn': form.linkedin || null,
        'GitHub': form.github || null,
        'Full Stack Project Interest?': form.fullStackInterest,
        'How many hours per day can you dedicate to the Mentiby Full Sta': form.hoursPerDay,
        'Aadhar Number': form.aadharNumber ? parseInt(form.aadharNumber) : null,
        'PAN Card Number': form.panCardNumber,
        'Bank Name': form.bankName,
        'Branch Name': form.branchName,
        'Account holder name': form.accountHolderName,
        'Account Type': form.accountType,
        'IFSC Code': form.ifscCode,
        'Bank Account Number': form.bankAccountNumber ? parseInt(form.bankAccountNumber) : null,
        'UPI ID (Optional)': form.upiId || null,
        'Emergency Contact Name': form.emergencyContactName,
        'Emergency Contact Number': form.emergencyContactNumber ? parseInt(form.emergencyContactNumber) : null,
        'I agree to maintain confidentiality and not disclose any intern': form.agreeConfidentiality ? 'Yes' : 'No',
        'I agree to maintain discipline, punctuality, and contribute act': form.agreeDiscipline ? 'Yes' : 'No',
        'I authorize MentiBY to use the above information solely for int': form.authorizeDataUse ? 'Yes' : 'No',
        'Digital Signature: (Type your full name)': form.digitalSignature,
        'I agree to the terms & conditions mentioned above': form.agreeTerms ? 'Yes' : 'No',
      };

      console.log('Submitting mentor data:', submissionData);

      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('Mentor Details')
        .insert([submissionData])
        .select();

      if (insertError) {
        console.error('Supabase error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }

      console.log('Success! Inserted data:', data);

      // Get the mentor_id from the response
      const newMentorId = data?.[0]?.mentor_id;

      // Create unique submission token and save to localStorage
      const submissionToken = `mentiby_mentor_${form.emailAddress}_${Date.now()}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mentiby_mentor_submission_token', submissionToken);
        localStorage.setItem('mentiby_mentor_submission_date', new Date().toISOString());
        if (newMentorId) {
          localStorage.setItem('mentiby_mentor_id', newMentorId.toString());
        }
      }

      // Set state for display
      if (newMentorId) {
        setMentorId(newMentorId.toString());
      }

      // Send welcome email
      try {
        const emailResponse = await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            email: form.emailAddress,
            mentorId: newMentorId?.toString() || '',
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send welcome email');
        } else {
          console.log('Welcome email sent successfully!');
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the submission if email fails
      }

      setSuccess(true);
      setHasSubmitted(true);

    } catch (err: any) {
      console.error('Submission error:', err);
      if (err.message !== 'duplicate') {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If user has already submitted, show success state directly
  if (hasSubmitted || success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 relative overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => {
            const left = ((i * 37 + 13) % 100);
            const top = ((i * 43 + 17) % 100);
            const delay = (i * 0.7) % 5;
            const duration = 3 + (i % 4);

            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-60 animate-float"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              ></div>
            );
          })}
        </div>

        {/* Success Page - Full Screen */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-8">
            {error === 'duplicate' ? (
              // Already Registered Message
              <>
                {/* Warning Animation */}
                <div className="mb-12 animate-fadeIn">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-6xl">⚠️</span>
                    </div>
                    <div className="absolute inset-0">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-3 h-3 bg-gradient-to-r from-red-400 to-orange-400 rounded-full animate-ping"
                          style={{
                            left: `${25 + (i * 12)}%`,
                            top: `${25 + ((i % 2) * 50)}%`,
                            animationDelay: `${i * 0.4}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8 animate-fadeIn">
                  <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
                    Already Registered
                  </h1>

                  <div className="h-4 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-full animate-pulse shadow-lg max-w-2xl mx-auto"></div>

                  <p className="text-2xl md:text-3xl text-gray-100 font-light tracking-wide leading-relaxed">
                    ⚠️ This email is already registered as a mentor
                  </p>

                  <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/30 backdrop-blur-sm">
                    <p className="text-xl text-red-200 font-semibold mb-4">
                      🚫 Duplicate Registration Detected
                    </p>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Your email address is already associated with an existing mentor registration. 
                      If you believe this is an error, please contact MentiBY support.
                    </p>
                  </div>

                  <div className="mt-16 space-y-6">
                    <div className="flex justify-center space-x-8 text-5xl">
                      <span className="animate-bounce" style={{ animationDelay: '0s' }}>📧</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>⚠️</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🔒</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>💬</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Normal Success Message
              <>
                {/* Success Animation */}
                <div className="mb-12 animate-fadeIn">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-6xl">🎉</span>
                    </div>
                    <div className="absolute inset-0">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping"
                          style={{
                            left: `${20 + (i * 15)}%`,
                            top: `${20 + ((i % 2) * 60)}%`,
                            animationDelay: `${i * 0.3}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8 animate-fadeIn">
                  <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
                    Welcome, Mentor!
                  </h1>

                  <div className="h-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full animate-pulse shadow-lg max-w-2xl mx-auto"></div>

                  <p className="text-3xl md:text-4xl text-gray-100 font-light tracking-wide leading-relaxed">
                    🚀 Your mentor journey begins now!
                  </p>

                  <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Thank you for joining the MentiBY family! We're thrilled to have you as a mentor. 
                    You'll receive further instructions via email soon.
                  </p>

                  <div className="mt-16 space-y-6">
                    <div className="flex justify-center space-x-8 text-6xl">
                      <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎯</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🚀</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>💫</span>
                    </div>

                    <p className="text-lg text-purple-200">
                      Check your email for next steps and onboarding information!
                    </p>

                    {/* Show Mentor ID */}
                    {mentorId && (
                      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                        <p className="text-purple-200 font-semibold mb-2">
                          Your Mentor ID:
                        </p>
                        <p className="text-4xl font-bold text-cyan-300">
                          {mentorId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
            33% { transform: translateY(-15px) rotate(120deg) scale(1.1); }
            66% { transform: translateY(-8px) rotate(240deg) scale(0.9); }
          }
          
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const left = ((i * 37 + 13) % 100);
          const top = ((i * 43 + 17) % 100);
          const delay = (i * 0.7) % 5;
          const duration = 3 + (i % 4);

          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-60 animate-float"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            ></div>
          );
        })}
      </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-6 animate-gradient drop-shadow-2xl">
                MentiBY
              </h1>
              <div className="h-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full animate-pulse shadow-lg"></div>
            </div>
          <p className="text-gray-200 text-2xl mt-10 font-light tracking-wide">Mentor Onboarding Form ✨</p>
          </div>

          {/* Glassmorphism Form Container */}
          <div className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 rounded-3xl border border-white/20 shadow-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/30 via-purple-400/30 to-pink-400/30 blur-lg animate-pulse"></div>

            <div className="relative z-10">
              <form className="space-y-12" onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="space-y-8">
                  <div className="flex items-center mb-10">
                    <div className="w-4 h-12 bg-gradient-to-b from-cyan-400 to-purple-600 rounded-full mr-6 shadow-lg animate-pulse"></div>
                    <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text">
                      Personal Information
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Full Name */}
                    <div className="form-group group">
                      <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-purple-100 font-black tracking-wide">Full Name</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                          required
                        name="name"
                        value={form.name}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                          placeholder="Enter your full name"
                        />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-purple-100 font-black tracking-wide">Mobile Number</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <input
                        required
                        name="mobileNumber"
                        type="tel"
                        pattern="[0-9]{10}"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter 10-digit mobile number"
                      />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="form-group group">
                      <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-purple-100 font-black tracking-wide">Email Address</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                          required
                        name="emailAddress"
                          type="email"
                        value={form.emailAddress}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                  {/* Date of Birth */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-purple-100 font-black tracking-wide">Date of Birth</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <input
                        required
                        name="dateOfBirth"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-purple-100 font-black tracking-wide">Gender</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <select
                        required
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                      >
                        <option value="">Select Gender</option>
                        {genderOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Current State */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-purple-100 font-black tracking-wide">Current State</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <input
                        required
                        name="currentState"
                        value={form.currentState}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter your state"
                      />
                    </div>
                  </div>

                  {/* Current City */}
                    <div className="form-group group md:col-span-2">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-purple-100 font-black tracking-wide">Current City</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                          required
                        name="currentCity"
                        value={form.currentCity}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter your city"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gradient Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>

              {/* Education & Professional Section */}
                <div className="space-y-8">
                  <div className="flex items-center mb-10">
                    <div className="w-4 h-12 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full mr-6 shadow-lg animate-pulse"></div>
                    <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text">
                    Education & Professional
                    </h2>
                  </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* College Name */}
                    <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">College Name</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                        required
                        name="collegeName"
                        value={form.collegeName}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter your college name"
                        />
                      </div>
                    </div>

                  {/* Degree */}
                    <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Degree</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <select
                        required
                        name="degree"
                        value={form.degree}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                      >
                        <option value="">Select Degree</option>
                        {degreeOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Current Year */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Current Year</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <select
                        required
                        name="currentYear"
                        value={form.currentYear}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                      >
                        <option value="">Select Year</option>
                        {yearOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Expertise */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Expertise</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                        required
                        name="expertise"
                        value={form.expertise}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="e.g., React, Node.js, Python"
                        />
                      </div>
                    </div>

                  {/* Projects */}
                    <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Have you built projects?</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <select
                        required
                        name="projects"
                        value={form.projects}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                      >
                        <option value="">Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>

                  {/* Current Company */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Current Company</span></label>
                      <div className="relative">
                        <input
                        name="currentCompany"
                        value={form.currentCompany}
                          onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="If employed, enter company name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              {/* Gradient Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent"></div>

              {/* Social Profiles Section */}
                <div className="space-y-8">
                  <div className="flex items-center mb-10">
                    <div className="w-4 h-12 bg-gradient-to-b from-pink-400 to-orange-600 rounded-full mr-6 shadow-lg animate-pulse"></div>
                    <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text">
                    Social Profiles
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                  {/* LinkedIn */}
                    <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">LinkedIn Profile</span></label>
                      <div className="relative">
                        <input
                        name="linkedin"
                        value={form.linkedin}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="LinkedIn URL"
                        />
                      </div>
                    </div>

                  {/* GitHub */}
                    <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">GitHub Profile</span></label>
                      <div className="relative">
                        <input
                        name="github"
                        value={form.github}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="GitHub URL"
                        />
                    </div>
                  </div>
                      </div>
                    </div>

              {/* Gradient Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"></div>

              {/* Availability Section */}
              <div className="space-y-8">
                <div className="flex items-center mb-10">
                  <div className="w-4 h-12 bg-gradient-to-b from-orange-400 to-red-600 rounded-full mr-6 shadow-lg animate-pulse"></div>
                  <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text">
                    Availability & Interest
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Full Stack Project Interest */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Full Stack Project Interest?</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <select
                        required
                        name="fullStackInterest"
                        value={form.fullStackInterest}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                      >
                        <option value="">Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Maybe">Maybe</option>
                      </select>
                    </div>
                  </div>

                  {/* Hours per Day */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Hours per day for MentiBY?</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <select
                        required
                        name="hoursPerDay"
                        value={form.hoursPerDay}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                      >
                        <option value="">Select hours</option>
                        {hoursOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent"></div>

              {/* Bank & Financial Details Section */}
              <div className="space-y-8">
                <div className="flex items-center mb-10">
                  <div className="w-4 h-12 bg-gradient-to-b from-red-400 to-pink-600 rounded-full mr-6 shadow-lg animate-pulse"></div>
                  <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text">
                    Bank & Financial Details
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Aadhar Number */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Aadhar Number</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                        required
                        name="aadharNumber"
                        type="text"
                        pattern="[0-9]{12}"
                        value={form.aadharNumber}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="12-digit Aadhar number"
                        />
                      </div>
                    </div>

                  {/* PAN Card Number */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">PAN Card Number</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                        required
                        name="panCardNumber"
                        value={form.panCardNumber}
                          onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm uppercase"
                        placeholder="e.g., ABCDE1234F"
                        />
                      </div>
                    </div>

                  {/* Bank Name */}
                    <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Bank Name</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                        required
                        name="bankName"
                        value={form.bankName}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter bank name"
                        />
                      </div>
                    </div>

                  {/* Branch Name */}
                    <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Branch Name</span> <span className="text-pink-400 font-black">*</span></label>
                      <div className="relative">
                        <input
                          required
                        name="branchName"
                        value={form.branchName}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter branch name"
                        />
                      </div>
                    </div>

                  {/* Account Holder Name */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Account Holder Name</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <input
                        required
                        name="accountHolderName"
                        value={form.accountHolderName}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Name as on bank account"
                      />
                  </div>
                </div>

                  {/* Account Type */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Account Type</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <select
                        required
                        name="accountType"
                        value={form.accountType}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                      >
                        <option value="">Select Account Type</option>
                        {accountTypeOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* IFSC Code */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">IFSC Code</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <input
                        required
                        name="ifscCode"
                        value={form.ifscCode}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm uppercase"
                        placeholder="e.g., SBIN0001234"
                      />
                    </div>
                  </div>

                  {/* Bank Account Number */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Bank Account Number</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                            <input
                        required
                        name="bankAccountNumber"
                        type="text"
                        value={form.bankAccountNumber}
                              onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter bank account number"
                      />
                    </div>
                              </div>

                  {/* UPI ID */}
                  <div className="form-group group md:col-span-2">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">UPI ID</span> <span className="text-gray-400">(Optional)</span></label>
                    <div className="relative">
                      <input
                        name="upiId"
                        value={form.upiId}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="e.g., yourname@upi"
                      />
                    </div>
                  </div>
                </div>
                              </div>

              {/* Gradient Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent"></div>

              {/* Emergency Contact Section */}
              <div className="space-y-8">
                <div className="flex items-center mb-10">
                  <div className="w-4 h-12 bg-gradient-to-b from-pink-400 to-purple-600 rounded-full mr-6 shadow-lg animate-pulse"></div>
                  <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text">
                    Emergency Contact
                  </h2>
                              </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Emergency Contact Name */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Emergency Contact Name</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <input
                        required
                        name="emergencyContactName"
                        value={form.emergencyContactName}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter emergency contact name"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Number */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Emergency Contact Number</span> <span className="text-pink-400 font-black">*</span></label>
                    <div className="relative">
                      <input
                        required
                        name="emergencyContactNumber"
                        type="tel"
                        pattern="[0-9]{10}"
                        value={form.emergencyContactNumber}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter 10-digit phone number"
                      />
                    </div>
                    </div>
                  </div>
                </div>

                {/* Gradient Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>

              {/* Agreements Section */}
                <div className="space-y-8">
                  <div className="flex items-center mb-10">
                  <div className="w-4 h-12 bg-gradient-to-b from-purple-400 to-indigo-600 rounded-full mr-6 shadow-lg animate-pulse"></div>
                  <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text">
                    Agreements & Declaration
                    </h2>
                  </div>

                <div className="space-y-6">
                  {/* Mentor Access Password */}
                  <div className="form-group group">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">
                        Mentor Access Password
                      </span>{' '}
                      <span className="text-pink-400 font-black">*</span>
                    </label>
                    <p className="text-gray-400 text-sm mb-4">
                      Enter the secret access password shared by the MentiBY team.
                    </p>
                    <div className="relative">
                      <input
                        required
                        name="mentorAccessPassword"
                        type="password"
                        value={form.mentorAccessPassword}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
                        placeholder="Enter mentor access password"
                      />
                    </div>
                  </div>

                  {/* Confidentiality Agreement */}
                  <label className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreeConfidentiality"
                      checked={form.agreeConfidentiality}
                      onChange={handleChange}
                      className="mt-1 w-6 h-6 rounded border-2 border-purple-400 bg-transparent checked:bg-purple-500 checked:border-purple-500 focus:ring-purple-400 focus:ring-offset-0 transition-all duration-300"
                    />
                    <span className="text-gray-200 text-lg leading-relaxed group-hover:text-white transition-colors">
                      I agree to maintain confidentiality and not disclose any internal information, business strategies, or proprietary data of MentiBY to any third parties. <span className="text-pink-400">*</span>
                    </span>
                  </label>

                  {/* Discipline Agreement */}
                  <label className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreeDiscipline"
                      checked={form.agreeDiscipline}
                      onChange={handleChange}
                      className="mt-1 w-6 h-6 rounded border-2 border-purple-400 bg-transparent checked:bg-purple-500 checked:border-purple-500 focus:ring-purple-400 focus:ring-offset-0 transition-all duration-300"
                    />
                    <span className="text-gray-200 text-lg leading-relaxed group-hover:text-white transition-colors">
                      I agree to maintain discipline, punctuality, and contribute actively to the mentoring program and team activities. <span className="text-pink-400">*</span>
                    </span>
                  </label>

                  {/* Data Authorization */}
                  <label className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="authorizeDataUse"
                      checked={form.authorizeDataUse}
                      onChange={handleChange}
                      className="mt-1 w-6 h-6 rounded border-2 border-purple-400 bg-transparent checked:bg-purple-500 checked:border-purple-500 focus:ring-purple-400 focus:ring-offset-0 transition-all duration-300"
                    />
                    <span className="text-gray-200 text-lg leading-relaxed group-hover:text-white transition-colors">
                      I authorize MentiBY to use the above information solely for internal purposes and mentor management. <span className="text-pink-400">*</span>
                    </span>
                  </label>

                  {/* Terms Agreement */}
                  <label className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={form.agreeTerms}
                      onChange={handleChange}
                      className="mt-1 w-6 h-6 rounded border-2 border-purple-400 bg-transparent checked:bg-purple-500 checked:border-purple-500 focus:ring-purple-400 focus:ring-offset-0 transition-all duration-300"
                    />
                    <span className="text-gray-200 text-lg leading-relaxed group-hover:text-white transition-colors">
                      I agree to the terms & conditions mentioned above. <span className="text-pink-400">*</span>
                    </span>
                  </label>

                  {/* Digital Signature */}
                  <div className="form-group group mt-8">
                    <label className="form-label font-black text-xl md:text-2xl mb-4 block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 font-black">Digital Signature</span> <span className="text-pink-400 font-black">*</span></label>
                    <p className="text-gray-400 text-sm mb-4">Type your full name as your digital signature</p>
                    <div className="relative">
                      <input
                        required
                        name="digitalSignature"
                        value={form.digitalSignature}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-white/90 to-gray-50/90 border-2 border-transparent text-black placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-400/25 transition-all duration-300 hover:shadow-md backdrop-blur-sm italic font-semibold"
                        placeholder="Type your full name here"
                      />
                    </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-10">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-purple-500/25 hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>

                    {/* Button content */}
                    <div className="relative z-10 flex items-center justify-center space-x-3">
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting your details...</span>
                        </>
                      ) : (
                        <>
                          <span className="group-hover:animate-bounce">🚀</span>
                        <span>Complete Onboarding</span>
                          <span className="group-hover:animate-pulse">✨</span>
                        </>
                      )}
                    </div>

                    {/* Animated sparkles */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${20 + (i % 2) * 60}%`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </button>
                </div>

                {/* Enhanced Status Messages */}
              {error && error !== 'duplicate' && (
                  <div className="mt-10 p-6 rounded-3xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 backdrop-blur-sm animate-fadeIn">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">⚠</span>
                      </div>
                      <p className="text-red-300 font-semibold text-lg text-center">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33% { transform: translateY(-15px) rotate(120deg) scale(1.1); }
          66% { transform: translateY(-8px) rotate(240deg) scale(0.9); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .form-group {
          @apply relative;
        }
        
        .form-label {
          @apply block text-gray-100 font-bold mb-4 text-lg tracking-wide;
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
}
