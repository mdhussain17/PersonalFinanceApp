import { motion } from 'framer-motion';
import SplineViewer from '../components/SplineViewer';
import { splineScenes, getSplineConfig } from '../config/splineConfig';

const AboutPage = () => {
    const config = getSplineConfig();
    
    const handleSplineLoad = () => {
        console.log('About page Spline loaded successfully!');
    };

    return (
        <div style={{ 
            width: '100vw', 
            height: '100vh', 
            position: 'relative',
            overflow: 'hidden'
        }}>
            <SplineViewer
                scene={splineScenes.about}
                fallbackBackground="radial-gradient(circle at center, #1a2a3a 0%, #000000 70%)"
                loadingTimeout={config.timeout}
                enableInteraction={config.enableInteraction}
                onLoad={handleSplineLoad}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            >
                {/* About Page Content Overlay */}
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    textAlign: 'center',
                    zIndex: 10,
                    pointerEvents: 'none',
                    maxWidth: '800px',
                    padding: '0 20px'
                }}>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8, delay: 0.3 }}
                        style={{ 
                            color: 'white', 
                            textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: '700',
                            margin: 0,
                            letterSpacing: '0.02em'
                        }}
                    >
                        About Our Vision
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 0.9, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        style={{
                            color: '#a0c4ff',
                            fontSize: '1.3rem',
                            marginTop: '1.5rem',
                            textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                            lineHeight: '1.6'
                        }}
                    >
                        We're revolutionizing financial management through 
                        cutting-edge 3D visualization and intuitive design.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '2rem',
                            marginTop: '3rem',
                            pointerEvents: 'auto'
                        }}
                    >
                        {[
                            { title: "Innovation", desc: "Pushing boundaries in fintech" },
                            { title: "User-Centric", desc: "Designed for real people" },
                            { title: "Secure", desc: "Bank-level security standards" }
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '15px',
                                    padding: '1.5rem',
                                    border: '1px solid rgba(160, 196, 255, 0.2)'
                                }}
                            >
                                <h3 style={{
                                    color: '#89faff',
                                    fontSize: '1.2rem',
                                    margin: '0 0 0.5rem 0'
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontSize: '1rem',
                                    margin: 0,
                                    lineHeight: '1.5'
                                }}>
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </SplineViewer>
        </div>
    );
};

export default AboutPage;