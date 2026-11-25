import type { Request, Response } from "express";
import {
  getUserProfile as getUserProfileService,
  updateUserProfile as updateUserProfileService,
} from "../services/user.service.js";
import { AppError } from "../lib/error.js";

export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const user = await getUserProfileService(userId);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateMyProfile(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const file = req.file;
    const hasBodyFields = req.body && Object.keys(req.body).length > 0;
    if (!file && !hasBodyFields) {
      return res.status(400).json({
        message: "At least one field or image must be provided to update profile",
      });
    }

    const user = await updateUserProfileService(userId, req.body, file);
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
