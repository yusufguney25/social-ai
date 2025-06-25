import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type SocialAccount = Database['public']['Tables']['social_accounts']['Row'];
type SocialAccountInsert = Database['public']['Tables']['social_accounts']['Insert'];

export class SocialMediaService {
  // Instagram connection
  static async connectInstagram(authCode: string): Promise<SocialAccount> {
    try {
      // Exchange auth code for access token
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
          client_secret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: `${window.location.origin}/auth/instagram/callback`,
          code: authCode,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || 'Failed to connect Instagram');
      }

      // Get user info
      const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokenData.access_token}`);
      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.error?.message || 'Failed to get Instagram user data');
      }

      // Save to database
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const socialAccountData: SocialAccountInsert = {
        user_id: user.user.id,
        platform: 'instagram',
        platform_user_id: userData.id,
        username: userData.username,
        display_name: userData.username,
        access_token: tokenData.access_token,
        followers_count: userData.media_count || 0,
      };

      const { data, error } = await supabase
        .from('social_accounts')
        .insert(socialAccountData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Instagram connection error:', error);
      throw error;
    }
  }

  // Facebook connection
  static async connectFacebook(accessToken: string): Promise<SocialAccount> {
    try {
      // Get user info
      const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.error?.message || 'Failed to get Facebook user data');
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const socialAccountData: SocialAccountInsert = {
        user_id: user.user.id,
        platform: 'facebook',
        platform_user_id: userData.id,
        username: userData.name,
        display_name: userData.name,
        access_token: accessToken,
        followers_count: 0, // Will be updated via API
      };

      const { data, error } = await supabase
        .from('social_accounts')
        .insert(socialAccountData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Facebook connection error:', error);
      throw error;
    }
  }

  // Twitter connection
  static async connectTwitter(authCode: string, codeVerifier: string): Promise<SocialAccount> {
    try {
      // Exchange auth code for access token
      const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_TWITTER_CLIENT_ID}:${import.meta.env.VITE_TWITTER_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: import.meta.env.VITE_TWITTER_CLIENT_ID,
          redirect_uri: `${window.location.origin}/auth/twitter/callback`,
          code: authCode,
          code_verifier: codeVerifier,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || 'Failed to connect Twitter');
      }

      // Get user info
      const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.error?.message || 'Failed to get Twitter user data');
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const socialAccountData: SocialAccountInsert = {
        user_id: user.user.id,
        platform: 'twitter',
        platform_user_id: userData.data.id,
        username: userData.data.username,
        display_name: userData.data.name,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        followers_count: userData.data.public_metrics?.followers_count || 0,
      };

      const { data, error } = await supabase
        .from('social_accounts')
        .insert(socialAccountData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Twitter connection error:', error);
      throw error;
    }
  }

  // LinkedIn connection
  static async connectLinkedIn(authCode: string): Promise<SocialAccount> {
    try {
      // Exchange auth code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
          client_secret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET,
          redirect_uri: `${window.location.origin}/auth/linkedin/callback`,
          code: authCode,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || 'Failed to connect LinkedIn');
      }

      // Get user info
      const userResponse = await fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.message || 'Failed to get LinkedIn user data');
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const firstName = userData.firstName?.localized?.en_US || '';
      const lastName = userData.lastName?.localized?.en_US || '';
      const fullName = `${firstName} ${lastName}`.trim();

      const socialAccountData: SocialAccountInsert = {
        user_id: user.user.id,
        platform: 'linkedin',
        platform_user_id: userData.id,
        username: fullName,
        display_name: fullName,
        access_token: tokenData.access_token,
        followers_count: 0, // LinkedIn doesn't provide follower count in basic API
      };

      const { data, error } = await supabase
        .from('social_accounts')
        .insert(socialAccountData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      throw error;
    }
  }

  // Get connected accounts for user
  static async getConnectedAccounts(): Promise<SocialAccount[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_active', true)
      .order('connected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Disconnect account
  static async disconnectAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    if (error) throw error;
  }

  // Refresh access token
  static async refreshAccessToken(accountId: string): Promise<void> {
    const { data: account, error: fetchError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (fetchError) throw fetchError;

    // Implementation depends on platform
    // Each platform has different refresh token flows
    // This is a simplified version
    
    const { error: updateError } = await supabase
      .from('social_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    if (updateError) throw updateError;
  }

  // Sync account data (followers, etc.)
  static async syncAccountData(accountId: string): Promise<void> {
    const { data: account, error: fetchError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (fetchError) throw fetchError;

    // Platform-specific sync logic would go here
    // For now, just update the last sync time
    
    const { error: updateError } = await supabase
      .from('social_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    if (updateError) throw updateError;
  }
}

// OAuth URL generators
export const getInstagramAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/instagram/callback`,
    scope: 'user_profile,user_media',
    response_type: 'code',
  });
  
  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
};

export const getFacebookAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_FACEBOOK_APP_ID,
    redirect_uri: `${window.location.origin}/auth/facebook/callback`,
    scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
    response_type: 'code',
  });
  
  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
};

export const getTwitterAuthUrl = () => {
  // Twitter OAuth 2.0 with PKCE
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  // Store code verifier for later use
  sessionStorage.setItem('twitter_code_verifier', codeVerifier);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.VITE_TWITTER_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/twitter/callback`,
    scope: 'tweet.read tweet.write users.read follows.read',
    state: generateRandomString(32),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  
  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
};

export const getLinkedInAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/linkedin/callback`,
    scope: 'r_liteprofile r_emailaddress w_member_social',
    state: generateRandomString(32),
  });
  
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

// Helper functions for OAuth
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeChallenge(verifier: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  return crypto.subtle.digest('SHA-256', data).then(hash => {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(hash))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  });
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}