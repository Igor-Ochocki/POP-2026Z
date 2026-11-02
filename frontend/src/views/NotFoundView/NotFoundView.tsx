import { Link } from 'react-router';

export function NotFoundView() {
  return (
    <section>
      <h1>404</h1>
      <p>Nie znaleziono strony.</p>
      <Link to='/'>Wróć na stronę główną</Link>
    </section>
  );
}
