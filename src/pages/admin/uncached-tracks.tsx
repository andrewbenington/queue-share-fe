import { useCallback, useContext, useEffect, useState } from 'react'
import QSDataGrid from '../../components/display/qs-data-grid'
import { GetTableData } from '../../service/admin'
import { AuthContext } from '../../state/auth'
import { TableData } from '../../types/admin'
import { displayError } from '../../util/errors'
import { numericSorter, SortableColumn, stringSorter } from '../../util/sort'

const columns: SortableColumn<TableData>[] = [
  { key: 'table', name: 'Table', sortFunction: stringSorter((val) => val.table) },
  {
    key: 'rel_size_pretty',
    name: 'Size (Rows)',
    sortFunction: numericSorter((val) => val.rel_size_bytes),
  },
  {
    key: 'index_size_pretty',
    name: 'Size (Indexes)',
    sortFunction: numericSorter((val) => val.index_size_bytes),
  },
  {
    key: 'total_size_pretty',
    name: 'Size (Total)',
    sortFunction: numericSorter((val) => val.total_size_bytes),
  },
]
export default function TablesPage() {
  const [authState] = useContext(AuthContext)
  const [tableData, setTableData] = useState<TableData[]>()

  const fetchData = useCallback(async () => {
    if (!authState.access_token) return
    const response = await GetTableData(authState.access_token)
    if ('error' in response) {
      displayError(response.error)
      return
    }
    setTableData(response)
  }, [authState.access_token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    tableData && (
      <div className="table-container">
        <QSDataGrid columns={columns} rows={tableData} />
      </div>
    )
  )
}
