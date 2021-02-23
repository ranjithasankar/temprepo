import React from 'react';
import App from './App';
import { AgGridReact } from 'ag-grid-react';
import { mount } from 'enzyme';

// ignore license errors
jest.spyOn(console, 'error').mockImplementation(() => { });
// grid warnings?
jest.spyOn(console, 'warn').mockImplementation(() => { });

const testData = [
  { make: 'Alfa Romeo', model: 'A', price: 10000 },
  { make: 'BMW', model: 'B', price: 20000 },
  { make: 'Citroen', model: 'C', price: 30000 }
];

const setRowData = (wrapper, rowData) => {
  return new Promise(function (resolve, reject) {
    wrapper.setState({ rowData }, () => {
      wrapper.update();
      resolve();
    });
  })
}

const ensureGridApiHasBeenSet = (wrapper) => {
  return new Promise(function (resolve, reject) {
    (function waitForGridReady() {
      if (wrapper.instance().gridApi) {
        resolve(wrapper);
        return;
      }
      setTimeout(waitForGridReady, 100);
    })();
  });
};

describe('Grid Actions Panel', () => {
  let wrapper = null;
  let agGridReact = null;

  beforeEach((done) => {
    wrapper = mount(<App />);
    agGridReact = wrapper.find(AgGridReact).instance();

    ensureGridApiHasBeenSet(wrapper)
      .then(() => setRowData(wrapper, testData))
      .then(() => done());
  });

  afterEach(() => {
    wrapper.unmount();
    wrapper = null;
    agGridReact = null;
  })

  it('renders without crashing', () => {
    expect(wrapper.find('.app-component>.actions-panel').exists()).toBeTruthy();
    expect(wrapper.find('.app-component>.ag-theme-alpine').exists()).toBeTruthy();
  });

  it('renders test rows', () => {
    // 1) Querying JSDOM
    // if you want to query the grid you'll need to use wrapper.render().find();
    // https://github.com/enzymejs/enzyme/issues/1233
    const gridRows = wrapper.render().find('.ag-center-cols-container .ag-row');
    const columns = wrapper.render().find('.ag-header-cell');
    console.log(gridRows.length)
    console.log(columns.length)

    for (let i = 0; i < gridRows.length; i++) {
      for (let j = 0; j < columns.length; j++) {
        console.log("inside for")
        const colId = gridRows[i].children[j].attribs['col-id'];
        const cellText = gridRows[i].children[j].children[0].data;
        const testValue = testData[i][colId].toString();
        console.log(cellText)
		console.log(testValue)
        expect(cellText).toEqual(testValue);
      }
    }
    // 2) Using ag-Grid's API
    agGridReact.api.forEachNode((node, nodeInd) => {
      Object.keys(node.data).forEach(colId => {
        console.log("inside for api test")
        const cellValue = node.data[colId];
        const testValue = testData[nodeInd][colId];
        expect(cellValue).toEqual(testValue);
      })
    });
  });

  it('selects all rows', () => {
    wrapper.find('#selectAll').simulate('click');

    // 1) querying JSDOM
    const selectedRowsDOM = wrapper.render().find('.ag-center-cols-container .ag-row.ag-row-selected');
    expect(selectedRowsDOM.length).toEqual(testData.length);
    // 2) using the grid API
    const selectedRowsAPI = agGridReact.api.getSelectedRows();
    expect(selectedRowsAPI.length).toEqual(testData.length);
  });

  it('deselects all rows', () => {
    agGridReact.api.selectAll();
    wrapper.find('#deSelectAll').simulate('click');

    // 1) querying JSDOM
    const unselectedRowsDOM = wrapper.render().find('.ag-center-cols-container .ag-row:not(.ag-row-selected)');
    expect(unselectedRowsDOM.length).toEqual(testData.length);
    // 2) using the grid API
    const selectedRowsAPI = agGridReact.api.getSelectedRows();
    expect(selectedRowsAPI.length).toEqual(0);
  });

  it(`filters "make" column by "Alfa Romeo"`, () => {
    wrapper.instance().filterBtnHandler("make", "Alfa Romeo");

    // 1) querying JSDOM
    const filteredCells = wrapper.render().find(`.ag-center-cols-container .ag-cell[col-id="make"]`)
    for (let i = 0; i < filteredCells.length; i++) {
      const cellText = filteredCells[i].children[0].data;
      expect(cellText).toEqual("Alfa Romeo")
    }
    // 2) using the grid API
    agGridReact.api.forEachNodeAfterFilter(node => {
      expect(node.data["make"]).toEqual("Alfa Romeo");
    });
  });

  it('clears filters', () => {
    wrapper.instance().filterBtnHandler("make", "Alfa Romeo");
    wrapper.find('#removeFilters').simulate('click');

    // 1) querying JSDOM
    // grid displays a filter icon in columns that are currently filtering
    expect(wrapper.render().find('.ag-header-cell-filtered').length).toEqual(0);
    // 2) using the grid API
    const filterModel = agGridReact.api.getFilterModel();
    expect(Object.keys(filterModel).length).toEqual(0);
  })

  it('Sorts by Price: ascending', () => {
    const sortedAscTestData = testData.sort((a, b) => a.price - b.price);
    wrapper.find('#sortByPriceAsc').simulate('click');

    // 1) querying JSDOM
    const gridRows = wrapper.render().find('.ag-center-cols-container .ag-row');
    for (let i = 0; i < gridRows.length; i++) {
      const cellText = gridRows[i].children[2].children[0].data;
      const testValue = testData[i]['price'].toString();
      expect(cellText).toEqual(testValue);
    }
    // 2) using the grid API
    agGridReact.api.forEachNodeAfterFilterAndSort((node, ind) => {
      expect(node.data.price).toEqual(sortedAscTestData[ind].price);
    });
  })

  it('Sorts by Price: descending', () => {
    const sortedDescTestData = testData.sort((a, b) => b.price - a.price);
    wrapper.find('#sortByPriceDesc').simulate('click');

    // 1) querying JSDOM
    const gridRows = wrapper.render().find('.ag-center-cols-container .ag-row');
    for (let i = 0; i < gridRows.length; i++) {

      const cellText = gridRows[i].children[2].children[0].data;
      const testValue = testData[i]['price'].toString();
      expect(cellText).toEqual(testValue);
		
    }
    // 2) using the grid API
    agGridReact.api.forEachNodeAfterFilterAndSort((node, ind) => {
      expect(node.data.price).toEqual(sortedDescTestData[ind].price);
    });
  })

  it('Removes all sorting', () => {
    wrapper.find('#sortByPriceAsc').simulate('click');
    wrapper.find('#removeSort').simulate('click');
    // 1) querying JSDOM
    const columns = wrapper.render().find('.ag-header-cell');
    expect(wrapper.render().find('.ag-header-cell-sorted-none').length).toEqual(columns.length);
    // 2) using the grid API
    const sortModel = agGridReact.api.getSortModel();
    expect(Object.keys(sortModel).length).toEqual(0);
  })
})
