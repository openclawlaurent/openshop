import React from 'react';

export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block' }}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" opacity="0.1" />
      
      {/* Outer ring */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
      
      {/* Shopping bag */}
      <g transform="translate(50, 50)">
        {/* Bag body */}
        <path
          d="M -15 -8 L -15 12 Q -15 18 -9 18 L 9 18 Q 15 18 15 12 L 15 -8"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Bag handles */}
        <path
          d="M -10 -8 Q -10 -18 0 -20 Q 10 -18 10 -8"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Coin inside */}
        <circle cx="0" cy="4" r="5" fill="url(#logoGradient)" opacity="0.7" />
        
        {/* Shine on coin */}
        <circle cx="-1.5" cy="2" r="1.5" fill="white" opacity="0.5" />
      </g>
      
      {/* Gradients */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
