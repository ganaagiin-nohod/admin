import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import GmailAuth from '@/models/GmailAuth';
import { connectToDatabase } from '@/lib/mongodb';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email'
];

export function createOAuth2Client(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/gmail/callback`;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is missing');
  }

  if (!clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable is missing');
  }

  if (!process.env.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL environment variable is missing');
  }

  console.log('Creating OAuth2 client with redirect URI:', redirectUri);

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGmailAuthUrl(userId: string): string {
  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    state: userId,
    prompt: 'consent',
    include_granted_scopes: true
  });

  console.log('Generated auth URL for user:', userId);
  return authUrl;
}

export async function exchangeCodeForTokens(code: string, userId: string) {
  try {
    await connectToDatabase();
    const oauth2Client = createOAuth2Client();

    console.log('OAuth2 Exchange Debug:', {
      clientId: process.env.GOOGLE_CLIENT_ID
        ? `Set (${process.env.GOOGLE_CLIENT_ID.length} chars)`
        : 'Missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
        ? `Set (${process.env.GOOGLE_CLIENT_SECRET.length} chars)`
        : 'Missing',
      redirectUri: `${process.env.NEXTAUTH_URL}/api/gmail/callback`,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      codeLength: code?.length,
      codePrefix: code?.substring(0, 20) + '...',
      userId,
      timestamp: new Date().toISOString()
    });

    const clientConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/gmail/callback`
    };

    if (!clientConfig.clientId || !clientConfig.clientSecret) {
      throw new Error('Missing Google OAuth credentials');
    }

    if (!code) {
      throw new Error('Authorization code is missing');
    }

    if (!userId) {
      throw new Error('User ID is missing');
    }

    console.log('Making token exchange request to Google...');

    const tokenResponse = await oauth2Client.getToken(code);
    const { tokens } = tokenResponse;

    console.log('Token exchange response received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      tokenType: tokens.token_type,
      expiryDate: tokens.expiry_date,
      scopes: tokens.scope
    });

    if (!tokens.access_token) {
      throw new Error('Access token not received from Google');
    }

    if (!tokens.refresh_token) {
      throw new Error(
        'Refresh token not received from Google. Make sure prompt=consent is set.'
      );
    }

    oauth2Client.setCredentials(tokens);

    console.log('Getting user info from Google...');
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    if (!userInfo.data.email) {
      throw new Error('Failed to get user email from Google');
    }

    console.log('User info retrieved:', {
      email: userInfo.data.email,
      verified: userInfo.data.verified_email
    });

    console.log('Saving Gmail auth to database...');
    const gmailAuth = await GmailAuth.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type || 'Bearer',
        expiryDate: new Date(tokens.expiry_date || Date.now() + 3600000),
        scope: tokens.scope?.split(' ') || GMAIL_SCOPES,
        email: userInfo.data.email,
        isActive: true,
        lastSync: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(
      'Successfully exchanged tokens and saved to database for user:',
      userInfo.data.email
    );
    return gmailAuth;
  } catch (error: any) {
    console.error('Error exchanging code for tokens:', {
      message: error.message,
      status: error.status || error.code,
      statusText: error.response?.statusText,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    });

    if (error.response?.data) {
      console.error(
        'Google API Error Response:',
        JSON.stringify(error.response.data, null, 2)
      );
    }

    if (error.config) {
      console.error('Request Config:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
          ? Object.keys(error.config.headers)
          : 'None',
        dataPresent: !!error.config.data
      });
    }

    if (error.message === 'invalid_client') {
      throw new Error(
        `OAuth invalid_client error. Check that your Google Cloud Console OAuth2 client redirect URI exactly matches: ${process.env.NEXTAUTH_URL}/api/gmail/callback`
      );
    }

    throw error;
  }
}

export async function getGmailClient(userId: string) {
  try {
    await connectToDatabase();
    const gmailAuth = await GmailAuth.findOne({ userId, isActive: true });

    if (!gmailAuth) {
      throw new Error('Gmail authentication not found for user');
    }

    console.log('Found Gmail auth for user:', {
      email: gmailAuth.email,
      hasTokens: !!(gmailAuth.accessToken && gmailAuth.refreshToken),
      expiryDate: gmailAuth.expiryDate,
      isExpired: gmailAuth.expiryDate < new Date()
    });

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: gmailAuth.accessToken,
      refresh_token: gmailAuth.refreshToken,
      token_type: gmailAuth.tokenType,
      expiry_date: gmailAuth.expiryDate.getTime()
    });

    if (gmailAuth.expiryDate < new Date()) {
      console.log('Token expired, refreshing...');

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();

        console.log('Token refreshed successfully');

        await GmailAuth.findByIdAndUpdate(gmailAuth._id, {
          accessToken: credentials.access_token,
          expiryDate: new Date(credentials.expiry_date || Date.now() + 3600000),
          updatedAt: new Date()
        });

        oauth2Client.setCredentials(credentials);
      } catch (refreshError: any) {
        console.error('Error refreshing token:', refreshError);

        await GmailAuth.findByIdAndUpdate(gmailAuth._id, {
          isActive: false,
          updatedAt: new Date()
        });

        throw new Error(
          'Failed to refresh Gmail token. Please re-authenticate.'
        );
      }
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    console.log('Gmail client created successfully');

    return gmail;
  } catch (error: any) {
    console.error('Error getting Gmail client:', error);
    throw error;
  }
}

