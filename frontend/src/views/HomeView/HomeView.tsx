import RefreshIcon from '@mui/icons-material/Refresh';
import { useHealth } from '@hooks/useHealth';
import './HomeView.css';

export function HomeView() {
  const { state, actions } = useHealth();

  return (
    <section className='home-view'>
      <h1>POP</h1>
      <p>Szkielet projektu działa. Status backendu:</p>
      <div className='home-view__status'>
        {state.isLoading && <span>Sprawdzanie...</span>}
        {state.errorMessage && (
          <span className='home-view__error'>{state.errorMessage}</span>
        )}
        {state.health && (
          <span className='home-view__ok'>
            API: {state.health.status}, baza: {state.health.database}
          </span>
        )}
        <button
          className='home-view__button'
          onClick={actions.onRefresh}
          disabled={state.isLoading}
        >
          <RefreshIcon fontSize='small' /> Odśwież
        </button>
      </div>
    </section>
  );
}
