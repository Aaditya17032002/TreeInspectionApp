export async function checkInternetConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
      })
      return true
    } catch (error) {
      return false
    }
  }
  
  