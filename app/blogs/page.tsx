import AlignWrapper from '@/common/components/AlignWrapper/AlignWrapper';
import { postsViewModel } from '@/src/viewmodels/PostViewModel';
import { Link } from 'next-view-transitions';
import React from 'react';

const page = async () => {
  const data = await postsViewModel();
  const montthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const formatedDate = (date: string) => {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const formatedDate = `${montthNames[month]} ${day}, ${year}`;
    return formatedDate;
  };
  return (
    <AlignWrapper>
      <div className="">
        {data?.map((blog, index) => {
          const dateFormat = formatedDate(blog.date);
          return (
            <Link
              href={`/blogs/${blog.slug}`}
              key={index}
              className="w-[33%] bg-gray-500 h-[300px] rounded-[20px] p-5 flex flex-col gap-[30px] relative z-10"
            >
              <p>{dateFormat}</p>
              <h2 className="text-[25px]">{blog.title}</h2>
            </Link>
          );
        })}
      </div>
    </AlignWrapper>
  );
};

export default page;
