import styled from 'styled-components'

export const Table = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || '1fr'};
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  font-weight: 600;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`

export const TableRow = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  display: grid;
  grid-template-columns: ${({ cols }) => cols || '1fr'};
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

export const TableCell = styled.div`
  color: ${({ theme }) => theme.colors.text};
`

export const TableActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
`