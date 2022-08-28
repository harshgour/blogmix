import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcrypt";
import { db } from "./db.server";

// @todo - login user
type LoginProps = {
	username: string;
	password: string;
};

export const login = async ({ username, password }: LoginProps) => {
	const user = await db.user.findUnique({
		where: {
			username,
		},
	});

	// @todo - if user not found
	if (!user) return null;

	// @todo - check password
	const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);

	if (!isCorrectPassword) return null;

	return user;
};

// @todo - register user

export const register = async ({ username, password }: LoginProps) => {
	const passwordHash = await bcrypt.hash(password, 10);
	return db.user.create({
		data: {
			username,
			passwordHash,
		},
	});
};

// @todo - get session secret
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
	throw new Error("No Session Secret");
}

// @todo - create session storage
const storage = createCookieSessionStorage({
	cookie: {
		name: "remixblog_session",
		secure: process.env.NODE_ENV === "production",
		secrets: [sessionSecret],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 60,
		httpOnly: true,
	},
});

// @todo - create session
export const createUserSession = async (userId: string, redirectTo: string) => {
	const session = await storage.getSession();
	session.set("userId", userId);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await storage.commitSession(session),
		},
	});
};

// @todo - get user session
export const getUserSession = async (request: Request) => {
	return storage.getSession(request.headers.get("Cookie"));
};

// @todo - get logged in user
export const getUser = async (request: Request) => {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") {
		return null;
	}

	try {
		const user = await db.user.findUnique({
			where: {
				id: userId,
			},
		});

		return user;
	} catch (error) {
		return null;
	}
};

// @todo - logout user and destroy session
export const logout = async (request: Request) => {
	const session = await storage.getSession(request.headers.get("Cookie"));
	return redirect("/auth/logout", {
		headers: {
			"Set-Cookie": await storage.destroySession(session),
		},
	});
};
