import 'next-auth';

declare module 'next-auth' {
  interface User {
    isAdmin?: boolean;
  }

  interface Session {
    user: User & {
      isAdmin?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean;
  }
}