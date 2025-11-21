import styled from 'styled-components'

export const Card = styled.section`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
`

export const CardHeader = styled.header`
  padding: ${({ theme }) => theme.spacing(5)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const CardDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`

export const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing(5)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
`

export const CardFooter = styled.footer`
  padding: ${({ theme }) => theme.spacing(5)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: space-between;
  align-items: center;
`