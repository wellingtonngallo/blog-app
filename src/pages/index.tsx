import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

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

   const getMorePosts = async () => {
    const newPosts = await fetch(postsPagination.next_page)
      .then(result => result.json())
      .then(data => {
        return data.results.map((post: Post) => {
          return {
            uuid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        });
      });

    setPosts([...posts, newPosts]);
  }

  return (
    <div className={commonStyles.container}>
      <ul className={styles.list}>
        {posts.map(post => (
          <li key={`${post.uid}${post.data.title}`} className={styles.post}>
            <h3>{post.data.title}</h3>
            <p>{post.data.subtitle}</p>
            <div className={styles.info}>
              <time>
                <FiCalendar/>
              </time>
              <span>
                <FiUsers/>
                <p>{post.data.author}</p>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 20
  });

  const results = postsResponse.results.map(post => {
    return {
      uuid: post.uid,
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
