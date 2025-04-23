import AlignWrapper from '@/common/components/AlignWrapper/AlignWrapper';
import { postsBySlugViewModel } from '@/src/viewmodels/PostsBySlugViewModel';
import React from 'react';

type Params = Promise<{ slug: string }>;

const BlogsPage = async (props: { params: Params }) => {
  const { slug } = await props.params;
  const data = await postsBySlugViewModel(slug);

  return (
    <AlignWrapper>
      <h1>{data?.title}</h1>
    </AlignWrapper>
  );
};

export default BlogsPage;
