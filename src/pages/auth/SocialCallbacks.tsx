import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { SocialMediaService } from '../../services/socialMediaService';

export const InstagramCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(searchParams.get('error_description') || 'Authorization failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        await SocialMediaService.connectInstagram(code);
        setStatus('success');
        setMessage('Instagram account connected successfully!');
        
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to connect Instagram account');
        
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connecting Instagram
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we connect your Instagram account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export const FacebookCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(searchParams.get('error_description') || 'Authorization failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: import.meta.env.VITE_FACEBOOK_APP_ID,
            client_secret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
            redirect_uri: `${window.location.origin}/auth/facebook/callback`,
            code: code,
          }),
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          throw new Error(tokenData.error?.message || 'Failed to get access token');
        }

        await SocialMediaService.connectFacebook(tokenData.access_token);
        setStatus('success');
        setMessage('Facebook account connected successfully!');
        
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to connect Facebook account');
        
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connecting Facebook
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we connect your Facebook account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export const TwitterCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(searchParams.get('error_description') || 'Authorization failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        const codeVerifier = sessionStorage.getItem('twitter_code_verifier');
        if (!codeVerifier) {
          throw new Error('Code verifier not found');
        }

        await SocialMediaService.connectTwitter(code, codeVerifier);
        setStatus('success');
        setMessage('Twitter account connected successfully!');
        
        // Clean up
        sessionStorage.removeItem('twitter_code_verifier');
        
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to connect Twitter account');
        
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connecting Twitter
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we connect your Twitter account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export const LinkedInCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(searchParams.get('error_description') || 'Authorization failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        await SocialMediaService.connectLinkedIn(code);
        setStatus('success');
        setMessage('LinkedIn account connected successfully!');
        
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to connect LinkedIn account');
        
        setTimeout(() => {
          navigate('/dashboard/accounts');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connecting LinkedIn
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we connect your LinkedIn account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};