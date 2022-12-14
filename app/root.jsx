import {
	Outlet,
	LiveReload,
	Link,
	Links,
	Meta,
	useLoaderData,
} from "@remix-run/react";
import globalStylesUrl from "~/styles/global.css";
import { getUser } from "~/utils/session.server";

export const links = () => [{ rel: "stylesheet", href: globalStylesUrl }];

export const meta = () => {
	const description = "A cool blog build with Remix";
	const keywords = "remix, react, blog, javascript";
	return {
		description,
		keywords,
	};
};

export const loader = async ({ request }) => {
	const user = await getUser(request);
	const data = {
		user,
	};
	return data;
};

export default App = () => {
	return (
		<Document>
			<Layout>
				<Outlet />
			</Layout>
		</Document>
	);
};

const Document = ({ children, title }) => {
	return (
		<html>
			<head>
				<Meta />
				<Links />
				<title>{title ? title : "Remix Blog"}</title>
			</head>
			<body>
				{children}
				{process.env.NODE_ENV === "development" ? <LiveReload /> : null}
			</body>
		</html>
	);
};

const Layout = ({ children }) => {
	const { user } = useLoaderData();
	return (
		<>
			<nav className='navbar'>
				<Link to='/' className='logo'>
					Blogmix
				</Link>
				<ul className='nav'>
					<li>
						<Link to='/posts'>Posts</Link>
					</li>
					{user ? (
						<li>
							<form action='/auth/logout' method='POST'>
								<button className='btn' type='submit'>
									Logout {user.username}
								</button>
							</form>
						</li>
					) : (
						<li>
							<Link to='/auth/login'>Login/Register</Link>
						</li>
					)}
				</ul>
			</nav>
			<div className='container'>{children}</div>
		</>
	);
};

export const ErrorBoundary = ({ error }) => {
	return (
		<Document>
			<Layout>
				<h1>Error</h1>
				<p>{error.message}</p>
			</Layout>
		</Document>
	);
};
