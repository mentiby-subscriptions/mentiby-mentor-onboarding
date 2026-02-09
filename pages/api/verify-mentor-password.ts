import type { NextApiRequest, NextApiResponse } from 'next';

// Password is hardcoded ONLY on the server.
// It is never shipped to the browser bundle.
const MENTOR_ACCESS_PASSWORD = 'Createimpact@4468';

type ResponseData =
  | { valid: true }
  | { valid: false; error: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      valid: false,
      error: 'Method not allowed',
    });
  }

  const { password } = req.body as { password?: string };

  if (!password) {
    return res.status(400).json({
      valid: false,
      error: 'Password is required.',
    });
  }

  // Compare with server-side constant
  if (password !== MENTOR_ACCESS_PASSWORD) {
    return res.status(401).json({
      valid: false,
      error: 'Invalid mentor access password.',
    });
  }

  return res.status(200).json({ valid: true });
}