export async function searchJobEmails(userId: string, lastCheckDate?: Date) {
  try {
    console.log('Searching job emails for user:', userId);
    const gmail = await getGmailClient(userId);

    let query =
      'subject:(job OR application OR interview OR offer OR position OR hiring OR recruiter OR HR OR career OR employment)';

    if (lastCheckDate) {
      const dateStr = lastCheckDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '/');
      query += ` after:${dateStr}`;
    }

    console.log('Gmail search query:', query);

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50
    });

    const messages = response.data.messages || [];
    console.log(`Found ${messages.length} job-related messages`);

    const emailData = [];

    const messagesToProcess = messages.slice(0, 10);

    for (let i = 0; i < messagesToProcess.length; i++) {
      const message = messagesToProcess[i];
      try {
        console.log(
          `Processing message ${i + 1}/${messagesToProcess.length}: ${message.id}`
        );

        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        });

        const headers = fullMessage.data.payload?.headers || [];
        const subject = headers.find((h) => h.name === 'Subject')?.value || '';
        const from = headers.find((h) => h.name === 'From')?.value || '';
        const date = headers.find((h) => h.name === 'Date')?.value || '';
        const messageId =
          headers.find((h) => h.name === 'Message-ID')?.value || '';

        let body = '';
        let htmlBody = '';

        if (fullMessage.data.payload?.body?.data) {
          body = Buffer.from(
            fullMessage.data.payload.body.data,
            'base64'
          ).toString('utf-8');
        } else if (fullMessage.data.payload?.parts) {
          for (const part of fullMessage.data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf-8');
            } else if (part.mimeType === 'text/html' && part.body?.data) {
              htmlBody += Buffer.from(part.body.data, 'base64').toString(
                'utf-8'
              );
            }
          }
        }

        const finalBody = body || htmlBody;

        emailData.push({
          id: message.id,
          threadId: fullMessage.data.threadId,
          messageId,
          subject,
          from,
          date: new Date(date),
          body: finalBody.substring(0, 2000),
          snippet: fullMessage.data.snippet || '',
          labelIds: fullMessage.data.labelIds || [],
          isUnread: fullMessage.data.labelIds?.includes('UNREAD') || false
        });
      } catch (error: any) {
        console.error(`Error fetching message ${message.id}:`, error.message);
      }
    }

    console.log(
      `Successfully processed ${emailData.length} job-related emails`
    );
    return emailData;
  } catch (error: any) {
    console.error('Error searching job emails:', error);
    throw error;
  }
}

export async function isGmailConnected(userId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const gmailAuth = await GmailAuth.findOne({ userId, isActive: true });
    const isConnected = !!gmailAuth;

    console.log(`Gmail connection status for user ${userId}:`, {
      isConnected,
      email: gmailAuth?.email || 'N/A',
      lastSync: gmailAuth?.lastSync || 'Never'
    });

    return isConnected;
  } catch (error: any) {
    console.error('Error checking Gmail connection:', error);
    return false;
  }
}

export async function disconnectGmail(userId: string): Promise<void> {
  try {
    await connectToDatabase();

    const result = await GmailAuth.findOneAndUpdate(
      { userId },
      {
        isActive: false,
        updatedAt: new Date()
      }
    );

    if (result) {
      console.log(`Gmail disconnected for user ${userId} (${result.email})`);
    } else {
      console.log(`No Gmail connection found for user ${userId}`);
    }
  } catch (error: any) {
    console.error('Error disconnecting Gmail:', error);
    throw error;
  }
}

export async function getGmailConnectionStatus(userId: string) {
  try {
    await connectToDatabase();
    const gmailAuth = await GmailAuth.findOne({ userId, isActive: true });

    if (!gmailAuth) {
      return {
        isConnected: false,
        email: null,
        lastSync: null,
        tokenExpiry: null
      };
    }

    return {
      isConnected: true,
      email: gmailAuth.email,
      lastSync: gmailAuth.lastSync,
      tokenExpiry: gmailAuth.expiryDate,
      isTokenExpired: gmailAuth.expiryDate < new Date(),
      scopes: gmailAuth.scope
    };
  } catch (error: any) {
    console.error('Error getting Gmail connection status:', error);
    return {
      isConnected: false,
      email: null,
      lastSync: null,
      tokenExpiry: null,
      error: error.message
    };
  }
}

export async function testGmailConnection(userId: string): Promise<boolean> {
  try {
    const gmail = await getGmailClient(userId);

    const profile = await gmail.users.getProfile({ userId: 'me' });
    await GmailAuth.findOneAndUpdate(
      { userId, isActive: true },
      { lastSync: new Date() }
    );

    return true;
  } catch (error: any) {
    console.error('Gmail connection test failed:', error.message);
    return false;
  }
}
