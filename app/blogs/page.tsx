import AlignWrapper from '@/common/components/AlignWrapper/AlignWrapper';
import { postsViewModel } from '@/src/viewmodels/PostViewModel';
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
      <div>
        {data?.map((blog, index) => {
          const dateFormat = formatedDate(blog.date);
          console.log(dateFormat);
          return (
            <div key={index}>
              <p>{blog.date}</p>
              <h2>{blog.title}</h2>
            </div>
          );
        })}
      </div>
    </AlignWrapper>
  );
};

export default page;
