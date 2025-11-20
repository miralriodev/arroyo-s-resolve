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
  border: 1.5px solid rgba(33, 53, 71, 0.30);
  border-radius: ${({ theme }) => theme.radius.lg};
  background: #fff;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  line-height: 1.25;
  &:focus-within {
    box-shadow: 0 0 0 3px rgba(33, 53, 71, 0.12);
  }
`

export const PillGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ cols = 2 }) => cols}, 1fr);
  border: 1.5px solid rgba(33, 53, 71, 0.30);
  border-radius: ${({ theme }) => theme.radius.lg};
  background: #fff;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
  align-items: stretch;
  &:focus-within {
    box-shadow: 0 0 0 3px rgba(33, 53, 71, 0.12);
  }
`

export const PillCell = styled.div`
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(3.5)}`};
  display: grid;
  align-items: start;
  gap: ${({ theme }) => theme.spacing(1)};
  min-height: 58px;
  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.border};
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