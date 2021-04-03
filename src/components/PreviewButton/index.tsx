import Link from 'next/link';
import styles from './preview-button.module.scss';

export function PreviewButton(): JSX.Element {
  return (
    <div className={styles.container}>
      <button>
        <Link href="/api/exit-preview">
          <a>Sair do modo Preview</a>
        </Link>
      </button>
    </div>
  )
}
