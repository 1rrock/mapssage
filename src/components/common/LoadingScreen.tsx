'use client';

import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative h-24 w-24 flex items-center justify-center"
                >
                    <span className="text-6xl">📍</span>
                </motion.div>
                <div className="flex flex-col items-center gap-1">
                    <h1 className="text-2xl font-black tracking-tighter text-foreground">Mapssage</h1>
                    <p className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
                        Loading your moments
                    </p>
                </div>
            </div>
        </div>
    );
}
