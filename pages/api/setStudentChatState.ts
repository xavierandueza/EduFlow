import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { studentResponse, lastAction } = req.body;

  console.log(`Student response is ${studentResponse}`);
  console.log(`Last Action is: ${lastAction}`);


  res.status(200).json({ message: 'success' });
}
