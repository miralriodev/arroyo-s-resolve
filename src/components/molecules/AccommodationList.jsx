import { useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '../atoms/Button'
import { Table, TableHeader, TableRow, TableCell, TableActions } from '../atoms/Table'

const HeaderButton = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
`

export default function AccommodationList({ items, onEdit, onDelete }) {
  const [sortBy, setSortBy] = useState('title')
  const [sortDir, setSortDir] = useState('asc')

  const toggleSort = (field) => {
    setSortBy(field)
    setSortDir(prev => (sortBy === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'))
  }
  const renderSort = (field) => {
    if (sortBy !== field) return ''
    return sortDir === 'asc' ? '↑' : '↓'
  }
  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    const cmp = (a, b) => {
      switch (sortBy) {
        case 'title': return ((a.title || '').toLowerCase()).localeCompare((b.title || '').toLowerCase()) * dir
        case 'price': return ((Number(a.price) || 0) - (Number(b.price) || 0)) * dir
        case 'rating': return ((Number(a.rating) || 0) - (Number(b.rating) || 0)) * dir
        default: return 0
      }
    }
    return [...(items || [])].sort(cmp)
  }, [items, sortBy, sortDir])

  return (
    <Table>
      <TableHeader $sticky cols="1fr 140px 140px 220px">
        <TableCell><HeaderButton onClick={() => toggleSort('title')}>Título {renderSort('title')}</HeaderButton></TableCell>
        <TableCell><HeaderButton onClick={() => toggleSort('price')}>Precio {renderSort('price')}</HeaderButton></TableCell>
        <TableCell><HeaderButton onClick={() => toggleSort('rating')}>Rating {renderSort('rating')}</HeaderButton></TableCell>
        <TableCell>Acciones</TableCell>
      </TableHeader>
      {sorted.map((it, idx) => (
        <div key={it.id}>
          <TableRow $odd={idx % 2 === 1} cols="1fr 140px 140px 220px">
            <TableCell>{it.title}</TableCell>
            <TableCell>${Number(it.price)}</TableCell>
            <TableCell>★ {Number(it.rating)}</TableCell>
            <TableActions>
              <Button onClick={() => onEdit(it)}>Editar</Button>
              <Button onClick={() => onDelete(it.id)}>Eliminar</Button>
            </TableActions>
          </TableRow>
        </div>
      ))}
    </Table>
  )
}