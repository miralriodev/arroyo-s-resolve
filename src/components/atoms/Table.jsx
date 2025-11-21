import styled from 'styled-components'

export const Table = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow-x: auto;
`

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || '1fr'};
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  font-weight: 600;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: ${({ $sticky }) => ($sticky ? 'sticky' : 'static')};
  top: ${({ $sticky }) => ($sticky ? 0 : 'auto')};
  background: ${({ theme }) => theme.colors.surface};
  z-index: ${({ $sticky }) => ($sticky ? 2 : 1)};
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
  background: ${({ $odd, theme }) => ($odd ? theme.colors.surfaceAlt : 'transparent')};
  transition: background 120ms ease;
  &:hover { background: ${({ theme }) => theme.colors.highlight}; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

export const TableCell = styled.div`
  color: ${({ theme }) => theme.colors.text};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const TableActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
`