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
   TABLA
========================= */

function Table({ columns, data }) {
  const [numberOfRows, setNumberOfRows] = React.useState({
    value: 10,
    label: "10 rows",
  });
  const [pageSelect, setPageSelect] = React.useState({
    value: 0,
    label: "Page 1",
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
    label: `Page ${index + 1}`,
  }));

  const rowsOptions = [5, 10, 20, 25, 50, 100].map((n) => ({
    value: n,
    label: `${n} filas`,
  }));

  return (
    <div className="ReactTable -striped -highlight primary-pagination">
      {/* PAGINACIÓN SUPERIOR */}
      <div className="pagination-top">
        <div className="-pagination">
          <div className="-previous">
            <button
              type="button"
              onClick={previousPage}
              disabled={!canPreviousPage}
              className="-btn"
            >
              Anterior
            </button>
          </div>

          <div className="-center">
            <Container>
              <Row className="justify-content-center">
                <Col md="4" sm="6" xs="12">
                  <Select
                    className="react-select primary"
                    classNamePrefix="react-select"
                    value={pageSelect}
                    onChange={(val) => {
                      gotoPage(val.value);
                      setPageSelect(val);
                    }}
                    options={pageSelectOptions}
                  />
                </Col>
                <Col md="4" sm="6" xs="12">
                  <Select
                    className="react-select primary"
                    classNamePrefix="react-select"
                    value={numberOfRows}
                    onChange={(val) => {
                      setPageSize(val.value);
                      setNumberOfRows(val);
                    }}
                    options={rowsOptions}
                  />
                </Col>
              </Row>
            </Container>
          </div>

          <div className="-next">
            <button
              type="button"
              onClick={nextPage}
              disabled={!canNextPage}
              className="-btn"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div style={{ overflowX: "auto" }}>
        <table
          {...getTableProps()}
          className="rt-table"
          style={{ minWidth: "1400px" }} // ajusta si agregas más columnas
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
  );
}

export default Table;
