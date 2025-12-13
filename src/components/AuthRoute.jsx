import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../lib/store';

// We duplicate the list here for client-side redirection safety
// Ideally this could be shared in a constant file
const ALLOWED_EMAILS = ['rafaelmontes92@outlook.com', 'angelica.sfm@hotmail.com'];

export default function AuthRoute() {
    const session = useStore((state) => state.session);
    const user = useStore((state) => state.user);
    const authInitialized = useStore((state) => state.authInitialized);

    if (!authInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    const email = user?.email;
    if (email && !ALLOWED_EMAILS.includes(email)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
                    <p className="text-neutral-400">Your email ({email}) is not authorized.</p>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
