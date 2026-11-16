'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface Onboarding3DButtonProps {
  defaultText: string
  hoverText: string
  onClick?: () => void
  href?: string
  className?: string
}

export function Onboarding3DButton({ defaultText, hoverText, onClick, href, className = '' }: Onboarding3DButtonProps) {
  const router = useRouter()
  
  const handleClick = () => {
    if (onClick) onClick()
    if (href) router.push(href)
  }
  return (
    <div className={`container-button ${className}`} onClick={handleClick}>
      <div className="hover-zone bt-1"></div>
      <div className="hover-zone bt-2"></div>
      <div className="hover-zone bt-3"></div>
      <div className="hover-zone bt-4"></div>
      <div className="hover-zone bt-5"></div>
      <div className="hover-zone bt-6"></div>
      <button data-default={defaultText} data-hover={hoverText}></button>
    </div>
  )
}
