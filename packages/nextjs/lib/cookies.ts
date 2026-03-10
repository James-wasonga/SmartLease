import Cookies from 'js-cookie';

export function setUserRole(role: 'tenant' | 'landlord') {
  Cookies.set('userRole', role, { expires: 7 });
}

export function getUserRole(): 'tenant' | 'landlord' | undefined {
  return Cookies.get('userRole') as any;
}

export function clearUserRole() {
  Cookies.remove('userRole');
  Cookies.remove("userOnboarded")
}
