import { useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import { Comments } from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: Boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const router = useRouter();

  const readTime = useMemo(() => {
    const HUMAN_READ_WORDS_PER_MINUTE = 200;

    const words = post?.data?.content?.reduce((contentWords, content) => {
      contentWords.push(...content.heading.split(' '));

      const sanitizedContent = RichText.asText(content.body)
        .replace(/[^\w|\s]/g, '')
        .split(' ');

      contentWords.push(...sanitizedContent);

      return contentWords;
    }, []);

    return Math.ceil(words?.length / HUMAN_READ_WORDS_PER_MINUTE);
  }, [post]);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <img src={post?.data.banner.url} alt={post?.data.author} />
        <article className={commonStyles.container}>
          <header>
            <h1>{router.isFallback ? 'Carregando...' : post?.data.title}</h1>
            <div className={commonStyles.postInfo}>
              <time>
                <FiCalendar />
                {format(new Date(post?.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                }) ?? 'Data de publicação'}
              </time>
              <span>
                <FiUser />
                {post?.data.author ?? 'Autor'}
              </span>
              <span>
                <FiClock /> {readTime ? `${readTime} min` : 'Tempo de leitura'}
              </span>
            </div>
          </header>
          <main>
            {post?.data?.content?.map(groupContent => (
              <div key={groupContent.heading}>
                <h2>{groupContent.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(groupContent.body),
                  }}
                />
              </div>
            ))}
          </main>
        </article>
      </div>
      <Comments />

      {preview && <button>Teste</button>}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false
}) => {
  const { slug } = params;

  console.log(slug);
  console.log(slug);
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
      preview,
    },
  };
};
