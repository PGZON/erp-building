import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useConvex } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

type User = {
    _id: Id<"users">;
    name: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const convex = useConvex();

    // Basic persistence
    useEffect(() => {
        async function checkUser() {
            try {
                const json = await SecureStore.getItemAsync('user_session');
                if (json) {
                    setUser(JSON.parse(json));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        checkUser();
    }, []);

    const signIn = async (email: string, pass: string) => {
        try {
            // Authenticate with backend
            const result = await convex.mutation(api.auth.login, { email, password: pass });
            if (result) {
                // @ts-ignore
                setUser(result);
                await SecureStore.setItemAsync('user_session', JSON.stringify(result));
            } else {
                throw new Error("Invalid credentials");
            }
        } catch (e) {
            throw e;
        }
    };

    const signOut = async () => {
        setUser(null);
        await SecureStore.deleteItemAsync('user_session');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
