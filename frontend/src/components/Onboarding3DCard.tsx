'use client'

import React from 'react'

interface Onboarding3DCardProps {
  title: string
  subtitle?: string
  highlight?: string
  prompt?: string
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
}

export function Onboarding3DCard({ 
  title, 
  subtitle, 
  highlight, 
  prompt = "HOVER ME", 
  children,
  onClick,
  disabled,
  selected
}: Onboarding3DCardProps) {
  
  return (
    <div className="onboarding-card-container" onClick={disabled ? undefined : onClick} style={{ filter: disabled ? 'grayscale(1)' : 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      
      {/* 25 tracker elements for 3D tilt tracking */}
      <div className="canvas">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className={`tracker tr-${i + 1}`}></div>
        ))}
        
        <div className="card-bg" style={{ borderColor: selected ? 'var(--accent-primary)' : '' }}>
          <div className="card-content">
            {prompt && <p className="prompt" id="prompt">{prompt}</p>}
            
            <div className="title">
              {title}
              {highlight && <span className="highlight">{highlight}</span>}
            </div>
            
            <div className="subtitle">
              {subtitle}
            </div>
            
            <div className="glowing-elements">
              <div className="glow-1"></div>
              <div className="glow-2"></div>
              <div className="glow-3"></div>
            </div>
            
            <div className="card-particles">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="corner-elements">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="scan-line"></div>
            <div className="cyber-lines">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            
            {/* Custom content rendered below title layer */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none mt-4">
              {children}
            </div>

            <div className="card-glare"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
