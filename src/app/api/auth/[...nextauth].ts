// src/pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '../../../lib/mongodb'; // Adjust the path as needed
import { compare } from 'bcrypt';

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          // Returning null if email or password is missing
          return null;
        }

        // Fetch user from MongoDB
        const client = await clientPromise;
        const usersCollection = client.db().collection('users');
        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user) {
          // User not found
          return null;
        }

        // Check if password matches
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          // Password is incorrect
          return null;
        }

        // Return user object if authentication is successful
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role || 'user', // Ensure role exists; default to 'user'
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Add role to JWT token
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string; // Add role to session object
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Custom sign-in page
  },
});
