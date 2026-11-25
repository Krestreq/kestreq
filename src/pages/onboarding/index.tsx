import type { CSSProperties } from 'react'

const styles: { onboarding: CSSProperties; spinner: CSSProperties } = {
  onboarding: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 2s linear infinite',
  },
}

function index() {
  return (
    <>
      <div className="onboarding" style={styles.onboarding}>
        <img src="/images/onboarding.png" alt="onboarding" />
        <div className="spinner" style={styles.spinner}></div>
      </div>
    </>
  )
}

export default index