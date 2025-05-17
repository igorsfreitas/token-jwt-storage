import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

function generateFingerprint() {
  return Math.random().toString(36).substring(2, 15);
}

const protectedRoutes = ["/protected"];

app.use((req, res, next) => {
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.url.startsWith(route)
  );

  if (!isProtectedRoute) {
    next();
    return;
  }

  const fingerprint = req.cookies.fingerprint;
  if (!fingerprint) {
    res.status(401).json({ message: "Fingerprint is required" });
    return;
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token is required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      ctx: string;
    };
    const ctx = crypto.createHash("sha256").update(fingerprint).digest("hex");
    if (decoded.ctx !== ctx) {
      res.status(401).json({ message: "Invalid fingerprint" });
      return;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  if (email !== "user@user.com" || password !== "password") {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const fingerprint = generateFingerprint();
  const ctx = crypto.createHash("sha256").update(fingerprint).digest("hex");
  const accessToken = jwt.sign(
    {
      email,
      ctx,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES as any,
    }
  );
  const refreshToken = jwt.sign(
    {
      username: email,
      ctx,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES as any,
    }
  );
  res.cookie("fingerprint", fingerprint, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  res.json({ accessToken, refreshToken });
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  const fingerprint = req.cookies.fingerprint;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token is required" });
    return;
  }

  if (!fingerprint) {
    res.status(401).json({ message: "Fingerprint is required" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string
    ) as {
      email: string;
      ctx: string;
    };
    const ctx = crypto.createHash("sha256").update(fingerprint).digest("hex");
    if (decoded.ctx !== ctx) {
      res.status(401).json({ message: "Invalid fingerprint" });
      return;
    }
    const newAccessToken = jwt.sign(
      { email: decoded.email, ctx },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES as any
      }
    );
    const newRefreshToken = jwt.sign(
      { email: decoded.email, ctx },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES as any,
      }
    );
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

app.get("/protected", (req, res) => {
  res.json({ message: "Protected route accessed" });
});

app.listen(+PORT, "0.0.0.0", async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
