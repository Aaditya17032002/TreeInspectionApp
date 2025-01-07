export async function rephraseWithPunctuation(text: string): Promise<string> {
    try {
      const response = await fetch('/api/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rephrase text');
      }
  
      if (!data.rephrasedText) {
        throw new Error('No rephrased text received from the API');
      }
  
      return data.rephrasedText;
    } catch (error) {
      console.error('Error rephrasing text:', error);
      throw error;
    }
  }
  
  