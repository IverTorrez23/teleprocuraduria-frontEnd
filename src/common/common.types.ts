type orderType = 'ASC' | 'DESC'
export interface ISearch {
  fields: string[]
  keyword: string
}

export interface ISort {
  field: string
  orderType: orderType
}

export interface IOpcionesPaginado {
  page: number
  perPage: number
  search: ISearch[]
  sort: ISort[]
}

export interface IPaginado {
  rowsPerPage: number
  rowsNumber: number
  totalItems: number
  itemCount: number
  perPage: number
  currentPage: number
}

export interface IPaginationProps {
  page: number
  rowsPerPage: number
  sortBy: string
  descending: boolean
}

export interface IDataTableSortEvent {
  first: number
  rows: number
  sortField?: string | ((item: any) => string)
  sortOrder?: number
}
