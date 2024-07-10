import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import QSDataGrid from '../../components/display/qs-data-grid'
import UserDisplay from '../../components/friends/user-display'
import { GetTracksToProcess, TracksToProcessResponse } from '../../service/admin'
import { UserData } from '../../service/user'
import { AuthContext } from '../../state/auth'
import { displayError } from '../../util/errors'
import { numericSorter, SortableColumn, stringSorter } from '../../util/sort'

type RowData = { user: UserData; count: number }

const columns: SortableColumn<RowData>[] = [
  {
    key: 'user',
    name: 'User',
    sortFunction: stringSorter((val) => val.user.display_name),
    renderCell: (val) => <UserDisplay user={val.row.user} size={24} />,
    cellClass: 'centered-cell',
    width: 200,
  },
  {
    key: 'count',
    name: 'Track Count',
    sortFunction: numericSorter((val) => val.count),
  },
]
export default function UnprocessedTracksPage() {
  const [authState] = useContext(AuthContext)
  const [unprocessedData, setUnprocessedData] = useState<TracksToProcessResponse>()

  const fetchData = useCallback(async () => {
    if (!authState.access_token) return
    const response = await GetTracksToProcess(authState.access_token)
    if ('error' in response) {
      displayError(response.error)
      return
    }
    setUnprocessedData(response)
  }, [authState.access_token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const rows: RowData[] | undefined = useMemo(
    () =>
      unprocessedData
        ? Object.entries(unprocessedData.missing_by_user).map(([userID, count]) => ({
            user: unprocessedData.users[userID],
            count,
          }))
        : undefined,
    [unprocessedData]
  )

  return (
    rows && (
      <div className="table-container">
        <QSDataGrid columns={columns} rows={rows} />
      </div>
    )
  )
}
