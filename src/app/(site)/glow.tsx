"use client";

import { useEffect, useRef } from "react";

export default function GrainOverlay() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let noiseData: ImageData[] = []
        let frame = 0
        let loopTimeout: number

        const createNoise = (w: number, h: number) => {
            const idata = ctx.createImageData(w, h)
            const buffer32 = new Uint32Array(idata.data.buffer)
            for (let i = 0; i < buffer32.length; i++) {
                const rand = Math.random()
                if (rand < 0.33)
                    buffer32[i] = 0xff000000 // black
                else if (rand < 0.66) buffer32[i] = 0xffffffff // white
                // else transparent (leave as 0)
            }
            noiseData.push(idata)
        }

        const paintNoise = () => {
            if (noiseData.length > 0) {
                frame = (frame + 1) % noiseData.length
                ctx.putImageData(noiseData[frame], 0, 0)
            }
        }

        const loop = () => {
            paintNoise()
            loopTimeout = window.setTimeout(() => {
                requestAnimationFrame(loop)
            }, 1000 / 25)
        }

        const setup = () => {
            const w = container.offsetWidth
            const h = container.offsetHeight
            if (w === 0 || h === 0) return

            // Increase resolution for smaller grain pixels
            const scale = 4 
            canvas.width = w * scale
            canvas.height = h * scale
            canvas.style.width = w + 'px'
            canvas.style.height = h + 'px'
            
            noiseData = []
            for (let i = 0; i < 10; i++) createNoise(w * scale, h * scale)
            loop()
        }

        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(loopTimeout)
            setup()
        })

        resizeObserver.observe(container)
        setup()

        return () => {
            resizeObserver.disconnect()
            clearTimeout(loopTimeout)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: -1,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    mixBlendMode: "screen",
                    opacity: 0.12,
                }}
            />
        </div>
    )
}
