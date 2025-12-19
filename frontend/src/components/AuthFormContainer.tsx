import { motion } from 'framer-motion';
import styles from './AuthFormContainer.module.css';

interface AuthFormContainerProps {
    children: React.ReactNode;
    title: string;
}

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({ children, title }) => {
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.formWrapper}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
                <h2 className={styles.title}>{title}</h2>
                {children}
            </motion.div>
        </div>
    );
};

export default AuthFormContainer;