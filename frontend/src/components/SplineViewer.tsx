import React, { useState, useRef, Suspense } from 'react';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

interface SplineViewerProps {
    scene: string | null;
    className?: string;
    style?: React.CSSProperties;
    fallbackBackground?: string;
    loadingTimeout?: number;
    enableInteraction?: boolean;
    onLoad?: (splineApp?: any) => void;
    children?: React.ReactNode;
}

const SplineViewer: React.FC<SplineViewerProps> = ({
    scene,
    className = '',
    style = {},
    fallbackBackground = 'radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)',
    enableInteraction = true,
    onLoad,
    children
}) => {
    const [splineLoaded, setSplineLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const splineRef = useRef<any>(null);

    const handleSplineLoad = (splineApp: any) => {
        console.log('✅ Spline loaded successfully');
        setSplineLoaded(true);
        setHasError(false);
        splineRef.current = splineApp;
        onLoad?.(splineApp);
    };

    const handleSplineError = (error: any) => {
        console.error('❌ Spline error:', error);
        setHasError(true);
    };

    // Simple, bulletproof container style
    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        minWidth: '100vw',
        background: fallbackBackground,
        backgroundColor: '#000000',
        overflow: 'hidden',
        ...style
    };

    return (
        <div className={className} style={containerStyle}>
            {/* TRIPLE LAYER PROTECTION - NEVER black screen */}
            
            {/* Layer 1: Solid color backup */}
            <div 
                style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#000000',
                    zIndex: 0
                }}
            />
            
            {/* Layer 2: Gradient background */}
            <div 
                style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: fallbackBackground,
                    zIndex: 1
                }}
            />
            
            {/* Layer 3: Animated particles */}
            <div 
                style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 2
                }}
            >
                {/* CSS-only particles - NO React animations */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '3px',
                            height: '3px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            opacity: 0.2,
                            left: `${(i * 23 + 10) % 90}%`,
                            top: `${(i * 37 + 15) % 80}%`,
                            animation: `float${i % 3} ${3 + (i % 3)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`
                        }}
                    />
                ))}
                <style>{`
                    @keyframes float0 {
                        0%, 100% { transform: translateY(-20px); opacity: 0.1; }
                        50% { transform: translateY(20px); opacity: 0.3; }
                    }
                    @keyframes float1 {
                        0%, 100% { transform: translateY(-15px); opacity: 0.15; }
                        50% { transform: translateY(15px); opacity: 0.3; }
                    }
                    @keyframes float2 {
                        0%, 100% { transform: translateY(-25px); opacity: 0.1; }
                        50% { transform: translateY(25px); opacity: 0.35; }
                    }
                `}</style>
            </div>

            {/* Spline overlay - only shows when loaded */}
            {!hasError && scene && (
                <div 
                    style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                        backgroundColor: 'transparent'
                    }}
                >
                    <Suspense fallback={null}>
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                opacity: splineLoaded ? 0.85 : 0,
                                transition: 'opacity 2s ease-in-out',
                                pointerEvents: enableInteraction ? 'auto' : 'none',
                                backgroundColor: 'transparent'
                            }}
                        >
                            <Spline
                                scene={scene}
                                onLoad={handleSplineLoad}
                                onError={handleSplineError}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'transparent'
                                }}
                            />
                        </div>
                    </Suspense>
                </div>
            )}

            {/* Content overlay */}
            {children && (
                <div 
                    style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 20,
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{ pointerEvents: 'auto' }}>
                        {children}
                    </div>
                </div>
            )}

            {/* Loading indicator - keeps user engaged */}
            {!splineLoaded && !hasError && scene && (
                <div
                    style={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 30,
                        textAlign: 'center'
                    }}
                >
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(137, 250, 255, 0.2)',
                        borderTop: '3px solid rgba(137, 250, 255, 0.8)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 15px'
                    }} />
                    <div style={{
                        color: 'rgba(137, 250, 255, 0.9)',
                        fontSize: '14px',
                        fontWeight: '500',
                        letterSpacing: '0.5px'
                    }}>
                        Loading 3D Experience...
                    </div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default SplineViewer;