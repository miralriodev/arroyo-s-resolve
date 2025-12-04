import styled from 'styled-components'

export const FieldLabel = styled.small`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 500;
  line-height: 1.25;
`

export const FieldPill = styled.label`
  display: grid;
  align-items: start;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
  min-height: 72px;
  border: 1px solid #e0e0e0;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: #fff;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: none;
  line-height: 1.25;
  transition: all 100ms ease-in-out;
  &:focus-within {
    border-color: #fb8500;
    box-shadow: 0 0 0 3px #fb850020;
  }
`

export const PillGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ cols = 2 }) => cols}, 1fr);
  border: 1px solid #e0e0e0;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: #fff;
  box-shadow: none;
  overflow: hidden;
  align-items: stretch;
  transition: all 100ms ease-in-out;
  &:focus-within {
    border-color: #fb8500;
    box-shadow: 0 0 0 3px #fb850020;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`

export const PillCell = styled.div`
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(3.5)}`};
  display: grid;
  align-items: start;
  gap: ${({ theme }) => theme.spacing(1)};
  min-height: 58px;
  &:not(:last-child) {
    border-right: 1px solid #e0e0e0;
  }
`

// Fila para contenido del campo (input/select + icono derecho)
export const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  > input,
  > select {
    flex: 1;
  }
`

// Icono a la derecha del campo (por ejemplo, calendario o chevron)
export const RightIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 20px;
`

export default { FieldLabel, FieldPill, PillGroup, PillCell, FieldRow, RightIcon }