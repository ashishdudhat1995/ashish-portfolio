import React, { useEffect, useRef } from 'react';

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes for 3D depth field (reduced on mobile/reduced-motion)
    const baseParticlesCount = isMobile ? 20 : 50;
    const numParticles = Math.min(Math.floor(width / 24), baseParticlesCount);
    const maxConnectDist = isMobile ? 100 : 140;

    const particles: Array<{
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 1,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 2 + 1,
        vx: isReducedMotion ? 0 : (Math.random() - 0.5) * 0.3,
        vy: isReducedMotion ? 0 : (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      if (isReducedMotion) return;
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let rotationAngle = 0;

    const render = () => {
      if (document.hidden) {
        // Pause animation when tab is hidden to conserve GPU/CPU resources
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Mouse lerp
      if (!isReducedMotion) {
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
      }

      const offsetX = (mouseX - width / 2) * 0.02;
      const offsetY = (mouseY - height / 2) * 0.02;

      // Background gradient
      const bgGlow = ctx.createRadialGradient(
        mouseX,
        mouseY,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGlow.addColorStop(0, 'rgba(37, 99, 235, 0.06)');
      bgGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.02)');
      bgGlow.addColorStop(1, 'rgba(5, 8, 17, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Render 3D Depth Particle Lattice
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!isReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -width / 2) p.x = width / 2;
          if (p.x > width / 2) p.x = -width / 2;
          if (p.y < -height / 2) p.y = height / 2;
          if (p.y > height / 2) p.y = -height / 2;
        }

        const fov = 400;
        const scale = fov / (fov + p.z);
        const projX = width / 2 + (p.x + offsetX) * scale;
        const projY = height / 2 + (p.y + offsetY) * scale;
        const projSize = Math.max(0.5, p.size * scale);

        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * scale})`;
        ctx.beginPath();
        ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const scale2 = fov / (fov + p2.z);
            const projX2 = width / 2 + (p2.x + offsetX) * scale2;
            const projY2 = height / 2 + (p2.y + offsetY) * scale2;

            ctx.strokeStyle = `rgba(37, 99, 235, ${(1 - dist / maxConnectDist) * 0.12 * scale})`;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo(projX2, projY2);
            ctx.stroke();
          }
        }
      }

      // Draw Rotating 3D Wireframe Node (Disabled on mobile / reduced motion)
      if (!isMobile && !isReducedMotion) {
        rotationAngle += 0.003;
        const cubeSize = 50;
        const cubeCenterX = width * 0.85 + offsetX * 0.4;
        const cubeCenterY = height * 0.25 + offsetY * 0.4;

        const vertices = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
        ];

        const projected: Array<[number, number]> = [];

        for (const v of vertices) {
          let x1 = v[0] * Math.cos(rotationAngle) - v[2] * Math.sin(rotationAngle);
          let z1 = v[0] * Math.sin(rotationAngle) + v[2] * Math.cos(rotationAngle);
          let y1 = v[1] * Math.cos(rotationAngle * 0.7) - z1 * Math.sin(rotationAngle * 0.7);

          const px = cubeCenterX + x1 * cubeSize;
          const py = cubeCenterY + y1 * cubeSize;
          projected.push([px, py]);
        }

        const edges = [
          [0,1],[1,2],[2,3],[3,0],
          [4,5],[5,6],[6,7],[7,4],
          [0,4],[1,5],[2,6],[3,7]
        ];

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        for (const [start, end] of edges) {
          ctx.beginPath();
          ctx.moveTo(projected[start][0], projected[start][1]);
          ctx.lineTo(projected[end][0], projected[end][1]);
          ctx.stroke();
        }
      }

      // If reduced-motion is requested, render once and do not continue continuous animation loop
      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
