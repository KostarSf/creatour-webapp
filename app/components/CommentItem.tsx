import type { Comment, Media, Rating, User } from "@prisma-app/client";
import { cn } from "~/lib/utils";
import RatingBar from "./RatingBar";

interface CommentItemProps {
	comment: Comment & {
		user: User;
		media: Media[];
	};
	rating: Rating[];
	className?: string;
}

export default function CommentItem({ comment, rating, className }: CommentItemProps) {
	return (
		<div className={cn("flex items-start gap-4", className)}>
			<div className="mt-1 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-300">
				{comment.user.avatar && (
					<img
						src={comment.user.avatar}
						alt=""
						className="h-full w-full object-cover object-center"
					/>
				)}
			</div>
			<div className="flex-1">
				<div className="flex items-baseline justify-between gap-2 md:justify-start md:gap-12">
					<p className="font-medium text-lg/none">{comment.user.username}</p>
					<p className="text-slate-500">
						{new Date(comment.createdAt).toLocaleString("ru-ru", {
							day: "numeric",
							month: "long",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
				</div>
				<div>
					<RatingBar ratings={rating.filter((rating) => rating.userId === comment.userId)} />
				</div>
				<p>{comment.text}</p>
				<div className="flex flex-wrap gap-2">
					{comment.media.map((image) => (
						<img
							src={`/api/uploads${image.url}`}
							alt={image.name ?? image.url}
							key={image.id}
							className="mt-2 h-24 w-24 rounded-sm object-cover"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
