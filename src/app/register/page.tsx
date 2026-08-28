'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError } from '@/lib/api';
import type { Role } from '@/lib/types';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [role, setRole] = useState<
    Extract<Role, 'customer' | 'kitchen_owner'>
  >('customer');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });

      showToast(
        `Welcome to CloudBite, ${user.name.split(' ')[0]}!`,
        'success'
      );

      if (user.role === 'kitchen_owner') {
        router.push('/partner');
      } else {
        router.push('/');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.firstError());
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Join CloudBite as a customer or kitchen partner.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-4"
          >
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-spicy/30 bg-red-50 px-4 py-3 text-sm text-spicy"
              >
                {error}
              </div>
            )}

            {/* Role selection */}
            <div>
              <span className="label">I want to</span>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  aria-pressed={role === 'customer'}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                    role === 'customer'
                      ? 'border-brand bg-brand-light text-brand-dark'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  🍽️ Order food
                </button>

                <button
                  type="button"
                  onClick={() => setRole('kitchen_owner')}
                  aria-pressed={role === 'kitchen_owner'}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                    role === 'kitchen_owner'
                      ? 'border-brand bg-brand-light text-brand-dark'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  👨‍🍳 Sell food
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label" htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label
                className="label"
                htmlFor="password_confirmation"
              >
                Confirm password
              </label>

              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) =>
                  setPasswordConfirmation(e.target.value)
                }
                className="input"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary mt-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? 'Creating account...'
                : 'Create account'}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-brand hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}