import axios from 'axios';

export async function rephraseWithPunctuation(text: string): Promise<string> {
  try {
    const response = await axios.post('https://gemini-fastapi-1.onrender.com/rephrase', {
      text
    });

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Error rephrasing text:', error);
    throw error;
  }
}

