import express, { Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import csrf from "csrf";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const csrfTokens = new csrf();
const csrfSecret = csrfTokens.secretSync();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const protectedRoutes = ["/protected"];

app.use((req, res, next) => {
  if (req.url === "/csrf-token") {
    //não precisa de token CSRF
    return next();
  }

  const insecureMethods = ["POST", "PUT", "PATCH", "DELETE"]; //não seguros
  if (!insecureMethods.includes(req.method)) {
    return next();
  }

  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;
  const csrfTokenCookie = req.cookies?.["csrf-token"];
  const csrfTokenHeader = req.headers?.["x-csrf-token"];
  console.log("CSRF Token Header:", csrfTokenHeader);
  console.log("CSRF Token Cookie:", csrfTokenCookie);
  if (csrfTokenCookie && !csrfTokenHeader) {
    return res.status(403).send({ message: "CSRF token missing" });
  }
  if ((accessToken || refreshToken) && !csrfTokenHeader && !csrfTokenCookie) {
    return res.status(403).send({ message: "CSRF token missing" });
  }
  if (
    csrfTokenCookie &&
    (csrfTokenCookie !== csrfTokenHeader ||
    !csrfTokens.verify(csrfSecret, csrfTokenCookie))
  ) {
    return res.status(403).send({ message: "Invalid CSRF token" });
  }

  next();
});

app.use((req, res, next) => {
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.url.startsWith(route)
  );

  if (!isProtectedRoute) {
    next();
    return;
  }

  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ message: "Token is required" });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string) as {
      ctx: string;
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export function generateAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60000, // o tempo pode ser igual ao tempo de expiração do token
    path: "/",
  });
}

export function generateRefreshTokenCookie(
  res: Response,
  refreshToken: string
) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 604800000, // o tempo pode ser igual ao tempo de expiração do token
    path: "/refresh",
  });
}

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

  const accessToken = jwt.sign(
    {
      email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES as any,
    }
  );
  const refreshToken = jwt.sign(
    {
      username: email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES as any,
    }
  );
  generateAccessTokenCookie(res, accessToken);
  generateRefreshTokenCookie(res, refreshToken);
  res.json({ accessToken, refreshToken });
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token is required" });
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
    const newAccessToken = jwt.sign(
      { email: decoded.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES as any,
      }
    );
    const newRefreshToken = jwt.sign(
      { email: decoded.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES as any,
      }
    );
    generateAccessTokenCookie(res, newAccessToken);
    generateRefreshTokenCookie(res, newRefreshToken);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

app.post("/csrf-token", (req, res) => {
  const csrfToken = csrfTokens.create(csrfSecret);
  res.cookie("csrf-token", csrfToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.send({ csrfToken: csrfToken });
});

app.get("/protected", (req, res) => {
  res.json({ message: "Protected route accessed" });
});

app.post("/protected", (req, res) => {
  res.json({ message: "Protected route accessed" });
});

app.listen(+PORT, "0.0.0.0", async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
