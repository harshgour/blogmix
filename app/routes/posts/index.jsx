import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const loader = async ({ request }) => {
	const data = {
		posts: await db.post.findMany({
			take: 20,
			select: { id: true, title: true, createdAt: true },
			orderBy: { createdAt: "desc" },
		}),
		user: "something",
	};
	return data;
};

function PostItems() {
	const { user, posts } = useLoaderData();
	return (
		<>
			<div className='page-header'>
				<h1>Posts</h1>
				{user && (
					<Link to='/posts/new' className='btn'>
						New Post
					</Link>
				)}
			</div>
			<ul className='posts-list'>
				{posts.map((post, index) => {
					return (
						<li key={post.id}>
							<Link to={post.id}>
								<h3>{post.title}</h3>
								{new Date(post.createdAt).toLocaleString()}
							</Link>
						</li>
					);
				})}
			</ul>
		</>
	);
}

export default PostItems;
