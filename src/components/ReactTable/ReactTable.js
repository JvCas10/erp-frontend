/* eslint-disable */
import React from "react";
import {
  useTable,
  useFilters,
  useSortBy,
  usePagination,
} from "react-table";
import classnames from "classnames";
import { matchSorter } from "match-sorter";
import Select from "react-select";
import { Container, Row, Col, Input } from "reactstrap";

/* =========================
   FILTROS
========================= */

function DefaultColumnFilter({ column: { setFilter } }) {
  return (
    <Input
      type="text"
      placeholder="Search"
      className="rt-input"
      onChange={(e) => setFilter(e.target.value || undefined)}
    />
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, {
    keys: [(row) => row.values[id]],
  });
}
fuzzyTextFilterFn.autoRemove = (val) => !val;

function filterByPrecio(rows, id, filterValue) {
  const [min, max] = filterValue || [];
  return rows.filter((row) => {
    const value = row.values[id];
    if (min != null && max != null) return value >= min && value <= max;
    if (min != null) return value >= min;
    if (max != null) return value <= max;
    return true;
  });
}
filterByPrecio.autoRemove = (val) =>
  !val || (val[0] == null && val[1] == null);

export function RangeSliderFilter({ column: { filterValue = [], setFilter } }) {
  const [min, max] = filterValue || [];

  return (
    <div className="d-flex gap-1">
      <Input
        type="number"
        placeholder="Min"
        className="rt-input"
        onChange={(e) =>
          setFilter([e.target.value ? Number(e.target.value) : null, max])
        }
      />
      <Input
        type="number"
        placeholder="Max"
        className="rt-input"
        onChange={(e) =>
          setFilter([min, e.target.value ? Number(e.target.value) : null])
        }
      />
    </div>
  );
}

/* =========================
   ESTILOS RESPONSIVE
========================= */
const responsiveStyles = `
  @media (max-width: 768px) {
    .rt-pagination-container {
      flex-direction: column !important;
      gap: 10px;
    }
    .rt-pagination-container .rt-pagination-btn {
      width: 100%;
      margin: 5px 0;
    }
    .rt-pagination-container .rt-pagination-selects {
      flex-direction: column;
      width: 100%;
    }
    .rt-pagination-container .rt-pagination-selects > div {
      width: 100% !important;
      margin-bottom: 10px;
    }
    .ReactTable .rt-table {
      min-width: 100% !important;
    }
    .ReactTable .rt-th,
    .ReactTable .rt-td {
      padding: 8px 5px !important;
      font-size: 12px !important;
    }
    .ReactTable .rt-input {
      font-size: 12px !important;
      padding: 4px !important;
    }
  }
`;

/* =========================
   TABLA
========================= */

function Table({ columns, data }) {
  const [numberOfRows, setNumberOfRows] = React.useState({
    value: 10,
    label: "10 filas",
  });
  const [pageSelect, setPageSelect] = React.useState({
    value: 0,
    label: "Página 1",
  });

  const filterTypes = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn,
      precio: filterByPrecio,
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({ Filter: DefaultColumnFilter }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    gotoPage,
    setPageSize,
    pageOptions,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
      initialState: { pageSize: 10, pageIndex: 0 },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const pageSelectOptions = pageOptions.map((_, index) => ({
    value: index,
    label: `Página ${index + 1}`,
  }));

  const rowsOptions = [5, 10, 20, 25, 50, 100].map((n) => ({
    value: n,
    label: `${n} filas`,
  }));

  return (
    <>
      <style>{responsiveStyles}</style>
      <div className="ReactTable -striped -highlight primary-pagination">
        {/* PAGINACIÓN SUPERIOR */}
        <div className="pagination-top">
          <div 
            className="-pagination rt-pagination-container"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0'
            }}
          >
            <div className="-previous rt-pagination-btn">
              <button
                type="button"
                onClick={previousPage}
                disabled={!canPreviousPage}
                className="-btn"
                style={{ width: '100%', minWidth: '80px' }}
              >
                Anterior
              </button>
            </div>

            <div 
              className="-center rt-pagination-selects"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                flex: 1,
                justifyContent: 'center',
                padding: '0 10px'
              }}
            >
              <div style={{ minWidth: '120px', flex: '1 1 120px', maxWidth: '200px' }}>
                <Select
                  className="react-select primary"
                  classNamePrefix="react-select"
                  value={pageSelect}
                  onChange={(val) => {
                    gotoPage(val.value);
                    setPageSelect(val);
                  }}
                  options={pageSelectOptions}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              <div style={{ minWidth: '120px', flex: '1 1 120px', maxWidth: '200px' }}>
                <Select
                  className="react-select primary"
                  classNamePrefix="react-select"
                  value={numberOfRows}
                  onChange={(val) => {
                    setPageSize(val.value);
                    setNumberOfRows(val);
                  }}
                  options={rowsOptions}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
            </div>

            <div className="-next rt-pagination-btn">
              <button
                type="button"
                onClick={nextPage}
                disabled={!canNextPage}
                className="-btn"
                style={{ width: '100%', minWidth: '80px' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {/* TABLA CON SCROLL HORIZONTAL */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: 'touch' }}>
          <table
            {...getTableProps()}
            className="rt-table"
            style={{ minWidth: "800px", width: '100%' }}
          >
            <thead className="rt-thead -header">
              {headerGroups.map((group) => (
                <tr {...group.getHeaderGroupProps()} className="rt-tr">
                  {group.headers.map((column, key) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={classnames("rt-th", {
                        "-sort-asc": column.isSorted && !column.isSortedDesc,
                        "-sort-desc": column.isSorted && column.isSortedDesc,
                      })}
                    >
                      <div>{column.render("Header")}</div>
                      {key !== group.headers.length - 1 &&
                        column.canFilter &&
                        column.render("Filter")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody {...getTableBodyProps()} className="rt-tbody">
              {page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    className={classnames("rt-tr", {
                      "-odd": i % 2 === 0,
                      "-even": i % 2 === 1,
                    })}
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="rt-td">
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Table;