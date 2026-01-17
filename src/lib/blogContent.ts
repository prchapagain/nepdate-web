import { BLOG_DATA, Blog } from '../data/blogs';
import { CHADPARBA_DATA } from '../data/static/pageContents';
import BlogImages from '../assets/blogImages';

export const getAllBlogs = (): Blog[] => {
  const chadparbaBlogs: Blog[] = CHADPARBA_DATA.map((item: any) => {
    // Find first paragraph for excerpt
    const firstPara = item.content.find((c: any) => c.type === 'paragraph');
    // Find first image for thumbnail
    const firstImg = item.content.find((c: any) => c.type === 'image');

    return {
      id: item.id,
      title: item.title,
      excerpt: firstPara ? firstPara.text : 'धार्मिक जानकारी...',
      content: '', // Not used in card/list view usually, but might be needed if we pass full object
      image: firstImg ? firstImg.src : BlogImages.nepdateLogo,
      tags: item.tags || [],
      author: 'धर्म/संस्कृति',
      date: 'विशेष', // we might want to format this better based on eventDate if possible later
      readTime: '३ मिनेट',
      eventDate: item.eventDate
    } as Blog;
  });

  return [...BLOG_DATA, ...chadparbaBlogs];
};
