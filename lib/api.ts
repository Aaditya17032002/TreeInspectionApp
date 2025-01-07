import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function rephraseWithPunctuation(text: string): Promise<string> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await axios.post('https://gemini-fastapi-1.onrender.com/rephrase', {
        text
      }, {
        timeout: 10000, // 10 seconds timeout
      });

      if (!response.data) {
        throw new Error('No response data received');
      }

      return response.data;
    } catch (error) {
      console.error(`Error rephrasing text (attempt ${retries + 1}):`, error);
      
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        if (retries === MAX_RETRIES - 1) {
          throw new Error('Network error: Unable to connect to the rephrasing service after multiple attempts. Please try again later.');
        }
        await wait(RETRY_DELAY * (retries + 1)); // Exponential backoff
        retries++;
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries reached. Unable to rephrase text.');
}

