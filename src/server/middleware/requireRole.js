
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // First ensure user is authenticated
            if (!req.session?.user?.idTokenClaims) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            // Get groups from verified ID token claims
            const userGroups = req.session.user.idTokenClaims.groups || [];

            // Check if user has any of the allowed roles
            const hasAllowedRole = allowedRoles.some(role => {
                switch (role) {
                    case 'admin':
                        return userGroups.includes('studyboard-admins');
                    case 'user':
                        return userGroups.includes('studyboard-users');
                    default:
                        return false;
                }
            });

            if (!hasAllowedRole) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to access this resource'
                });
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};