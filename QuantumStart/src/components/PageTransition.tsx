import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface PageTransitionProps {
    children: ReactNode
}

/**
 * CONFIGURATION: Adjust these values to fine-tune the transition.
 */
const transitionConfig = {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1], // cubic-bezier(0.22, 1, 0.36, 1)
    yOffset: 30, // How many pixels to slide up/down
}

/**
 * Wraps page content in a fade + slide transition using framer-motion.
 * mode="wait" ensures sequential transition: A fades out -> B fades in.
 */
export default function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ 
                    opacity: 0, 
                    y: transitionConfig.yOffset 
                }}
                animate={{ 
                    opacity: 1, 
                    y: 0 
                }}
                exit={{ 
                    opacity: 0, 
                    y: -transitionConfig.yOffset 
                }}
                transition={{ 
                    duration: transitionConfig.duration, 
                    ease: transitionConfig.ease 
                }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    willChange: 'opacity, transform',
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
