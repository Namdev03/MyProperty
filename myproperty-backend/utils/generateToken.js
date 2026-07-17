import jwt from "jsonwebtoken";

/**
 * Signs a JWT containing the account id and role, sets it as an
 * httpOnly cookie, and returns the raw token in case the caller needs it.
 */
export const generateTokenAndSetCookie = (res, id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  res.cookie("token", token, cookieOptions);

  return token;
};

export const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
};
