import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface TokenPayload {
    id: any;
    email: string;
    name: string;
}

export const generateToken = (
    id: number,
    email: string,
    name: string,
    role: string,
    companyId: number
): string => {
    const secret = process.env.JWT_SECRET as string;
    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    return jwt.sign({ id, email, name, role, companyId }, secret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        const secret = process.env.JWT_SECRET as string;
        if (!secret) {
            throw new Error(
                "JWT_SECRET is not defined in environment variables."
            );
        }

        return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token has expired.");
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid token.");
        } else {
            throw new Error("Token verification failed.");
        }
    }
};
