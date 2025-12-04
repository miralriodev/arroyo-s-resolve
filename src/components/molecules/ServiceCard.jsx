import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Image = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: ${({ $tallMobile }) => $tallMobile ? '220px' : '140px'};
  }
`

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
`

const Card = styled.article`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
    border-color: ${({ theme }) => theme.colors.primary};
    ${Image} {
      transform: scale(1.05);
    }
    ${Overlay} {
      opacity: 1;
    }
  }
`

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
`

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`

export function ServiceCard({ image, title, price, rating, to, $tallMobile = false }) {
  const Inner = (
    <Card>
      <ImageContainer>
        <Image src={image} alt={title} $tallMobile={$tallMobile} />
        <Overlay />
      </ImageContainer>
      <Content>
        <Title>{title}</Title>
        <Meta>
          <span>${price} / noche</span>
          <span>★ {rating.toFixed(1)}</span>
        </Meta>
      </Content>
    </Card>
  )
  return to ? <CardLink to={to} aria-label={`Ver ${title}`}>{Inner}</CardLink> : Inner
}

export default ServiceCard