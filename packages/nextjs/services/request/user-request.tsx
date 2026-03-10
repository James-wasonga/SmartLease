export async function checkUserExistsAndRole(address: string): Promise<{ exists: boolean; role?: 'tenant' | 'landlord' }> {
    // Replace this with wagmi `readContract()` logic
    return {
      exists: false, // or true
      role: undefined,
    };
  }
  
  export async function registerUserRole(address: string, role: 'tenant' | 'landlord') {
    // Replace this with wagmi `writeContract()` logic
    console.log(`Registering ${address} as ${role}`);
  }

  