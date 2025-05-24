// src/app/auth/signup/page.jsx
'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError, resetRegistrationSuccess } from '@/store/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, registrationSuccess } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(resetRegistrationSuccess());
    };
  }, [dispatch]);

  useEffect(() => {
      if (registrationSuccess) {
        alert('Registration successful! Please login.');
        router.push('/auth/signin');
        dispatch(resetRegistrationSuccess());
      }
    }, [registrationSuccess, router, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(registerUser(formData));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">Sign Up</h2>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            name="phone"
            type="text"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
          />
          <Button type="submit" className="w-full" disabled={loading === 'pending'}>
            {loading === 'pending' ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>
      </div>
    </div>
  );
}
