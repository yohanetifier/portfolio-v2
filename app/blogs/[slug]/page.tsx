import AlignWrapper from '@/common/components/AlignWrapper/AlignWrapper';
import { postsBySlugViewModel } from '@/src/viewmodels/PostsBySlugViewModel';
import React from 'react';

interface Props {
  params: {
    slug: string;
  };
}

const page = async ({ params }: Props) => {
  const { slug } = await params;
  const data = await postsBySlugViewModel(slug);
  console.log('data', data);
  return (
    <AlignWrapper>
      <h1>{data?.title}</h1>
    </AlignWrapper>
  );
};

export default page;
