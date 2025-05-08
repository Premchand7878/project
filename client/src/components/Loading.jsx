// import { HashLoader } from 'react-spinners'

// export default function Loading() {
//     return (
//         <div className="loading-spinner">
//             <HashLoader
//                 color="#feab5e"
//                 size={100}
//                 speedMultiplier={1.5}
//             />
//         </div>
//     )
// }



import { useState, useEffect } from 'react';
import { HashLoader } from 'react-spinners';

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa'
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem'
  },
  talentSphereText: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'blue',
    transition: 'opacity 0.4s ease-in-out',
    textShadow: '0 0 10px rgba(73, 140, 240, 0.64)'
  },
  fadeIn: {
    opacity: 1
  },
  fadeOut: {
    opacity: 0.3
  }
};

export default function Loading() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 800); // Blink every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingContent}>
        <h1 style={{
          ...styles.talentSphereText,
          ...(isVisible ? styles.fadeIn : styles.fadeOut)
        }}>
          Talent Sphere
        </h1>
        <HashLoader
          color="blue"
          size={60}
          speedMultiplier={1.5}
        />
      </div>
    </div>
  );
}