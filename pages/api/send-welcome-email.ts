import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailRequest {
  name: string;
  email: string;
  mentorId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, mentorId } = req.body as EmailRequest;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MentiBY!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 0;">
              <h1 style="margin: 0; font-size: 48px; font-weight: 900; color: #7c3aed;">
                MentiBY
              </h1>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 16px; letter-spacing: 2px;">
                MENTOR PROGRAM
              </p>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
                
                <!-- Welcome Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); padding: 40px; text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 16px;">🎉</div>
                    <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                      Welcome, ${name}!
                    </h2>
                    <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 18px;">
                      You're officially a MentiBY Mentor!
                    </p>
                  </td>
                </tr>
                
                <!-- Mentor ID Badge -->
                <tr>
                  <td style="padding: 30px 40px 20px 40px; text-align: center; background-color: #ffffff;">
                    <table role="presentation" style="margin: 0 auto; background: linear-gradient(135deg, #faf5ff, #fdf2f8); border-radius: 16px; border: 2px solid #e9d5ff;">
                      <tr>
                        <td style="padding: 20px 40px;">
                          <p style="margin: 0 0 8px 0; color: #7c3aed; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                            Your Mentor ID
                          </p>
                          <p style="margin: 0; color: #7c3aed; font-size: 36px; font-weight: 700;">
                            ${mentorId}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Email Info -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center; background-color: #ffffff;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Registered Email:
                    </p>
                    <p style="margin: 8px 0 0 0; color: #1f2937; font-size: 18px; font-weight: 500;">
                      ${email}
                    </p>
                  </td>
                </tr>
                
                <!-- Divider -->
                <tr>
                  <td style="padding: 0 40px; background-color: #ffffff;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent);"></div>
                  </td>
                </tr>
                
                <!-- Steps Section -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #ffffff;">
                    <h3 style="margin: 0 0 24px 0; color: #1f2937; font-size: 22px; font-weight: 600; text-align: center;">
                      🚀 How to Access Your Dashboard
                    </h3>
                    
                    <!-- Step 1 -->
                    <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7c3aed, #db2777); border-radius: 50%; text-align: center; line-height: 40px; color: #ffffff; font-weight: 700; font-size: 18px;">
                            1
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 12px;">
                          <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                            Put your registered email ID
                          </p>
                          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
                            Use: ${email}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 2 -->
                    <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7c3aed, #db2777); border-radius: 50%; text-align: center; line-height: 40px; color: #ffffff; font-weight: 700; font-size: 18px;">
                            2
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 12px;">
                          <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                            Get the access password from Supermentors
                          </p>
                          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
                            Contact your assigned Supermentor
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 3 -->
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #34d399); border-radius: 50%; text-align: center; line-height: 40px; color: #ffffff; font-weight: 700; font-size: 18px;">
                            ✓
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 12px;">
                          <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                            Woohoo! You're logged in! 🎊
                          </p>
                          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
                            Start your mentoring journey
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 20px 40px 40px 40px; text-align: center; background-color: #ffffff;">
                    <a href="https://mentiby-mentor.vercel.app" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 50px; font-size: 18px; font-weight: 700; box-shadow: 0 10px 40px rgba(124, 58, 237, 0.3);">
                      🚀 Go to Mentor Dashboard
                    </a>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at support@mentiby.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 MentiBY. All rights reserved.
              </p>
              <div style="margin-top: 20px;">
                <span style="font-size: 24px; margin: 0 8px;">🎯</span>
                <span style="font-size: 24px; margin: 0 8px;">✨</span>
                <span style="font-size: 24px; margin: 0 8px;">🚀</span>
                <span style="font-size: 24px; margin: 0 8px;">💫</span>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'MentiBY <onboarding@resend.dev>',
      to: email,
      subject: `🎉 Welcome to MentiBY, ${name}! Your Mentor Journey Begins`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
