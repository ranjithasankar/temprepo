import React, { Component, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './App.css'


const Sample = (props:any) => {
    let gridApi :any;
    let columnApi :any;

   let columnDefs = [
        { headerName: "Make", field: "make", colId: "make" },
        { headerName: "Model", field: "model", colId: "model" },
        { headerName: "Price", field: "price", colId: "price" }
      ]

     let  defaultColDef ={
        filter: true,
        sortable: true,
        enableRowGroup: true
      }

  //let [rowDat,setRowDat] =useState([])
  let rowDat = [
      { make: 'Alfa Romeo', model: 'A', price: 10000 },
      { make: 'BMW', model: 'B', price: 20000 },
      { make: 'Citroen', model: 'C', price: 30000 }
    ];
  const onGridReady = (params:any) => {
  gridApi = params.api;
  columnApi = params.columnApi;

    params.api.sizeColumnsToFit();

    // fetch('https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/sample-data/rowData.json')
    //   .then(result => result.json())
    //   .then(row => setRowDat(row) )
    //   .catch(err => console.log(err));
    // const testData = [
    //   { make: 'Alfa Romeo', model: 'A', price: 10000 },
    //   { make: 'BMW', model: 'B', price: 20000 },
    //   { make: 'Citroen', model: 'C', price: 30000 }
    // ];
    // rowDat=testData
  };

  const  selectAllBtnHandler = (bool : boolean) => {
    if (bool) {
      gridApi.selectAll();
    } else {
      gridApi.deselectAll();
    }
  }

  const filterBtnHandler = (colId : any , value:any ) => {
    if (!colId && !value) {
      gridApi.setFilterModel(null);
      return;
    }
    var filterInstance = gridApi.getFilterInstance(colId);
    filterInstance.setModel({ values: [value] });
    gridApi.onFilterChanged();
  }

  const sortBtnHandler = (colId :any , sort:any ) => {
    if (!colId && !sort) {
      gridApi.setSortModel(null);
      return;
    }
    gridApi.setSortModel([{ colId, sort }]);
  }

  
    return (
      <div className="app-component">
        <div className="actions-panel">
          <button id="selectAll" onClick={() => selectAllBtnHandler(true)}>Select All Rows</button>
          <button id="deSelectAll" onClick={() => selectAllBtnHandler(false)}>Deselect All Rows</button>
          <button id="filterByPorsche" onClick={() => filterBtnHandler('make', 'Porsche')}>Filter By Porsche</button>
          <button id="removeFilters" onClick={() =>filterBtnHandler(null, null)}>Remove All Filters</button>
          <button id="sortByPriceAsc" onClick={() => sortBtnHandler('price', 'asc')}>Sort By Price (asc)</button>
          <button id="sortByPriceDesc" onClick={() =>sortBtnHandler('price', 'desc')}>Sort By Price (desc)</button>
          <button id="removeSort" onClick={() => sortBtnHandler(null,null)}>Remove All Sorting</button>
        </div>
        <div
          className="ag-theme-alpine"
          style={{
            height: 500,
          }}>
          <AgGridReact
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowData={rowDat}
            onGridReady={onGridReady}
            ensureDomOrder
            suppressColumnVirtualisation />
        </div>
      </div >
    );
  }


export default Sample;
