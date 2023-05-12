import type { Media, Rating, User, Comment } from "@prisma/client";
import RatingBar from "./RatingBar";

export default function CommentItem({
  comment,
  rating,
}: {
  comment: Comment & {
    user: User;
    media: Media[];
  };
  rating: Rating[];
}) {
  return (
    <div>
      <div className='flex items-start gap-4'>
        <div className='w-10 h-10 rounded-full mt-1 overflow-hidden bg-slate-300 shrink-0'>
          {comment.user.avatar && (
            <img
              src={comment.user.avatar}
              alt=''
              className='w-full h-full object-cover object-center'
            />
          )}
        </div>
        <div className='flex-1'>
          <div className='flex items-baseline gap-2 justify-between md:justify-start md:gap-12'>
            <p className='text-lg/none font-medium'>{comment.user.username}</p>
            <p className='text-slate-500'>
              {new Date(comment.createdAt).toLocaleString("ru-ru", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <RatingBar
              ratings={rating.filter(
                (rating) => rating.userId === comment.userId
              )}
            />
          </div>
          <p>{comment.text}</p>
          <div className="flex flex-wrap gap-2">
            {comment.media.map(image => (
              <img src={image.url} alt={image.url} key={image.id} className="w-24 h-24 rounded mt-2 object-cover" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
