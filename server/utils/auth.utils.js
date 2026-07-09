import jsonwebtoken from "jsonwebtoken";
const { sign, verify } = jsonwebtoken;
import { ApiResponse } from './response.utils.js';
import dotenv from "dotenv";
dotenv.config();

export function generateToken(user) {
    const token = sign(
        {
            _id: user._id,
            email: user.email,
            name: user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    return token;
}

export function validateToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        return res.status(403).json(ApiResponse({ message: "Invalid Token", status: false }))
    }
}

export function verifyToken(req, res, next) {
    verify(req.token, process.env.JWT_SECRET, (err, auth) => {
        if (err) {
            return res.status(403).json(ApiResponse({ message: "Invalid Token", status: false }))
        } else {
            req.user = auth;
            next();
        }
    });
}

export function sanitizeUser(user) {
    const _user = user.toObject()
    delete _user.hashed_password
    delete _user.salt
    delete _user.__v
    delete _user.updatedAt
    delete _user.createdAt
    return _user
}