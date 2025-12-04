import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Card = styled.article`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.md};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const Image = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: ${({ $tallMobile }) => $tallMobile ? '220px' : '140px'};
  }
`

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.muted};
`

export function ServiceCard({ image, title, price, rating, to, $tallMobile = false }) {
  const CardLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: inherit;
  `
  const Inner = (
    <Card>
      <Image src={image} alt={title} $tallMobile={$tallMobile} />
      <Content>
        <Title>{title}</Title>
        <Meta>
          <span>${price}</span>
          <span>★ {rating}</span>
        </Meta>
      </Content>
    </Card>
  )
  return to ? <CardLink to={to} aria-label={`Ver ${title}`}>{Inner}</CardLink> : Inner
}

export default ServiceCard