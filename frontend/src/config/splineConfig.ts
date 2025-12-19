// Spline Scene Configuration
// Replace these URLs with your actual Spline scene URLs from https://my.spline.design/

export const splineScenes = {
    // Your scene - trying multiple URL formats
    homepage: "https://prod.spline.design/6FMMxs3ClN3sFM8j/scene.splinecode",
    //homepage1: "https://prod.spline.design/pbwxp0ivRHPBi-tt/scene.splinecode",
    
    // Alternative formats to try for your scene
    homepage_alt1: "https://my.spline.design/6FMMxs3ClN3sFM8j",
    homepage_alt2: "https://app.spline.design/6FMMxs3ClN3sFM8j",
    
    // Working test scenes for comparison
    animated_test: "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode",
    working_demo: "https://prod.spline.design/pvM5eSdWQi65dXbp/scene.splinecode",
    
    // More test scenes that definitely work
    floating_objects: "https://prod.spline.design/lKrGJW5lQkV49fuS/scene.splinecode",
    
    // About page - Abstract geometric shapes  
    about: "https://prod.spline.design/lKrGJW5lQkV49fuS/scene.splinecode",
    
    // Features page - Tech/data visualization
    features: "https://prod.spline.design/pvM5eSdWQi65dXbp/scene.splinecode",
    
    // Contact page - Floating elements        e
    contact: "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode",
    
    // If you want to use NO spline at all, use this:
    disabled: null   
};

export const splineConfig = {
    // Default settings for all Spline scenes
    defaultTimeout: 2000, // Reduced to 2 seconds
    enableInteraction: true,
    
    // Performance settings
    lowEnd: {
        timeout: 1000, // Very fast timeout for low-end devices
        enableInteraction: false
    },
    
    // Mobile settings
    mobile: {
        timeout: 1500, // Fast timeout for mobile
        enableInteraction: true
    }
};

// Helper function to detect device capability
export const getSplineConfig = () => {
    const isMobile = window.innerWidth <= 768;
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    
    if (isLowEnd) {
        return splineConfig.lowEnd;
    } else if (isMobile) {
        return splineConfig.mobile;
    } else {
        return {
            timeout: splineConfig.defaultTimeout,
            enableInteraction: splineConfig.enableInteraction
        };
    }
};