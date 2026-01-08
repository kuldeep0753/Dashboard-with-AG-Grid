import React, { useMemo, useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./Dashboard.css";
import employeesData from "../data/employees.json";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Dashboard() {
  const [rowData] = useState(employeesData.employees || []);
  const [pageSize, setPageSize] = useState(10);
  const gridRef = useRef(null);

  const columnDefs = useMemo(() => [
    { field: "id", headerName: "ID", width: 80 },
    {
      headerName: "Name",
      valueGetter: (p) => `${p.data.firstName || ""} ${p.data.lastName || ""}`,
      sortable: true,
      filter: true,
      flex: 1,
    },
    { field: "email", filter: true, flex: 1 },
    { field: "department", filter: true },
    { field: "position", filter: true },
    {
      field: "salary",
      filter: "agNumberColumnFilter",
      valueFormatter: (p) => (p.value ? `₹${Number(p.value).toLocaleString()}` : ""),
    },
    {
      field: "hireDate",
      headerName: "Hire Date",
      valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : ""),
    },
    { field: "location", filter: true },
    { field: "performanceRating", headerName: "Rating", filter: "agNumberColumnFilter" },
    { field: "projectsCompleted", headerName: "Projects", filter: "agNumberColumnFilter" },
    { field: "isActive", headerName: "Active", valueGetter: (p) => (p.data.isActive ? "Yes" : "No") },
    { field: "skills", valueGetter: (p) => (p.data.skills ? p.data.skills.join(", ") : "") },
    { field: "manager", filter: true },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  }), []);

  const updateResponsiveSettings = (width, api, columnApi) => {
    
    let newPageSize = 10;
    if (width >= 1400) newPageSize = 20;
    else if (width >= 900) newPageSize = 12;
    else if (width >= 600) newPageSize = 8;
    else newPageSize = 5;
    setPageSize(newPageSize);
    if (api && api.paginationSetPageSize) api.paginationSetPageSize(newPageSize);

    if (columnApi && columnApi.setColumnVisible) {
      const hideOnSmall = width < 600;
      columnApi.setColumnVisible('email', !hideOnSmall);
      columnApi.setColumnVisible('skills', !hideOnSmall);
      columnApi.setColumnVisible('projectsCompleted', !hideOnSmall);
      columnApi.setColumnVisible('manager', !hideOnSmall);
    }
  };

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      const api = gridRef.current?.api;
      const columnApi = gridRef.current?.columnApi;
      updateResponsiveSettings(width, api, columnApi);
      if (api && api.sizeColumnsToFit) api.sizeColumnsToFit();
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ padding: 24, background: "#0f172a", minHeight: "100vh" }}>
      <h1 style={{ color: "#e5e7eb", marginBottom: 16 }}>Employee Analytics Dashboard</h1>
      <div className="ag-theme-quartz grid-wrapper">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={pageSize}
          animateRows={true}
          onGridReady={(params) => {
            gridRef.current = params;
            updateResponsiveSettings(window.innerWidth, params.api, params.columnApi);
            if (params.api && params.api.sizeColumnsToFit) params.api.sizeColumnsToFit();
          }}
          domLayout="normal"
        />
      </div>
    </div>
  );
}
