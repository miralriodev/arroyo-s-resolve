import styled from 'styled-components'

const Svg = styled.svg`
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
`

export default function IconMoney(props) {
  return (
    <Svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}