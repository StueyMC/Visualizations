/**
 * @jest-environment jsdom
 */

const Tabulator = require("tabulator-tables");

describe("Simple test", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="initial-table"></div>';
  });

  it("should initialize a Tabulator table", () => {
    const table = new Tabulator("#initial-table", {
      data: [],
      columns: [
        { title: "Name", field: "name" },
        { title: "Acronym", field: "acronym" },
      ],
    });

    expect(table).toBeDefined();
    expect(document.querySelectorAll(".tabulator-cell").length).toBe(0);
  });

  it("should load data into the table", () => {
    const table = new Tabulator("#initial-table", {
      data: [
        { name: "Bristol", acronym: "BRS" },
        { name: "England", acronym: "ENG" },
      ],
      columns: [
        { title: "Name", field: "name" },
        { title: "Acronym", field: "acronym" },
      ],
      tableBuilt: function() {
        const rows = table.getRows();
        expect(rows.length).toBe(2);

        done();
      }
    });
  });
});
