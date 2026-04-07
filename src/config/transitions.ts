/**
 * GLOBAL TRANSITION CONFIGURATION
 * 
 * Adjust these values to fine-tune the "fade and slide" animations 
 * across the entire application.
 */

export const TRANSITION_CONFIG = {
  // Main page transition (Slide & Fade)
  page: {
    duration: 0.7,
    ease: [0.6, 0.05, -0.01, 0.9] as any, // Custom cubic-bezier for snappy "quantum" feel
    yOffset: 20, // Slide up subtly
  },

  // Header / Top Nav transition (Slide Down)
  header: {
    duration: 0.8,
    delay: 0.05, // Rapid follow-up
    ease: [0.22, 1, 0.36, 1] as any,
    yOffset: -15, // Slide down from top
  }
}
