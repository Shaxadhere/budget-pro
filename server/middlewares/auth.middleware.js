import jsonwebtoken from "jsonwebtoken";
const { verify } = jsonwebtoken;
import User from "../models/user.model.js";
import { ApiResponse, errorHandler } from "../utils/response.utils.js";
import dotenv from "dotenv";
dotenv.config();

export function authenticatedRoute(req, res, next) {
    //extracting bearer token
    const token =
        req.body.token || req.query.token || req.headers["authorization"];

    //responding with 401 if there is no token
    if (!token) {
        return res.status(401).json(ApiResponse({ message: "Access Forbidden", status: false }))
    }
    try {
        //verifying and decoding token
        const decoded = verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

        //finding current user in db
        User.findOne({ _id: decoded._id })
            .then((user) => {
                if (!user) {
                    return res.status(401).json(ApiResponse({ message: "User not found", status: false }))
                }
                req.user = user;
                next()
            })
            .catch((err) => {
                return res.status(401).json(ApiResponse({ message: errorHandler(err), status: false }))
            })
    } catch (err) {
        return res.status(401).json(ApiResponse({ message: "Invalid Token, Please sign in again", status: false }));
    }
}