import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import { useEffect, useState } from 'react';

import { FiCalendar, FiUsers } from 'react-icons/fi';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [postsNextPage, setPostsNextPage] = useState(postsPagination.next_page);

   const getMorePosts = async () => {
    const postsResponse = await fetch(
      postsPagination.next_page
    ).then(response => response.json());

    const newPost = postsResponse.results.map((post: Post) => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setPosts([...posts, ...newPost]);
    setPostsNextPage(postsResponse.next_page);
  }

  return (
    <div className={`${commonStyles.container} ${styles.container}`}>
      <img src="/images/logo.svg" alt="logo"/>
      <ul className={styles.list}>
        {posts.map(post => (
          <li key={`${post.uid}`} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h3>{post.data.title}</h3>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <time>
                    <FiCalendar/>
                    <p>
                      {
                        format(
                          new Date(
                            post.first_publication_date,
                          ),
                          'dd MMM yyyy',
                          { locale: ptBR }
                        )
                      }
                    </p>
                  </time>
                  <span>
                    <FiUsers/>
                    <p>{post.data.author}</p>
                  </span>
                </div>
              </a>
            </Link>
          </li>
        ))}
      </ul>
      {postsNextPage && (
        <button type="button" onClick={getMorePosts}>
          Carregar mais posts
        </button>
      )}
    </div>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author']
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    }
  }
};
