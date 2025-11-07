import styled from 'styled-components'

const Svg = styled.svg`
  display: block;
  width: ${({ size }) => size || '72px'};
  height: auto;
`

export default function LogoIcon({ size = '72px' }) {
  return (
    <Svg size={size} viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lavenderMint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C7B3FF" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>
      </defs>
      {/* Base house/tent with gentle rounded corners */}
      <path
        d="M16 44 L48 20 L80 44 V76 C80 80 78 82 74 82 H22 C18 82 16 80 16 76 Z"
        fill="url(#lavenderMint)"
        stroke="#EAEAEA"
        strokeWidth="1.5"
      />
      {/* Door */}
      <rect x="44" y="58" width="8" height="16" rx="3" fill="#FFFFFF" opacity="0.9" />
    </Svg>
  )
}