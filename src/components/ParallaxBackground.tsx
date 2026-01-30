import React, { useEffect, useRef, useState } from 'react';
import backgroundImage from '../assets/background-image.png';
import './ParallaxBackground.css';

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

const ParallaxBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clouds] = useState<Cloud[]>(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 40 + 10,
      size: Math.random() * 60 + 40,
      speed: Math.random() * 0.3 + 0.1,
    }))
  );

  useEffect(() => {

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const moveX = (mouseX - centerX) / centerX;
      const moveY = (mouseY - centerY) / centerY;

      clouds.forEach((cloud) => {
        const cloudElement = document.getElementById(`cloud-${cloud.id}`);
        if (cloudElement) {
          const intensity = cloud.speed * 20;
          const translateX = moveX * intensity;
          const translateY = moveY * intensity;
          cloudElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [clouds]);

  return (
    <div ref={containerRef} className="parallax-background">
      {/* 그라데이션 배경 */}
      <div className="background-gradient" />
      
      {/* 배경 이미지 */}
      <div 
        className="background-image" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* 구름들 */}
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          id={`cloud-${cloud.id}`}
          className="cloud"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
          }}
        />
      ))}
    </div>
  );
};

export default ParallaxBackground;

