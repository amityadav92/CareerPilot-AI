const adminOnly = (req, res, next) => {

    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        next();

    } catch (error) {

        console.error("Authorization Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Authorization server error"
        });

    }

};

module.exports = {
    adminOnly
};