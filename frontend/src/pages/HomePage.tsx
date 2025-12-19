import { useNavigate } from 'react-router-dom';
import SplineViewer from '../components/SplineViewer';
import { splineScenes } from '../config/splineConfig';

const HomePage = () => {
    const navigate = useNavigate();
    
    const handleSplineLoad = (splineApp: any) => {
        console.log('✅ Spline loaded:', splineApp);
    };

    // ⭐ Navigate to dashboard page
    const handleGetStarted = () => {
        navigate('/dashboard');
    };

    return (
        <div style={{ 
            width: '100vw', 
            height: '100vh', 
            position: 'fixed',
            top: 0,
            left: 0,
            background: '#000000',
            backgroundColor: '#000000',
            overflow: 'hidden',
            margin: 0,
            padding: 0
        }}>
            {/* PERMANENT BLACK BACKGROUND - NEVER DISAPPEARS */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)',
                backgroundColor: '#000000',
                zIndex: 0
            }} />
            
            <SplineViewer
                scene={splineScenes.homepage}
                fallbackBackground="radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)"
                enableInteraction={true}
                onLoad={handleSplineLoad}
            >
                {/* Content Overlay - CENTERED BOTTOM */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: '10%', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    textAlign: 'center',
                    zIndex: 10,
                    pointerEvents: 'none',
                    maxWidth: '700px',
                    padding: '0 20px',
                    animation: 'fadeInUp 1s ease-out forwards',
                    opacity: 0
                }}>
                    <h1 style={{ 
                        color: 'white', 
                        textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                        fontWeight: '600',
                        margin: 0,
                        letterSpacing: '0.02em',
                        marginBottom: '1rem'
                    }}>
                        Manage Your Finances Intuitively
                    </h1>
                    
                    <p style={{
                        color: '#89faff',
                        fontSize: '1.2rem',
                        marginTop: '1rem',
                        textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                        opacity: 0.9
                    }}>
                        Experience the future of financial management
                    </p>

                    <div style={{ 
                        marginTop: '2rem',
                        pointerEvents: 'auto'
                    }}>
                        <button
                            onClick={handleGetStarted}
                            style={{
                                background: 'linear-gradient(135deg, #89faff 0%, #4facfe 100%)',
                                border: 'none',
                                padding: '12px 32px',
                                borderRadius: '25px',
                                color: '#000',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(137, 250, 255, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(137, 250, 255, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(137, 250, 255, 0.3)';
                            }}
                        >
                            Get Started
                        </button>
                    </div>
                    
                    <style>{`
                        @keyframes fadeInUp {
                            from {
                                opacity: 0;
                                transform: translate(-50%, 30px);
                            }
                            to {
                                opacity: 1;
                                transform: translate(-50%, 0);
                            }
                        }
                    `}</style>
                </div>
            </SplineViewer>
        </div>
    );
};

export default HomePage;